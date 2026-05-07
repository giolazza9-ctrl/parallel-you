'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameState } from '@/lib/game/types';
import { loadGameState } from '@/lib/game/storage';
import StoryContainer from '@/components/story/StoryContainer';
import LoadingTransition from '@/components/cinematic/LoadingTransition';

export default function StoryPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadGameState();
    if (saved && saved.playerProfile && saved.scenes.length > 0) {
      setGameState(saved);
    } else {
      setError('No story found. Please start from the beginning.');
      setTimeout(() => router.push('/start'), 2000);
    }
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <p className="text-neutral-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!gameState) {
    return <LoadingTransition message="Loading your story" />;
  }

  return <StoryContainer initialState={gameState} />;
}
