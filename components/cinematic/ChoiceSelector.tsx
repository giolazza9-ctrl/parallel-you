'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Choice } from '@/lib/game/types';

interface ChoiceSelectorProps {
  choices: Choice[];
  onSelect: (choice: Choice) => void;
  disabled?: boolean;
  sceneTitle?: string;
  storyPhase?: string;
  playerName?: string;
  playerGoal?: string;
  recentChoiceText?: string | null;
  onPreview?: (choice: Choice) => void;
}

const emotionalColors: Record<string, {
  border: string;
  bg: string;
  text: string;
  glow: string;
  pill: string;
}> = {
  honesty: {
    border: 'border-emerald-400/25',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-100',
    glow: 'from-emerald-300 to-teal-300',
    pill: 'text-emerald-200',
  },
  avoidance: {
    border: 'border-slate-400/20',
    bg: 'bg-slate-500/10',
    text: 'text-slate-100',
    glow: 'from-slate-200 to-slate-400',
    pill: 'text-slate-200',
  },
  fear: {
    border: 'border-red-400/25',
    bg: 'bg-red-500/10',
    text: 'text-red-100',
    glow: 'from-red-300 to-rose-300',
    pill: 'text-red-200',
  },
  connection: {
    border: 'border-amber-400/25',
    bg: 'bg-amber-500/10',
    text: 'text-amber-100',
    glow: 'from-amber-200 to-orange-300',
    pill: 'text-amber-200',
  },
  perfectionism: {
    border: 'border-cyan-400/25',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-100',
    glow: 'from-cyan-200 to-blue-300',
    pill: 'text-cyan-200',
  },
  isolation: {
    border: 'border-zinc-400/25',
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-100',
    glow: 'from-zinc-200 to-zinc-400',
    pill: 'text-zinc-200',
  },
  risk: {
    border: 'border-orange-400/25',
    bg: 'bg-orange-500/10',
    text: 'text-orange-100',
    glow: 'from-orange-200 to-amber-300',
    pill: 'text-orange-200',
  },
  sabotage: {
    border: 'border-rose-400/25',
    bg: 'bg-rose-500/10',
    text: 'text-rose-100',
    glow: 'from-rose-200 to-fuchsia-300',
    pill: 'text-rose-200',
  },
};

const defaultStyle = emotionalColors.avoidance;

function getStyle(tag: string) {
  const normalized = tag.toLowerCase();
  for (const [key, style] of Object.entries(emotionalColors)) {
    if (normalized.includes(key)) return style;
  }
  return defaultStyle;
}

function getPreviewCopy(tag: string) {
  const normalized = tag.toLowerCase();
  if (normalized.includes('honest')) return 'You stop polishing the truth.';
  if (normalized.includes('fear')) return 'You protect yourself first.';
  if (normalized.includes('connect')) return 'You let someone get closer.';
  if (normalized.includes('risk')) return 'You make life move.';
  if (normalized.includes('perfect')) return 'You try to keep control.';
  if (normalized.includes('isolation')) return 'You handle it alone.';
  if (normalized.includes('sabotage')) return 'This might come back later.';
  return 'You leave the tension where it is.';
}

export default function ChoiceSelector({
  choices,
  onSelect,
  disabled,
  sceneTitle,
  storyPhase,
  playerName,
  playerGoal,
  recentChoiceText,
  onPreview,
}: ChoiceSelectorProps) {
  const [activeChoiceId, setActiveChoiceId] = useState<string | null>(choices[0]?.id || null);

  const activeChoice = useMemo(
    () => choices.find((choice) => choice.id === activeChoiceId) || choices[0] || null,
    [choices, activeChoiceId]
  );

  if (choices.length === 0) return null;

  const activeStyle = getStyle(activeChoice?.emotionalTag || '');

  return (
    <div className="mx-auto max-w-5xl px-6 pb-20">
      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="immersive-panel rounded-[30px] p-6"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Before you choose</p>
          <h3 className="font-display mt-4 text-3xl text-white">{playerName ? `${playerName}, what do you do?` : sceneTitle || 'Next move'}</h3>
          <p className="mt-4 text-sm leading-6 text-slate-300/75">
            Hover a choice and see what kind of move it is before you commit.
          </p>

          {activeChoice && (
            <div className={`mt-6 rounded-[26px] border ${activeStyle.border} ${activeStyle.bg} p-5`}>
              <div className={`inline-flex rounded-full bg-gradient-to-r ${activeStyle.glow} px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-950`}>
                {activeChoice.emotionalTag}
              </div>
              <p className={`mt-4 text-base leading-7 ${activeStyle.text}`}>{activeChoice.text}</p>
              <p className="mt-4 text-sm leading-6 text-slate-300/78">
                {getPreviewCopy(activeChoice.emotionalTag)}
              </p>
            </div>
          )}

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Right now</p>
            <p className="mt-2 text-sm text-slate-200/80">Story: {storyPhase || 'getting started'}</p>
            <p className="mt-2 text-sm text-slate-200/72">You want: {playerGoal || 'Still taking shape.'}</p>
            <p className="mt-2 text-sm text-slate-200/68">Last move: {recentChoiceText || 'No committed action yet.'}</p>
          </div>
        </motion.div>

        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mb-4 flex items-center justify-between"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">What happens next?</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{choices.length} ways forward</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="space-y-4"
          >
            <AnimatePresence mode="wait">
              {choices.map((choice, i) => {
                const style = getStyle(choice.emotionalTag);
                const active = choice.id === activeChoice?.id;

                return (
                  <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, x: -12, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 12, scale: 0.98 }}
                    transition={{ duration: 0.35, delay: i * 0.08 }}
                    onMouseEnter={() => {
                      setActiveChoiceId(choice.id);
                      onPreview?.(choice);
                    }}
                    onFocus={() => {
                      setActiveChoiceId(choice.id);
                      onPreview?.(choice);
                    }}
                    onClick={() => !disabled && onSelect(choice)}
                    disabled={disabled}
                    whileHover={{ scale: 1.015, x: 4, rotateX: -2, rotateY: 3 }}
                    whileTap={{ scale: 0.99 }}
                    className={`group relative w-full overflow-hidden rounded-[28px] border px-5 py-5 text-left transition-all duration-300 ${
                      active ? `${style.border} ${style.bg}` : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]'
                    } ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'} ${choice.isQuiet ? 'italic' : ''}`}
                  >
                    <motion.div
                      animate={{ opacity: active ? 1 : 0.4 }}
                      className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${style.glow}`}
                    />
                    <div className="pl-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`text-lg leading-7 ${active ? style.text : 'text-white/90'}`}>{choice.text}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className={`text-[11px] uppercase tracking-[0.28em] ${active ? style.pill : 'text-slate-500'}`}>
                              {choice.emotionalTag}
                            </span>
                            {choice.isQuiet && (
                              <span className="text-[11px] uppercase tracking-[0.24em] text-slate-500">quiet move</span>
                            )}
                          </div>
                        </div>
                        <div className={`rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.24em] ${active ? style.border + ' ' + style.pill : 'border-white/10 text-slate-500'}`}>
                          Pick
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
