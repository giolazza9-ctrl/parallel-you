export interface PlayerProfile {
  name: string;
  age: number;
  country: string;
  lifeHistory: string;
  goals: string;
  fears: string;
  emotionalStruggles: string;
}

export interface Scene {
  title: string;
  narrationLines: string[];
  environment: string;
  mood: string;
  cinematicMoment: string;
  relationshipMoment: string;
  memoryObject: string;
}

export interface Choice {
  id: string;
  text: string;
  emotionalTag: string;
  isQuiet?: boolean;
  sceneIndex?: number;
}

export interface ButterflyEffect {
  id: string;
  originSceneIndex: number;
  description: string;
  currentIntensity: number;
  hasReturned: boolean;
  returnSceneIndex?: number;
  relatedChoiceId?: string;
  emotionalTag: string;
}

export interface Callback {
  id: string;
  referenceSceneIndex: number;
  description: string;
  emotionalWeight: number;
  hasResolved: boolean;
  resolveSceneIndex?: number;
}

export interface EmotionalShift {
  honesty: number;
  avoidance: number;
  fear: number;
  perfectionism: number;
  isolation: number;
  connection: number;
  selfSabotage: number;
  riskTaking: number;
  emotionalSuppression: number;
  consistency: number;
}

export interface EndingSignal {
  type: string;
  intensity: number;
  description: string;
}

export interface EmotionalProfile {
  honesty: number;
  avoidance: number;
  fear: number;
  perfectionism: number;
  isolation: number;
  connection: number;
  selfSabotage: number;
  riskTaking: number;
  emotionalSuppression: number;
  consistency: number;
  burnout: number;
  startsNotFinishes: number;
}

export type PatternType =
  | 'starts_not_finishes'
  | 'keeps_avoiding'
  | 'isolates_self'
  | 'waits_for_permission'
  | 'perfectionism_loop'
  | 'chooses_connection'
  | 'consistent_small_actions'
  | 'self_sabotage'
  | 'fear_of_being_seen'
  | 'emotional_avoidance';

export interface DetectedPattern {
  type: PatternType;
  confidence: number;
  evidence: string[];
  firstDetectedScene: number;
}

export interface Relationship {
  name: string;
  type: string;
  warmth: number;
  tension: number;
  trust: number;
  distance: number;
  history: string[];
}

export interface AIResponse {
  scene: Scene;
  choices: Choice[];
  butterflyEffects: ButterflyEffect[];
  callbacks: Callback[];
  emotionalShift: EmotionalShift;
  endingSignals: EndingSignal[];
}

export interface GameState {
  playerProfile: PlayerProfile;
  currentSceneIndex: number;
  currentAge: number;
  choicesThisYear: number;
  scenes: Scene[];
  allChoices: Choice[];
  madeChoices: { sceneIndex: number; choiceId: string; choiceText: string; age?: number }[];
  butterflyEffects: ButterflyEffect[];
  callbacks: Callback[];
  emotionalProfile: EmotionalProfile;
  detectedPatterns: DetectedPattern[];
  relationships: Relationship[];
  endingSignals: EndingSignal[];
  storyPhase: 'introduction' | 'rising' | 'complexity' | 'climax' | 'resolution' | 'ending';
  sceneCount: number;
  isComplete: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface StoryTurnRequest {
  gameState: GameState;
  choiceId?: string;
  choiceText?: string;
  isForcedContinue?: boolean;
}

export interface StoryTurnResponse {
  success: boolean;
  data?: AIResponse;
  error?: string;
}
