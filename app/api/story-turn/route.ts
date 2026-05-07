import { NextRequest, NextResponse } from 'next/server';
import { generateFirstTurn, generateTurn, callAI } from '@/lib/game/ai';
import { applyAIResponse } from '@/lib/game/engine';
import { createInitialState, normalizeGameState, SOFT_CHOICE_CAP } from '@/lib/game/state';
import { buildEndingPrompt } from '@/lib/game/ending';
import { validatePlayerProfile } from '@/lib/game/validators';
import { GameState, AIResponse, StoryTurnRequest } from '@/lib/game/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as StoryTurnRequest & { playerProfile?: GameState['playerProfile'] };

    if (body.playerProfile && body.gameState.sceneCount === 0) {
      const profileValidation = validatePlayerProfile(body.playerProfile);
      if (!profileValidation.valid) {
        return NextResponse.json({ success: false, error: profileValidation.error }, { status: 400 });
      }

      const state = createInitialState(body.playerProfile);
      const aiResponse = await generateFirstTurn(state);
      const newState = applyAIResponse(state, aiResponse);

      return NextResponse.json({ success: true, gameState: newState });
    }

    const state = normalizeGameState(body.gameState as GameState);
    if (!state || !state.playerProfile) {
      return NextResponse.json({ success: false, error: 'Invalid game state' }, { status: 400 });
    }

    if (state.isComplete) {
      return NextResponse.json({ success: false, error: 'Story is complete' }, { status: 400 });
    }

    let aiResponse: AIResponse;
    let endingExtras: Record<string, unknown> | null = null;

    if (
      state.storyPhase === 'ending' ||
      state.currentAge >= 80 ||
      state.madeChoices.length >= SOFT_CHOICE_CAP ||
      (state.sceneCount > 15 && state.endingSignals.some(s => s.intensity > 0.6))
    ) {
      const endingPrompt = buildEndingPrompt(state);
      const rawResponse = await callAI(endingPrompt);
      aiResponse = rawResponse;

      const rawParsed = (rawResponse as unknown as Record<string, unknown>);
      endingExtras = {
        finalLine: rawParsed.finalLine || null,
        dominantPattern: rawParsed.dominantPattern || null,
        emotionalReveal: rawParsed.emotionalReveal || null,
        butterflyEchoes: rawParsed.butterflyEchoes || null,
        callbackResolutions: rawParsed.callbackResolutions || null,
      };
    } else {
      aiResponse = await generateTurn(state, body.choiceId, body.choiceText, body.isForcedContinue);
    }

    const newState = applyAIResponse(state, aiResponse, body.choiceId, body.choiceText);

    const response: Record<string, unknown> = { success: true, gameState: newState };
    if (endingExtras) {
      response.endingData = endingExtras;
    }

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('story-turn error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
