import { AIResponse, Choice, EmotionalShift, ButterflyEffect, Callback, EndingSignal, GameState } from './types';

export function validateAIResponse(raw: unknown): { valid: boolean; data?: AIResponse; error?: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Response is not an object' };
  }

  const obj = raw as Record<string, unknown>;

  if (!obj.scene || typeof obj.scene !== 'object') {
    return { valid: false, error: 'Missing or invalid scene' };
  }

  const scene = obj.scene as Record<string, unknown>;
  if (!Array.isArray(scene.narrationLines) || scene.narrationLines.length === 0) {
    return { valid: false, error: 'Scene must have narrationLines array' };
  }

  if (!Array.isArray(obj.choices) || obj.choices.length === 0) {
    return { valid: false, error: 'Must have at least one choice' };
  }

  for (const choice of obj.choices as unknown[]) {
    if (!choice || typeof choice !== 'object') {
      return { valid: false, error: 'Invalid choice format' };
    }
    const c = choice as Record<string, unknown>;
    if (typeof c.text !== 'string' || typeof c.id !== 'string') {
      return { valid: false, error: 'Choice must have text and id' };
    }
  }

  const choiceTexts = (obj.choices as Record<string, unknown>[])
    .map((choice) => String(choice.text || ''))
    .filter(Boolean);

  if (hasNearDuplicateChoices(choiceTexts)) {
    return { valid: false, error: 'Choices are too repetitive within the same response' };
  }

  const response: AIResponse = {
    scene: {
      title: String(scene.title || ''),
      narrationLines: (scene.narrationLines as string[]).map(String),
      environment: String(scene.environment || ''),
      mood: String(scene.mood || ''),
      cinematicMoment: String(scene.cinematicMoment || ''),
      relationshipMoment: String(scene.relationshipMoment || ''),
      memoryObject: String(scene.memoryObject || ''),
    },
    choices: (obj.choices as Choice[]).map(c => ({
      id: String(c.id),
      text: String(c.text),
      emotionalTag: String(c.emotionalTag || ''),
      isQuiet: Boolean(c.isQuiet),
    })),
    butterflyEffects: Array.isArray(obj.butterflyEffects) ? (obj.butterflyEffects as Record<string, unknown>[]).map(normalizeButterfly) : [],
    callbacks: Array.isArray(obj.callbacks) ? (obj.callbacks as Record<string, unknown>[]).map(normalizeCallback) : [],
    emotionalShift: normalizeEmotionalShift(obj.emotionalShift),
    endingSignals: Array.isArray(obj.endingSignals) ? (obj.endingSignals as Record<string, unknown>[]).map(normalizeEndingSignal) : [],
  };

  return { valid: true, data: response };
}

function normalizeButterfly(b: Record<string, unknown>): ButterflyEffect {
  return {
    id: String(b.id || `bf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
    originSceneIndex: Number(b.originSceneIndex || 0),
    description: String(b.description || ''),
    currentIntensity: Number(b.currentIntensity || 0.5),
    hasReturned: Boolean(b.hasReturned),
    returnSceneIndex: b.returnSceneIndex != null ? Number(b.returnSceneIndex) : undefined,
    relatedChoiceId: b.relatedChoiceId != null ? String(b.relatedChoiceId) : undefined,
    emotionalTag: String(b.emotionalTag || ''),
  };
}

function normalizeCallback(c: Record<string, unknown>): Callback {
  return {
    id: String(c.id || `cb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
    referenceSceneIndex: Number(c.referenceSceneIndex || 0),
    description: String(c.description || ''),
    emotionalWeight: Number(c.emotionalWeight || 0.5),
    hasResolved: Boolean(c.hasResolved),
    resolveSceneIndex: c.resolveSceneIndex != null ? Number(c.resolveSceneIndex) : undefined,
  };
}

function normalizeEmotionalShift(e: unknown): EmotionalShift {
  if (!e || typeof e !== 'object') {
    return { honesty: 0, avoidance: 0, fear: 0, perfectionism: 0, isolation: 0, connection: 0, selfSabotage: 0, riskTaking: 0, emotionalSuppression: 0, consistency: 0 };
  }
  const obj = e as Record<string, unknown>;
  return {
    honesty: clamp(Number(obj.honesty || 0)),
    avoidance: clamp(Number(obj.avoidance || 0)),
    fear: clamp(Number(obj.fear || 0)),
    perfectionism: clamp(Number(obj.perfectionism || 0)),
    isolation: clamp(Number(obj.isolation || 0)),
    connection: clamp(Number(obj.connection || 0)),
    selfSabotage: clamp(Number(obj.selfSabotage || 0)),
    riskTaking: clamp(Number(obj.riskTaking || 0)),
    emotionalSuppression: clamp(Number(obj.emotionalSuppression || 0)),
    consistency: clamp(Number(obj.consistency || 0)),
  };
}

function normalizeEndingSignal(s: Record<string, unknown>): EndingSignal {
  return {
    type: String(s.type || ''),
    intensity: clamp(Number(s.intensity || 0)),
    description: String(s.description || ''),
  };
}

function clamp(v: number, min = -0.3, max = 0.3): number {
  return Math.max(min, Math.min(max, v));
}

export function validateChoiceNovelty(response: AIResponse, state: GameState): { valid: boolean; error?: string } {
  if (response.choices.length === 0) return { valid: true };

  const previousChoices = state.allChoices
    .map((choice) => choice.text)
    .concat(state.madeChoices.map((choice) => choice.choiceText))
    .filter(Boolean);

  for (const choice of response.choices) {
    const repeated = previousChoices.find((previous) => areChoicesTooSimilar(choice.text, previous));
    if (repeated) {
      return {
        valid: false,
        error: `Repeated choice idea: "${choice.text}" is too similar to "${repeated}"`,
      };
    }
  }

  const importance = validateChoiceImportance(response.choices);
  if (!importance.valid) return importance;

  return { valid: true };
}

function validateChoiceImportance(choices: Choice[]): { valid: boolean; error?: string } {
  const smallChoices = choices
    .map((choice) => choice.text)
    .filter((text) => !isImportantLifeChoice(text));

  if (smallChoices.length > choices.length / 2) {
    return {
      valid: false,
      error: `Choices are too small for life decisions: ${smallChoices.map((choice) => `"${choice}"`).join(', ')}`,
    };
  }

  return { valid: true };
}

function normalizeChoiceText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'do', 'for', 'from',
  'get', 'go', 'have', 'he', 'her', 'him', 'his', 'i', 'in', 'is', 'it', 'just',
  'let', 'more', 'my', 'of', 'on', 'or', 'our', 'she', 'so', 'some', 'that',
  'the', 'their', 'them', 'then', 'there', 'they', 'this', 'to', 'up', 'want',
  'we', 'what', 'with', 'you', 'your',
]);

function tokenizeChoice(text: string): string[] {
  return normalizeChoiceText(text)
    .split(' ')
    .map((token) => token.replace(/(ing|ed|s)$/g, ''))
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function hasNearDuplicateChoices(choices: string[]) {
  for (let i = 0; i < choices.length; i += 1) {
    for (let j = i + 1; j < choices.length; j += 1) {
      if (areChoicesTooSimilar(choices[i], choices[j], 0.62)) return true;
    }
  }

  return false;
}

function areChoicesTooSimilar(a: string, b: string, threshold = 0.52) {
  const normalizedA = normalizeChoiceText(a);
  const normalizedB = normalizeChoiceText(b);
  if (!normalizedA || !normalizedB) return false;
  if (normalizedA === normalizedB) return true;
  if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) return true;

  const tokensA = tokenizeChoice(a);
  const tokensB = tokenizeChoice(b);
  if (tokensA.length === 0 || tokensB.length === 0) return false;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const overlap = Array.from(setA).filter((token) => setB.has(token)).length;
  const union = new Set([...tokensA, ...tokensB]).size;
  const smaller = Math.min(setA.size, setB.size);
  const jaccard = overlap / Math.max(1, union);
  const containment = overlap / Math.max(1, smaller);

  return jaccard >= threshold || (overlap >= 2 && containment >= 0.67);
}

function isImportantLifeChoice(text: string) {
  const normalized = normalizeChoiceText(text);
  const majorVerbs = [
    'accept', 'admit', 'break', 'buy', 'cancel', 'choose', 'commit', 'confess',
    'cut', 'decline', 'divorce', 'drop', 'end', 'forgive', 'invest', 'leave',
    'marry', 'move', 'quit', 'refuse', 'return', 'risk', 'sell', 'sign', 'start',
    'stay', 'tell', 'walk',
  ];
  const majorDomains = [
    'album', 'baby', 'business', 'career', 'child', 'city', 'contract', 'debt',
    'deal', 'dream', 'family', 'father', 'future', 'health', 'home', 'job',
    'label', 'life', 'marriage', 'money', 'mother', 'music', 'partner',
    'record', 'relationship', 'school', 'song', 'songwriting', 'stage', 'tour',
    'truth', 'wife', 'work',
  ];
  const smallSignals = [
    'ask', 'email', 'follow up', 'manager', 'meeting', 'message', 'pitch',
    'presentation', 'rebrand', 'reply', 'spreadsheet', 'text',
  ];

  const hasMajorVerb = majorVerbs.some((verb) => normalized.includes(verb));
  const hasMajorDomain = majorDomains.some((domain) => normalized.includes(domain));
  const hasSmallSignal = smallSignals.some((signal) => normalized.includes(signal));

  return (hasMajorVerb && hasMajorDomain) ||
    (hasMajorVerb && normalized.length > 35 && !hasSmallSignal) ||
    (hasMajorDomain && !hasSmallSignal);
}

export function validatePlayerProfile(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') return { valid: false, error: 'Invalid profile data' };
  const obj = data as Record<string, unknown>;
  if (!obj.name || typeof obj.name !== 'string' || obj.name.trim().length < 1) {
    return { valid: false, error: 'Name is required' };
  }
  if (!obj.age || typeof obj.age !== 'number' || obj.age < 10 || obj.age > 120) {
    return { valid: false, error: 'Age must be between 10 and 120' };
  }
  if (!obj.country || typeof obj.country !== 'string') {
    return { valid: false, error: 'Country is required' };
  }
  return { valid: true };
}
