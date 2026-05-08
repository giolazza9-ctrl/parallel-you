import { AIResponse, GameState, PlayerProfile } from './types';

function firstSelected(values?: string[]) {
  return values?.find(Boolean) || '';
}

function goalWord(profile: PlayerProfile) {
  const goal = profile.goals.toLowerCase();
  if (/(music|beat|song|producer|album|track|studio)/.test(goal)) return 'project file';
  if (/(business|startup|client|website|launch|product)/.test(goal)) return 'page';
  if (/(fit|gym|train|weight|body|health)/.test(goal)) return 'shoes';
  if (/(write|book|script|novel|page|draft)/.test(goal)) return 'draft';
  return 'thing you keep opening';
}

function humanDetail(profile: PlayerProfile) {
  const prefs = profile.storyPreferences;
  const liked = firstSelected(prefs?.likes);
  const disliked = firstSelected(prefs?.dislikes);
  const person = firstSelected(prefs?.importantPeople);

  if (liked) return liked.toLowerCase();
  if (disliked) return disliked.toLowerCase();
  if (person) return person.toLowerCase();
  return 'the phone light';
}

export function generateFallbackOpening(state: GameState): AIResponse {
  const profile = state.playerProfile;
  const object = goalWord(profile);
  const detail = humanDetail(profile);

  return {
    scene: {
      title: 'The First Night',
      narrationLines: [
        `The room is quiet, ${profile.name}.`,
        `You open the ${object}, then look at ${detail} instead.`,
        `Nothing big happens. That is usually how it starts.`,
      ],
      environment: 'a quiet room with a screen left open',
      mood: 'quiet',
      cinematicMoment: 'the laptop glow sits on their face',
      relationshipMoment: '',
      memoryObject: object,
    },
    choices: [
      {
        id: 'c1',
        text: `Keep the ${object} open and fix one real part`,
        emotionalTag: 'consistency',
        isQuiet: false,
      },
      {
        id: 'c2',
        text: 'Close it and promise tomorrow will be different',
        emotionalTag: 'avoidance',
        isQuiet: true,
      },
      {
        id: 'c3',
        text: 'Tell one person you are trying again',
        emotionalTag: 'connection',
        isQuiet: false,
      },
    ],
    butterflyEffects: [
      {
        id: `bf-fallback-${Date.now()}`,
        originSceneIndex: state.sceneCount,
        description: `The ${object} becomes the first thing the story remembers.`,
        currentIntensity: 0.45,
        hasReturned: false,
        emotionalTag: 'consistency',
      },
    ],
    callbacks: [],
    emotionalShift: {
      honesty: 0.04,
      avoidance: 0,
      fear: 0.02,
      perfectionism: 0,
      isolation: 0,
      connection: 0,
      selfSabotage: 0,
      riskTaking: 0,
      emotionalSuppression: 0,
      consistency: 0.04,
    },
    endingSignals: [
      {
        type: 'ordinary_beginning',
        intensity: 0.2,
        description: 'The story began with a small ordinary action.',
      },
    ],
  };
}

export function generateFallbackTurn(state: GameState, choiceText?: string): AIResponse {
  const profile = state.playerProfile;
  const object = goalWord(profile);
  const detail = humanDetail(profile);
  const lastChoice = choiceText || state.madeChoices[state.madeChoices.length - 1]?.choiceText || 'do nothing';

  return {
    scene: {
      title: state.madeChoices.length > 3 ? 'What Changed' : 'The Next Morning',
      narrationLines: [
        `Because you chose to ${lastChoice.toLowerCase()}, the week tilts a little.`,
        `The ${object} is still there.`,
        `So is ${detail}. You notice both this time.`,
      ],
      environment: 'the same life, slightly rearranged',
      mood: state.madeChoices.length > 2 ? 'hopeful' : 'quiet',
      cinematicMoment: 'morning light reaches the edge of the desk',
      relationshipMoment: '',
      memoryObject: object,
    },
    choices: [
      {
        id: `c-${Date.now()}-1`,
        text: `Finish the ugly version of the ${object}`,
        emotionalTag: 'consistency',
        isQuiet: false,
      },
      {
        id: `c-${Date.now()}-2`,
        text: 'Let the day pass and act like it was rest',
        emotionalTag: 'avoidance',
        isQuiet: true,
      },
      {
        id: `c-${Date.now()}-3`,
        text: 'Ask for the kind of help you usually avoid',
        emotionalTag: 'connection',
        isQuiet: false,
      },
    ],
    butterflyEffects: [],
    callbacks: [
      {
        id: `cb-fallback-${Date.now()}`,
        referenceSceneIndex: state.sceneCount,
        description: `You remember choosing to ${lastChoice.toLowerCase()}.`,
        emotionalWeight: 0.45,
        hasResolved: false,
      },
    ],
    emotionalShift: {
      honesty: 0.03,
      avoidance: lastChoice.toLowerCase().includes('close') ? 0.05 : -0.02,
      fear: 0,
      perfectionism: 0,
      isolation: 0,
      connection: lastChoice.toLowerCase().includes('person') ? 0.06 : 0,
      selfSabotage: 0,
      riskTaking: 0,
      emotionalSuppression: 0,
      consistency: lastChoice.toLowerCase().includes('fix') ? 0.07 : 0.02,
    },
    endingSignals: [],
  };
}
