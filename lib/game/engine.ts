import { GameState, AIResponse, Choice } from './types';
import { updateEmotionalProfile, determineStoryPhase, getChoiceBudgetForAge, getYearJumpForAge, shouldStoryEnd } from './state';
import { updateButterflyEffects } from './butterfly';
import { detectPatterns } from './patterns';
import { updateCallbacks } from './callbacks';

export function applyAIResponse(state: GameState, response: AIResponse, choiceId?: string, choiceText?: string): GameState {
  const newSceneCount = state.sceneCount + 1;
  const updatedScenes = [...state.scenes, response.scene];
  const sceneChoices = response.choices.map((choice) => ({
    ...choice,
    sceneIndex: newSceneCount,
  }));
  const updatedAllChoices = [...state.allChoices, ...sceneChoices];
  const updatedMadeChoices = choiceId
    ? [...state.madeChoices, { sceneIndex: state.sceneCount, choiceId, choiceText: choiceText || '', age: state.currentAge }]
    : state.madeChoices;

  const updatedEmotionalProfile = updateEmotionalProfile(state.emotionalProfile, response.emotionalShift as unknown as Record<string, number>);
  const updatedButterflyEffects = updateButterflyEffects(state, response.butterflyEffects);
  const updatedCallbacks = updateCallbacks(state, response.callbacks);
  const updatedDetectedPatterns = detectPatterns({
    ...state,
    emotionalProfile: updatedEmotionalProfile,
    madeChoices: updatedMadeChoices,
  });

  const updatedEndingSignals = mergeEndingSignals(state.endingSignals, response.endingSignals);

  const didMakeChoice = Boolean(choiceId);
  const choiceBudget = getChoiceBudgetForAge(state.currentAge);
  const pendingChoicesThisYear = didMakeChoice ? state.choicesThisYear + 1 : state.choicesThisYear;
  const yearAdvanced = didMakeChoice && pendingChoicesThisYear >= choiceBudget;
  const yearJump = getYearJumpForAge(state.currentAge);
  const nextAge = yearAdvanced ? state.currentAge + yearJump : state.currentAge;
  const nextChoicesThisYear = yearAdvanced ? 0 : pendingChoicesThisYear;

  const derivedState = {
    ...state,
    sceneCount: newSceneCount,
    currentAge: nextAge,
    choicesThisYear: nextChoicesThisYear,
    madeChoices: updatedMadeChoices,
    butterflyEffects: updatedButterflyEffects,
    callbacks: updatedCallbacks,
    endingSignals: updatedEndingSignals,
  } as GameState;

  const newPhase = determineStoryPhase(derivedState);
  const isComplete = shouldStoryEnd({ ...derivedState, storyPhase: newPhase } as GameState);

  return {
    ...state,
    scenes: updatedScenes,
    allChoices: updatedAllChoices,
    madeChoices: updatedMadeChoices,
    emotionalProfile: updatedEmotionalProfile,
    butterflyEffects: updatedButterflyEffects,
    callbacks: updatedCallbacks,
    detectedPatterns: updatedDetectedPatterns,
    endingSignals: updatedEndingSignals,
    currentAge: nextAge,
    choicesThisYear: nextChoicesThisYear,
    currentSceneIndex: newSceneCount,
    sceneCount: newSceneCount,
    storyPhase: newPhase,
    isComplete,
    updatedAt: Date.now(),
  };
}

function mergeEndingSignals(existing: GameState['endingSignals'], incoming: GameState['endingSignals']): GameState['endingSignals'] {
  const merged = [...existing];

  for (const signal of incoming) {
    const existingIdx = merged.findIndex(s => s.type === signal.type);
    if (existingIdx >= 0) {
      merged[existingIdx] = {
        ...merged[existingIdx],
        intensity: Math.min(1, merged[existingIdx].intensity + signal.intensity * 0.5),
        description: signal.description || merged[existingIdx].description,
      };
    } else {
      merged.push({ ...signal });
    }
  }

  return merged;
}

export function getLatestScene(state: GameState) {
  return state.scenes[state.scenes.length - 1] || null;
}

export function getCurrentChoices(state: GameState): Choice[] {
  if (!getLatestScene(state)) return [];

  const currentSceneChoices = state.allChoices.filter((choice) => choice.sceneIndex === state.sceneCount);
  if (currentSceneChoices.length > 0) return currentSceneChoices;

  return state.allChoices.slice(-4);
}

export function getSceneHistory(state: GameState, count: number = 5) {
  return state.scenes.slice(-count);
}
