import { loadRootDotEnv } from '@/lib/env';
import OpenAI from 'openai';
import { AIResponse, GameState } from './types';
import { buildSystemPrompt, buildFirstTurnPrompt, buildTurnPrompt } from './prompts';
import { validateAIResponse, validateChoiceNovelty } from './validators';

const MAX_RETRIES = 4;

function getClient(): OpenAI {
  loadRootDotEnv();
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;

  if (!apiKey) throw new Error('AI_API_KEY is not configured');

  if (provider === 'groq' || (!process.env.AI_API_KEY && process.env.GROQ_API_KEY)) {
    return new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  return new OpenAI({ apiKey });
}

function getModel(): string {
  loadRootDotEnv();
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  return provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4.1-mini';
}

export async function generateFirstTurn(state: GameState): Promise<AIResponse> {
  const prompt = buildFirstTurnPrompt(state.playerProfile);
  return callAI(prompt);
}

export async function generateTurn(
  state: GameState,
  choiceId?: string,
  choiceText?: string,
  isForcedContinue?: boolean
): Promise<AIResponse> {
  const prompt = buildTurnPrompt(state, choiceId, choiceText, isForcedContinue);
  return callAI(prompt, state);
}

export async function callAI(userPrompt: string, state?: GameState): Promise<AIResponse> {
  const client = getClient();
  const model = getModel();

  let lastError: Error | null = null;
  const rejectionNotes: string[] = [];

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const promptWithRetryNotes = rejectionNotes.length > 0
        ? `${userPrompt}\n\nPREVIOUS ATTEMPTS WERE REJECTED:\n${rejectionNotes.map((note) => `- ${note}`).join('\n')}\nGenerate a fresh scene response with choices that are major life decisions, use different actions, people, stakes, and wording, and would still matter several years later.`
        : userPrompt;

      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: promptWithRetryNotes },
        ],
        temperature: 1,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from AI');

      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error('AI returned invalid JSON');
      }

      const validation = validateAIResponse(parsed);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.error}`);
      }

      if (state) {
        const novelty = validateChoiceNovelty(validation.data!, state);
        if (!novelty.valid) {
          throw new Error(`Choice novelty failed: ${novelty.error}`);
        }
      }

      return validation.data!;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (lastError.message.includes('API key') || lastError.message.includes('auth') || lastError.message.includes('API_KEY')) {
        throw lastError;
      }

      if (
        lastError.message.includes('Choice novelty failed') ||
        lastError.message.includes('Choices are too repetitive') ||
        lastError.message.includes('Choices are too small')
      ) {
        rejectionNotes.push(lastError.message);
      }

      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 500 * attempt));
      }
    }
  }

  throw lastError || new Error('AI generation failed after retries');
}

export async function checkAIHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    loadRootDotEnv();
    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) return { healthy: false, error: 'AI_API_KEY not configured' };

    const client = getClient();
    await client.chat.completions.create({
      model: getModel(),
      messages: [{ role: 'user', content: 'Say ok' }],
      max_tokens: 5,
    });
    return { healthy: true };
  } catch (err) {
    return { healthy: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
