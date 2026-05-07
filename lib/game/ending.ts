import { GameState } from './types';

export interface EndingResult {
  narrationLines: string[];
  finalLine: string;
  dominantPattern: string;
  emotionalReveal: string;
  butterflyEchoes: string[];
  callbackResolutions: string[];
}

export function generateEndingContext(state: GameState): string {
  const dominantPatterns = state.detectedPatterns
    .filter(p => p.confidence > 0.4)
    .sort((a, b) => b.confidence - a.confidence);

  const topPattern = dominantPatterns[0];
  const secondPattern = dominantPatterns[1];

  const returnedButterflies = state.butterflyEffects.filter(b => b.hasReturned);
  const unresolvedButterflies = state.butterflyEffects.filter(b => !b.hasReturned && b.currentIntensity > 0.3);

  const resolvedCallbacks = state.callbacks.filter(c => c.hasResolved);
  const unresolvedCallbacks = state.callbacks.filter(c => !c.hasResolved);

  const highEndingSignals = state.endingSignals.filter(s => s.intensity > 0.5);

  let context = '';

  context += `DOMINANT PATTERN: ${topPattern?.type.replace(/_/g, ' ') || 'none'} (${(topPattern?.confidence || 0) * 100}%)\n`;
  if (secondPattern) {
    context += `SECONDARY PATTERN: ${secondPattern.type.replace(/_/g, ' ')} (${secondPattern.confidence * 100}%)\n`;
  }

  context += `\nEMOTIONAL STATE:\n`;
  const ep = state.emotionalProfile;
  const sorted = Object.entries(ep).sort(([, a], [, b]) => Math.abs(b - 0.5) - Math.abs(a - 0.5));
  sorted.forEach(([k, v]) => {
    if (Math.abs(v - 0.5) > 0.1) context += `  ${k}: ${v.toFixed(2)}\n`;
  });

  if (returnedButterflies.length > 0) {
    context += `\nBUTTERFLIES THAT RETURNED:\n`;
    returnedButterflies.forEach(b => context += `  - ${b.description}\n`);
  }

  if (unresolvedButterflies.length > 0) {
    context += `\nUNRESOLVED BUTTERFLIES:\n`;
    unresolvedButterflies.forEach(b => context += `  - ${b.description}\n`);
  }

  if (resolvedCallbacks.length > 0) {
    context += `\nRESOLVED THREADS:\n`;
    resolvedCallbacks.forEach(c => context += `  - ${c.description}\n`);
  }

  if (unresolvedCallbacks.length > 0) {
    context += `\nUNRESOLVED THREADS:\n`;
    unresolvedCallbacks.forEach(c => context += `  - ${c.description}\n`);
  }

  if (highEndingSignals.length > 0) {
    context += `\nENDING SIGNALS:\n`;
    highEndingSignals.forEach(s => context += `  - ${s.type}: ${s.description}\n`);
  }

  context += `\nALL CHOICES:\n`;
  state.madeChoices.forEach(c => context += `  - "${c.choiceText}"\n`);

  return context;
}

export function buildEndingPrompt(state: GameState): string {
  const context = generateEndingContext(state);

  const randomSeed = Math.random().toString(36).slice(2, 8);

  return `Write the FINAL SCENE. This is the ending. Make it UNIQUE — no two players should get the same ending.

${context}

CURRENT AGE: ${state.currentAge}
TOTAL CHOICES: ${state.madeChoices.length}

ENDING RULES - CRITICAL:
- This ending must be SPECIFIC to this player's choices and patterns. Not generic.
- NO good/bad binary. This reveals WHO they became through their specific actions.
- Reference SPECIFIC choices they made by quoting them
- Reference SPECIFIC butterfly effects and callbacks
- The final line must be devastating in its simplicity — one short sentence
- Write like a human, not AI. No "crossroads", no "journey", no "weight of decisions"
- 4-6 narration lines. Short. Punchy. Specific.
- The ending should feel like it was written for THIS person, not any person
- Use concrete details from their life: their name, their work, their specific fears
- Unresolved threads should stay unresolved — that's real life
- The finalLine must be a single devastating sentence that captures their whole arc

UNIQUENESS SEED: ${randomSeed} — use this to ensure this ending is different from any other.

Return ONLY valid JSON:
{
  "scene": {
    "title": "ending title",
    "narrationLines": ["line1", "line2", ...],
    "environment": "",
    "mood": "dark",
    "cinematicMoment": "",
    "relationshipMoment": "",
    "memoryObject": ""
  },
  "choices": [],
  "butterflyEffects": [],
  "callbacks": [],
  "emotionalShift": {"honesty":0,"avoidance":0,"fear":0,"perfectionism":0,"isolation":0,"connection":0,"selfSabotage":0,"riskTaking":0,"emotionalSuppression":0,"consistency":0},
  "endingSignals": [],
  "dominantPattern": "pattern_name",
  "emotionalReveal": "one sentence: what this ending reveals about who they became",
  "butterflyEchoes": ["specific echo 1", "specific echo 2"],
  "callbackResolutions": ["specific resolution 1"],
  "finalLine": "one devastating sentence"
}`;
}
