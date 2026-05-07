import { DetectedPattern, PatternType, GameState, Choice } from './types';

const PATTERN_RULES: { type: PatternType; detect: (state: GameState) => { confidence: number; evidence: string } }[] = [
  {
    type: 'starts_not_finishes',
    detect: (state) => {
      const recent = state.madeChoices.slice(-8);
      const avoidanceChoices = recent.filter(c => c.choiceText.toLowerCase().match(/start|begin|try/));
      const completionChoices = recent.filter(c => c.choiceText.toLowerCase().match(/finish|complete|send|submit/));
      const ratio = avoidanceChoices.length > 0 ? completionChoices.length / avoidanceChoices.length : 0;
      if (ratio < 0.4 && avoidanceChoices.length >= 2) {
        return { confidence: Math.min(1, 0.5 + (1 - ratio) * 0.3), evidence: 'Player repeatedly starts but rarely completes' };
      }
      return { confidence: 0, evidence: '' };
    },
  },
  {
    type: 'keeps_avoiding',
    detect: (state) => {
      const recent = state.madeChoices.slice(-6);
      const avoidCount = recent.filter(c =>
        c.choiceText.toLowerCase().match(/avoid|skip|not|don't|ignore|leave|walk away|nothing/)
      ).length;
      if (avoidCount >= 3) {
        return { confidence: Math.min(1, avoidCount * 0.2), evidence: `Avoided ${avoidCount} of last 6 choices` };
      }
      return { confidence: 0, evidence: '' };
    },
  },
  {
    type: 'isolates_self',
    detect: (state) => {
      const recent = state.madeChoices.slice(-8);
      const isolateCount = recent.filter(c =>
        c.choiceText.toLowerCase().match(/alone|stay|quiet|don't answer|ignore|leave|by myself/)
      ).length;
      if (isolateCount >= 3) {
        return { confidence: Math.min(1, isolateCount * 0.2), evidence: `Chose isolation ${isolateCount} times recently` };
      }
      return { confidence: 0, evidence: '' };
    },
  },
  {
    type: 'perfectionism_loop',
    detect: (state) => {
      const ep = state.emotionalProfile;
      if (ep.perfectionism > 0.6 && ep.startsNotFinishes > 0.4) {
        return { confidence: (ep.perfectionism + ep.startsNotFinishes) / 2, evidence: 'High perfectionism + starts-not-finishes pattern' };
      }
      return { confidence: 0, evidence: '' };
    },
  },
  {
    type: 'chooses_connection',
    detect: (state) => {
      const recent = state.madeChoices.slice(-8);
      const connectCount = recent.filter(c =>
        c.choiceText.toLowerCase().match(/call|talk|tell|ask|share|reach|open|honest|together/)
      ).length;
      if (connectCount >= 4) {
        return { confidence: Math.min(1, connectCount * 0.15), evidence: `Chose connection ${connectCount} times recently` };
      }
      return { confidence: 0, evidence: '' };
    },
  },
  {
    type: 'self_sabotage',
    detect: (state) => {
      const ep = state.emotionalProfile;
      if (ep.selfSabotage > 0.5 && ep.fear > 0.4) {
        return { confidence: (ep.selfSabotage + ep.fear) / 2, evidence: 'Self-sabotage elevated alongside fear' };
      }
      return { confidence: 0, evidence: '' };
    },
  },
  {
    type: 'fear_of_being_seen',
    detect: (state) => {
      const recent = state.madeChoices.slice(-8);
      const hideCount = recent.filter(c =>
        c.choiceText.toLowerCase().match(/hide|don't tell|keep.*secret|not yet|wait|not ready|delete|erase/)
      ).length;
      if (hideCount >= 3) {
        return { confidence: Math.min(1, hideCount * 0.2), evidence: `Chose hiding ${hideCount} times recently` };
      }
      return { confidence: 0, evidence: '' };
    },
  },
  {
    type: 'emotional_avoidance',
    detect: (state) => {
      const ep = state.emotionalProfile;
      if (ep.emotionalSuppression > 0.5 && ep.avoidance > 0.5) {
        return { confidence: (ep.emotionalSuppression + ep.avoidance) / 2, evidence: 'Emotional suppression + avoidance both elevated' };
      }
      return { confidence: 0, evidence: '' };
    },
  },
  {
    type: 'waits_for_permission',
    detect: (state) => {
      const recent = state.madeChoices.slice(-8);
      const waitCount = recent.filter(c =>
        c.choiceText.toLowerCase().match(/wait|ask.*first|maybe later|not sure|think about|should i/)
      ).length;
      if (waitCount >= 3) {
        return { confidence: Math.min(1, waitCount * 0.2), evidence: `Waited for permission ${waitCount} times` };
      }
      return { confidence: 0, evidence: '' };
    },
  },
  {
    type: 'consistent_small_actions',
    detect: (state) => {
      const ep = state.emotionalProfile;
      if (ep.consistency > 0.6 && ep.honesty > 0.5) {
        return { confidence: (ep.consistency + ep.honesty) / 2, evidence: 'Consistent honest small actions detected' };
      }
      return { confidence: 0, evidence: '' };
    },
  },
];

export function detectPatterns(state: GameState): DetectedPattern[] {
  const existing = [...state.detectedPatterns];
  const updated: DetectedPattern[] = [];

  for (const rule of PATTERN_RULES) {
    const result = rule.detect(state);
    const existingPattern = existing.find(p => p.type === rule.type);

    if (result.confidence > 0.3) {
      if (existingPattern) {
        const newConfidence = existingPattern.confidence * 0.6 + result.confidence * 0.4;
        updated.push({
          ...existingPattern,
          confidence: Math.min(1, newConfidence),
          evidence: [...existingPattern.evidence, result.evidence].slice(-5),
        });
      } else {
        updated.push({
          type: rule.type,
          confidence: result.confidence,
          evidence: [result.evidence],
          firstDetectedScene: state.sceneCount,
        });
      }
    } else if (existingPattern) {
      updated.push({
        ...existingPattern,
        confidence: existingPattern.confidence * 0.85,
      });
    }
  }

  return updated.filter(p => p.confidence > 0.15);
}

export function getDominantPatterns(state: GameState): DetectedPattern[] {
  return state.detectedPatterns
    .filter(p => p.confidence > 0.4)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

export function formatPatternContext(state: GameState): string {
  const dominant = getDominantPatterns(state);
  if (dominant.length === 0) return 'No strong patterns detected yet.';

  return dominant.map(p =>
    `- ${p.type.replace(/_/g, ' ')} (confidence: ${(p.confidence * 100).toFixed(0)}%): ${p.evidence[p.evidence.length - 1]}`
  ).join('\n');
}
