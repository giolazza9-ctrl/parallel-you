import { Callback, GameState } from './types';

export function updateCallbacks(state: GameState, newCallbacks: Callback[]): Callback[] {
  const existing = [...state.callbacks];

  for (const cb of newCallbacks) {
    const existingIdx = existing.findIndex(c => c.id === cb.id);
    if (existingIdx >= 0) {
      existing[existingIdx] = {
        ...existing[existingIdx],
        emotionalWeight: Math.min(1, existing[existingIdx].emotionalWeight + cb.emotionalWeight * 0.2),
      };
    } else {
      existing.push({ ...cb, referenceSceneIndex: state.sceneCount });
    }
  }

  return existing.map(c => {
    const age = state.sceneCount - c.referenceSceneIndex;
    const shouldResolve = !c.hasResolved && age >= 4 && c.emotionalWeight >= 0.4 && Math.random() < age * 0.06;
    if (shouldResolve) {
      return { ...c, hasResolved: true, resolveSceneIndex: state.sceneCount };
    }
    return c;
  });
}

export function getUnresolvedCallbacks(state: GameState): Callback[] {
  return state.callbacks.filter(c => !c.hasResolved && c.emotionalWeight > 0.3);
}

export function getResolvedCallbacks(state: GameState): Callback[] {
  return state.callbacks.filter(c => c.hasResolved);
}

export function formatCallbackContext(state: GameState): string {
  const unresolved = getUnresolvedCallbacks(state);
  const resolved = getResolvedCallbacks(state);

  let context = '';
  if (unresolved.length > 0) {
    context += 'Unresolved emotional threads:\n';
    unresolved.forEach(c => {
      context += `- ${c.description} (weight: ${c.emotionalWeight.toFixed(2)}, from scene ${c.referenceSceneIndex})\n`;
    });
  }
  if (resolved.length > 0) {
    context += 'Resolved emotional threads:\n';
    resolved.forEach(c => {
      context += `- ${c.description} (resolved at scene ${c.resolveSceneIndex})\n`;
    });
  }
  return context;
}
