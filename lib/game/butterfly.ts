import { ButterflyEffect, GameState } from './types';

export function updateButterflyEffects(state: GameState, newEffects: ButterflyEffect[]): ButterflyEffect[] {
  const existing = [...state.butterflyEffects];

  for (const effect of newEffects) {
    const existingIdx = existing.findIndex(e => e.id === effect.id);
    if (existingIdx >= 0) {
      existing[existingIdx] = {
        ...existing[existingIdx],
        currentIntensity: Math.min(1, existing[existingIdx].currentIntensity + effect.currentIntensity * 0.3),
      };
    } else {
      existing.push({ ...effect, originSceneIndex: state.sceneCount });
    }
  }

  return existing.map(e => {
    const age = state.sceneCount - e.originSceneIndex;
    const shouldReturn = !e.hasReturned && age >= 3 && e.currentIntensity >= 0.4 && Math.random() < age * 0.08;
    if (shouldReturn) {
      return { ...e, hasReturned: true, returnSceneIndex: state.sceneCount };
    }
    return e;
  });
}

export function getActiveButterflies(state: GameState): ButterflyEffect[] {
  return state.butterflyEffects.filter(e => e.currentIntensity > 0.2);
}

export function getReturnedButterflies(state: GameState): ButterflyEffect[] {
  return state.butterflyEffects.filter(e => e.hasReturned);
}

export function getUnresolvedButterflies(state: GameState): ButterflyEffect[] {
  return state.butterflyEffects.filter(e => !e.hasReturned && e.currentIntensity > 0.3);
}

export function formatButterflyContext(state: GameState): string {
  const active = getActiveButterflies(state);
  const returned = getReturnedButterflies(state);

  let context = '';
  if (active.length > 0) {
    context += 'Active unresolved consequences:\n';
    active.forEach(e => {
      context += `- ${e.description} (intensity: ${e.currentIntensity.toFixed(2)}, from scene ${e.originSceneIndex})\n`;
    });
  }
  if (returned.length > 0) {
    context += 'Consequences that have returned:\n';
    returned.forEach(e => {
      context += `- ${e.description} (returned at scene ${e.returnSceneIndex})\n`;
    });
  }
  return context;
}
