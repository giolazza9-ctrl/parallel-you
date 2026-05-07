'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Scene } from '@/lib/game/types';
import AvatarStage from '@/components/cinematic/AvatarStage';

interface SceneRendererProps {
  scene: Scene;
  onComplete: () => void;
  sceneCount?: number;
  choiceCount?: number;
  lastChoiceText?: string | null;
  storyPhase?: string;
  currentAge?: number;
  choicesThisYear?: number;
  yearChoiceBudget?: number;
  playerName?: string;
  playerGoal?: string;
  playerFear?: string;
  dominantPattern?: string | null;
  returnedEchoes?: string[];
  soundEnabled?: boolean;
}

const moodStyles: Record<string, {
  accent: string;
  badge: string;
  border: string;
  panel: string;
}> = {
  melancholic: {
    accent: 'text-blue-300',
    badge: 'from-blue-300 to-cyan-300',
    border: 'border-blue-400/20',
    panel: 'bg-blue-500/8',
  },
  tense: {
    accent: 'text-red-300',
    badge: 'from-red-300 to-orange-300',
    border: 'border-red-400/20',
    panel: 'bg-red-500/8',
  },
  quiet: {
    accent: 'text-slate-300',
    badge: 'from-slate-200 to-slate-400',
    border: 'border-slate-400/20',
    panel: 'bg-slate-500/8',
  },
  warm: {
    accent: 'text-amber-200',
    badge: 'from-amber-200 to-yellow-300',
    border: 'border-amber-400/20',
    panel: 'bg-amber-500/8',
  },
  cold: {
    accent: 'text-cyan-200',
    badge: 'from-cyan-200 to-teal-300',
    border: 'border-cyan-400/20',
    panel: 'bg-cyan-500/8',
  },
  eerie: {
    accent: 'text-emerald-200',
    badge: 'from-emerald-200 to-green-300',
    border: 'border-emerald-400/20',
    panel: 'bg-emerald-500/8',
  },
  hopeful: {
    accent: 'text-sky-200',
    badge: 'from-sky-200 to-cyan-300',
    border: 'border-sky-400/20',
    panel: 'bg-sky-500/8',
  },
  dark: {
    accent: 'text-zinc-300',
    badge: 'from-zinc-200 to-zinc-400',
    border: 'border-zinc-400/20',
    panel: 'bg-zinc-500/8',
  },
  nostalgic: {
    accent: 'text-orange-200',
    badge: 'from-orange-200 to-rose-200',
    border: 'border-orange-400/20',
    panel: 'bg-orange-500/8',
  },
  anxious: {
    accent: 'text-rose-200',
    badge: 'from-rose-200 to-pink-300',
    border: 'border-rose-400/20',
    panel: 'bg-rose-500/8',
  },
};

export default function SceneRenderer({
  scene,
  onComplete,
  sceneCount = 1,
  choiceCount = 0,
  lastChoiceText,
  storyPhase = 'introduction',
  currentAge,
  choicesThisYear = 0,
  yearChoiceBudget = 3,
  playerName,
  playerGoal,
  playerFear,
  dominantPattern,
  returnedEchoes = [],
  soundEnabled = true,
}: SceneRendererProps) {
  const style = moodStyles[scene.mood] || moodStyles.quiet;

  return (
    <div className="depth-stage mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-14">
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.title}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.55 }}
          className="grid items-start gap-6 lg:grid-cols-[0.95fr_1.15fr_0.7fr]"
        >
          <motion.div className="hidden lg:block">
            <AvatarStage
              scene={scene}
              playerName={playerName}
              lastChoiceText={lastChoiceText}
              intensity={Math.min(1, choiceCount / 16 + 0.25)}
            />
          </motion.div>

          <motion.div
            whileHover={{ rotateX: 2.4, rotateY: -2, z: 14 }}
            className="immersive-panel rounded-[34px] p-6 md:p-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className={`rounded-full bg-gradient-to-r ${style.badge} px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-950`}>
                {scene.mood}
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                {storyPhase}
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                Scene {sceneCount}
              </div>
              {currentAge != null && (
                <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                  Age {currentAge}
                </div>
              )}
              <div className="hud-chip rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-300">
                {soundEnabled ? 'sfx on' : 'sfx off'}
              </div>
            </div>

            {scene.cinematicMoment && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
                className={`mt-6 text-xs uppercase tracking-[0.36em] ${style.accent} opacity-80`}
              >
                {scene.cinematicMoment}
              </motion.p>
            )}

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="font-display mt-5 text-4xl text-white md:text-5xl"
            >
              {playerName ? `${playerName}, ${scene.title}` : scene.title}
            </motion.h2>

            <div className="mt-8 space-y-5">
              {scene.narrationLines.map((line, i) => (
                <NarrationLine key={i} line={line} delay={i * 0.18 + 0.2} />
              ))}
            </div>
            <div className="mt-7 lg:hidden">
              <AvatarStage
                scene={scene}
                playerName={playerName}
                lastChoiceText={lastChoiceText}
                intensity={Math.min(1, choiceCount / 16 + 0.25)}
                compact
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: scene.narrationLines.length * 0.12 + 0.3 }}
              className={`mt-8 rounded-[24px] border ${style.border} ${style.panel} p-4`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">What is in the room</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {scene.memoryObject && (
                  <span className={`rounded-full border ${style.border} px-3 py-2 text-sm ${style.accent}`}>
                    You notice: {scene.memoryObject}
                  </span>
                )}
                {scene.relationshipMoment && (
                  <span className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300/80">
                    Between you: {scene.relationshipMoment}
                  </span>
                )}
                {dominantPattern && (
                  <span className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300/80">
                    Pattern: {dominantPattern.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: scene.narrationLines.length * 0.12 + 0.45 }}
              className="mt-8"
            >
              <button
                onClick={onComplete}
                className={`group inline-flex items-center gap-3 rounded-full border ${style.border} bg-white/5 px-5 py-3 text-sm uppercase tracking-[0.24em] ${style.accent} transition-all hover:bg-white/10`}
              >
                <span>Keep going</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  &rarr;
                </motion.span>
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            whileHover={{ rotateY: 5, rotateX: 2, z: 10 }}
            className="immersive-panel rounded-[34px] p-6"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Life so far</p>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Choices made</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="story-ring flex h-20 w-20 items-center justify-center rounded-full border border-white/10">
                  <span className="text-xl text-white">{choiceCount}</span>
                </div>
                <p className="text-sm leading-6 text-slate-200/75">
                  The game is keeping score in the background.
                </p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  animate={{ width: `${Math.min(100, (choicesThisYear / Math.max(1, yearChoiceBudget)) * 100)}%` }}
                  transition={{ duration: 0.35 }}
                  className={`h-full rounded-full bg-gradient-to-r ${style.badge}`}
                />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">
                This stretch: {choicesThisYear}/{yearChoiceBudget}
              </p>
            </div>

            <div className="mt-5 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Last thing you did</p>
              <p className="mt-3 text-sm leading-6 text-slate-200/78">
                {lastChoiceText || 'Nothing yet. You are still stepping into it.'}
              </p>
            </div>

            <div className="mt-5 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Where you are</p>
              <p className={`mt-3 text-sm leading-6 ${style.accent}`}>{scene.environment}</p>
            </div>

            <div className="mt-5 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Things coming back around</p>
              <div className="mt-3 space-y-3">
                {returnedEchoes.length > 0 ? returnedEchoes.slice(-3).map((echo) => (
                  <p key={echo} className="text-sm leading-6 text-slate-200/76">{echo}</p>
                )) : (
                  <p className="text-sm leading-6 text-slate-300/65">Nothing has come back around yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function NarrationLine({ line, delay }: { line: string; delay: number }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      className="text-lg leading-8 text-neutral-100 md:text-[1.16rem]"
    >
      {line}
    </motion.p>
  );
}
