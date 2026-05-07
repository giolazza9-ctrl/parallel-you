'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameState, Choice } from '@/lib/game/types';
import { saveGameState, clearGameState } from '@/lib/game/storage';
import CinematicOverlay from '@/components/cinematic/CinematicOverlay';
import SceneRenderer from '@/components/cinematic/SceneRenderer';
import ChoiceSelector from '@/components/cinematic/ChoiceSelector';
import LoadingTransition from '@/components/cinematic/LoadingTransition';
import EndingScreen from '@/components/cinematic/EndingScreen';
import { getChoiceBudgetForAge } from '@/lib/game/state';
import { useImmersiveStory } from '@/hooks/useImmersiveStory';
import AvatarStage from '@/components/cinematic/AvatarStage';

interface EndingData {
  narrationLines: string[];
  finalLine: string;
  dominantPattern: string;
  emotionalReveal: string;
  butterflyEchoes: string[];
  callbackResolutions: string[];
}

interface StoryContainerProps {
  initialState: GameState;
}

type StoryPhase = 'narrating' | 'choosing' | 'loading' | 'ending';

export default function StoryContainer({ initialState }: StoryContainerProps) {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [phase, setPhase] = useState<StoryPhase>('narrating');
  const [error, setError] = useState<string | null>(null);
  const [endingData, setEndingData] = useState<EndingData | null>(null);
  const [previewChoice, setPreviewChoice] = useState<Choice | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const {
    soundEnabled,
    setSoundEnabled,
    playHover,
    playSelect,
    playAdvance,
  } = useImmersiveStory();

  const currentScene = gameState.scenes[gameState.scenes.length - 1] || null;
  const currentSceneChoices = gameState.allChoices.filter((choice) => choice.sceneIndex === gameState.sceneCount);
  const currentChoices = phase === 'choosing'
    ? (currentSceneChoices.length > 0 ? currentSceneChoices : gameState.allChoices.slice(-4))
    : [];
  const lastChoice = gameState.madeChoices[gameState.madeChoices.length - 1] || null;
  const reactionLevel = Math.min(1, (gameState.sceneCount + gameState.madeChoices.length) / 12);
  const yearChoiceBudget = getChoiceBudgetForAge(gameState.currentAge);
  const dominantPattern = gameState.detectedPatterns
    .slice()
    .sort((a, b) => b.confidence - a.confidence)[0]?.type || null;
  const returnedEchoes = gameState.butterflyEffects
    .filter((effect) => effect.hasReturned)
    .map((effect) => effect.description);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const handleSceneComplete = useCallback(() => {
    playAdvance();
    if (gameState.isComplete) {
      setPhase('ending');
      return;
    }
    const sceneChoices = gameState.allChoices.filter((choice) => choice.sceneIndex === gameState.sceneCount);
    const latestChoices = sceneChoices.length > 0 ? sceneChoices : gameState.allChoices.slice(-4);
    if (latestChoices.length > 0) {
      setPhase('choosing');
    } else {
      handleContinue();
    }
  }, [gameState, playAdvance]);

  const handleChoice = useCallback(async (choice: Choice) => {
    playSelect();
    setPhase('loading');
    setError(null);

    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const res = await fetch('/api/story-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          gameState,
          choiceId: choice.id,
          choiceText: choice.text,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate story');

      const newState: GameState = data.gameState;
      setGameState(newState);

      if (newState.isComplete) {
        setEndingData(extractEndingData(newState, data));
        setPhase('ending');
      } else {
        setPhase('narrating');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setPhase('choosing');
    }
  }, [gameState, playSelect]);

  const handleContinue = useCallback(async () => {
    setPhase('loading');
    setError(null);

    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const res = await fetch('/api/story-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({ gameState, isForcedContinue: true }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate story');

      const newState: GameState = data.gameState;
      setGameState(newState);

      if (newState.isComplete) {
        setEndingData(extractEndingData(newState, data));
        setPhase('ending');
      } else {
        setPhase('narrating');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setPhase('narrating');
    }
  }, [gameState]);

  const handleRestart = useCallback(() => {
    clearGameState();
    router.push('/start');
  }, [router]);

  if (phase === 'ending') {
    const ending = endingData || extractEndingData(gameState, null);
    return (
      <CinematicOverlay mood="dark">
        <EndingScreen
          narrationLines={ending.narrationLines}
          finalLine={ending.finalLine}
          dominantPattern={ending.dominantPattern}
          emotionalReveal={ending.emotionalReveal}
          butterflyEchoes={ending.butterflyEchoes}
          callbackResolutions={ending.callbackResolutions}
          madeChoices={gameState.madeChoices}
          playerName={gameState.playerProfile.name}
          startingAge={gameState.playerProfile.age}
          onRestart={handleRestart}
        />
      </CinematicOverlay>
    );
  }

  if (phase === 'loading') {
    return <LoadingTransition />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6">
        <p className="text-rose-400/70 text-sm mb-4">{error}</p>
        <button
          onClick={() => { setError(null); setPhase('narrating'); }}
          className="text-neutral-500 hover:text-neutral-300 transition-colors text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!currentScene) {
    return <LoadingTransition message="Preparing your story" />;
  }

  return (
    <CinematicOverlay
      mood={currentScene.mood}
      environment={currentScene.environment}
      accentTag={previewChoice?.text || lastChoice?.choiceText}
      intensity={reactionLevel}
      playerName={gameState.playerProfile.name}
    >
      <div className="pointer-events-auto absolute right-6 top-14 z-20 flex flex-wrap justify-end gap-2 md:right-10">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="hud-chip rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-slate-200 transition-colors hover:bg-white/10"
        >
          {soundEnabled ? 'Sound on' : 'Sound off'}
        </button>
      </div>
      {phase === 'narrating' && (
        <SceneRenderer
          scene={currentScene}
          onComplete={handleSceneComplete}
          sceneCount={gameState.sceneCount}
          choiceCount={gameState.madeChoices.length}
          lastChoiceText={lastChoice?.choiceText}
          storyPhase={gameState.storyPhase}
          currentAge={gameState.currentAge}
          choicesThisYear={gameState.choicesThisYear}
          yearChoiceBudget={yearChoiceBudget}
          playerName={gameState.playerProfile.name}
          playerGoal={gameState.playerProfile.goals}
          playerFear={gameState.playerProfile.fears}
          dominantPattern={dominantPattern}
          returnedEchoes={returnedEchoes}
          soundEnabled={soundEnabled}
        />
      )}
      {phase === 'choosing' && (
        <>
          <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-300">
                {gameState.storyPhase}
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                Scene {gameState.sceneCount}
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                Age {gameState.currentAge}
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                Year {gameState.choicesThisYear}/{yearChoiceBudget}
              </div>
              {lastChoice && (
                <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  Last move: {lastChoice.choiceText.slice(0, 38)}
                </div>
              )}
            </div>
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <AvatarStage
                scene={currentScene}
                playerName={gameState.playerProfile.name}
                lastChoiceText={lastChoice?.choiceText}
                intensity={reactionLevel}
              />
              <div className="immersive-panel rounded-[30px] p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">You are inside this moment</p>
                    <h2 className="font-display mt-2 text-3xl text-white">
                      {gameState.playerProfile.name}, {currentScene.title}
                    </h2>
                  </div>
                  <div className="hidden h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-slate-200 md:flex">
                    {Math.round(reactionLevel * 100)}%
                  </div>
                </div>
                <div className="space-y-5">
                  {currentScene.narrationLines.map((line, i) => (
                    <p key={i} className="text-neutral-100 text-lg leading-relaxed font-light">
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className="immersive-panel rounded-[30px] p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Player status</p>
                <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current want</p>
                  <p className="mt-3 text-sm leading-6 text-slate-100/82">{gameState.playerProfile.goals}</p>
                </div>
                <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Underlying fear</p>
                  <p className="mt-3 text-sm leading-6 text-slate-100/76">{gameState.playerProfile.fears}</p>
                </div>
                <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current loop</p>
                  <p className="mt-3 text-sm leading-6 text-slate-100/76">
                    {dominantPattern ? dominantPattern.replace(/_/g, ' ') : 'Still emerging.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <ChoiceSelector
            choices={currentChoices}
            onSelect={handleChoice}
            sceneTitle={currentScene.title}
            storyPhase={gameState.storyPhase}
            playerName={gameState.playerProfile.name}
            playerGoal={gameState.playerProfile.goals}
            recentChoiceText={lastChoice?.choiceText}
            onPreview={(choice) => {
              setPreviewChoice(choice);
              playHover();
            }}
          />
        </>
      )}
    </CinematicOverlay>
  );
}

function extractEndingData(state: GameState, apiData: { [key: string]: unknown } | null): EndingData {
  const lastScene = state.scenes[state.scenes.length - 1];
  const topPattern = state.detectedPatterns.sort((a, b) => b.confidence - a.confidence)[0];
  const endingExtras = (apiData?.endingData as Record<string, unknown>) || null;

  return {
    narrationLines: lastScene?.narrationLines || ['The story ends.'],
    finalLine: (endingExtras?.finalLine as string) || lastScene?.narrationLines?.[lastScene.narrationLines.length - 1] || '',
    dominantPattern: (endingExtras?.dominantPattern as string) || topPattern?.type || 'unknown',
    emotionalReveal: (endingExtras?.emotionalReveal as string) || state.endingSignals[0]?.description || '',
    butterflyEchoes: (endingExtras?.butterflyEchoes as string[]) || state.butterflyEffects.filter(b => b.hasReturned).map(b => b.description),
    callbackResolutions: (endingExtras?.callbackResolutions as string[]) || state.callbacks.filter(c => c.hasResolved).map(c => c.description),
  };
}
