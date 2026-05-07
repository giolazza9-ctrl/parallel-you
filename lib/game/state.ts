import { GameState, PlayerProfile, EmotionalProfile } from './types';

export const MIN_ENDING_AGE = 80;
export const MAX_ENDING_AGE = 100;
export const SOFT_CHOICE_CAP = 30;
export const HARD_CHOICE_CAP = 40;
export const CHOICES_PER_AGE_WINDOW = 1;
export const YEAR_JUMP_MIN = 4;
export const YEAR_JUMP_MAX = 6;

export function createInitialState(profile: PlayerProfile): GameState {
  return {
    playerProfile: profile,
    currentSceneIndex: 0,
    currentAge: profile.age,
    choicesThisYear: 0,
    scenes: [],
    allChoices: [],
    madeChoices: [],
    butterflyEffects: [],
    callbacks: [],
    emotionalProfile: createDefaultEmotionalProfile(),
    detectedPatterns: [],
    relationships: [],
    endingSignals: [],
    storyPhase: 'introduction',
    sceneCount: 0,
    isComplete: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function createDefaultEmotionalProfile(): EmotionalProfile {
  return {
    honesty: 0.5,
    avoidance: 0.3,
    fear: 0.3,
    perfectionism: 0.3,
    isolation: 0.3,
    connection: 0.5,
    selfSabotage: 0.2,
    riskTaking: 0.3,
    emotionalSuppression: 0.3,
    consistency: 0.5,
    burnout: 0.2,
    startsNotFinishes: 0.2,
  };
}

export function updateEmotionalProfile(
  current: EmotionalProfile,
  shift: Record<string, number>
): EmotionalProfile {
  const updated = { ...current };
  for (const [key, delta] of Object.entries(shift)) {
    if (key in updated) {
      (updated as Record<string, number>)[key] = Math.max(0, Math.min(1, (updated as Record<string, number>)[key] + delta));
    }
  }
  return updated;
}

export function normalizeGameState(raw: GameState): GameState {
  const baseAge = raw.currentAge ?? raw.playerProfile.age;
  const choicesThisYear = raw.choicesThisYear ?? 0;
  const madeChoices = (raw.madeChoices || []).map((choice, index) => ({
    ...choice,
    age: choice.age ?? Math.min(baseAge, raw.playerProfile.age + index * YEAR_JUMP_MIN),
  }));

  return {
    ...raw,
    currentAge: Math.max(raw.playerProfile.age, baseAge),
    choicesThisYear: Math.max(0, choicesThisYear),
    madeChoices,
  };
}

export function getChoiceBudgetForAge(currentAge: number): number {
  return CHOICES_PER_AGE_WINDOW;
}

export function getYearJumpForAge(currentAge: number): number {
  return currentAge % 2 === 0 ? YEAR_JUMP_MIN : YEAR_JUMP_MAX;
}

export function determineStoryPhase(state: GameState): GameState['storyPhase'] {
  const choiceCount = state.madeChoices.length;
  const currentAge = state.currentAge ?? state.playerProfile.age;

  if (currentAge >= MIN_ENDING_AGE || choiceCount >= SOFT_CHOICE_CAP) return 'ending';
  if (choiceCount < 4) return 'introduction';
  if (choiceCount < 10) return 'rising';
  if (choiceCount < 18) return 'complexity';
  if (choiceCount < 26) return 'climax';
  return 'resolution';
}

export function shouldStoryEnd(state: GameState): boolean {
  const currentAge = state.currentAge ?? state.playerProfile.age;
  const choiceCount = state.madeChoices.length;

  if (currentAge < MIN_ENDING_AGE && choiceCount < HARD_CHOICE_CAP) return false;
  if (currentAge >= MAX_ENDING_AGE) return true;
  if (choiceCount >= HARD_CHOICE_CAP) return true;

  const unresolvedButterflies = state.butterflyEffects.filter(b => !b.hasReturned && b.currentIntensity > 0.5);
  const unresolvedCallbacks = state.callbacks.filter(c => !c.hasResolved);
  const highEndingSignals = state.endingSignals.filter(s => s.intensity > 0.6);

  if (currentAge < MIN_ENDING_AGE) return false;
  if (unresolvedButterflies.length > 2 && choiceCount < HARD_CHOICE_CAP - 2 && currentAge < MAX_ENDING_AGE - 2) return false;
  if (unresolvedCallbacks.length > 1 && choiceCount < HARD_CHOICE_CAP - 4 && currentAge < MAX_ENDING_AGE - 4) return false;

  return highEndingSignals.length >= 2 || state.storyPhase === 'ending' || choiceCount >= SOFT_CHOICE_CAP;
}
