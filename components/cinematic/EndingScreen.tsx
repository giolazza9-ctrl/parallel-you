'use client';

import { motion } from 'framer-motion';
import ChoiceTimelineGraph from '@/components/cinematic/ChoiceTimelineGraph';

interface EndingScreenProps {
  narrationLines: string[];
  finalLine: string;
  dominantPattern: string;
  emotionalReveal: string;
  butterflyEchoes: string[];
  callbackResolutions: string[];
  madeChoices: { sceneIndex: number; choiceText: string; age?: number }[];
  playerName: string;
  startingAge: number;
  onRestart: () => void;
}

const patternColors: Record<string, { accent: string; glow: string; border: string }> = {
  starts_not_finishes: { accent: 'text-orange-400', glow: 'bg-orange-500', border: 'border-orange-500/20' },
  keeps_avoiding: { accent: 'text-slate-400', glow: 'bg-slate-400', border: 'border-slate-500/20' },
  isolates_self: { accent: 'text-gray-400', glow: 'bg-gray-400', border: 'border-gray-500/20' },
  waits_for_permission: { accent: 'text-cyan-400', glow: 'bg-cyan-400', border: 'border-cyan-500/20' },
  perfectionism_loop: { accent: 'text-cyan-300', glow: 'bg-cyan-300', border: 'border-cyan-400/20' },
  chooses_connection: { accent: 'text-amber-400', glow: 'bg-amber-400', border: 'border-amber-500/20' },
  consistent_small_actions: { accent: 'text-emerald-400', glow: 'bg-emerald-400', border: 'border-emerald-500/20' },
  self_sabotage: { accent: 'text-rose-400', glow: 'bg-rose-400', border: 'border-rose-500/20' },
  fear_of_being_seen: { accent: 'text-red-400', glow: 'bg-red-400', border: 'border-red-500/20' },
  emotional_avoidance: { accent: 'text-blue-400', glow: 'bg-blue-400', border: 'border-blue-500/20' },
};

const defaultColor = { accent: 'text-neutral-400', glow: 'bg-neutral-400', border: 'border-neutral-500/20' };

export default function EndingScreen({
  narrationLines,
  finalLine,
  dominantPattern,
  emotionalReveal,
  butterflyEchoes,
  callbackResolutions,
  madeChoices,
  playerName,
  startingAge,
  onRestart,
}: EndingScreenProps) {
  const colors = patternColors[dominantPattern] || defaultColor;

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-20 max-w-2xl mx-auto relative">
      {/* Background glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.08, scale: 1.5 }}
        transition={{ duration: 4, delay: 1 }}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full ${colors.glow} blur-3xl pointer-events-none`}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="text-center mb-12"
        >
          <div className={`w-3 h-3 rounded-full ${colors.glow} opacity-40 mx-auto mb-6`} />
          <p className={`text-xs uppercase tracking-[0.4em] ${colors.accent} opacity-40 font-light`}>
            The End
          </p>
        </motion.div>

        <div className="space-y-5 mb-14">
          {narrationLines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.6 + 0.8 }}
              className="text-neutral-100 text-lg leading-relaxed font-light"
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: narrationLines.length * 0.6 + 1.5 }}
          className={`border-t ${colors.border} pt-8 mb-14`}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: narrationLines.length * 0.6 + 2 }}
            className={`${colors.accent} text-xl leading-relaxed font-light italic text-center`}
          >
            {finalLine}
          </motion.p>
        </motion.div>

        {(butterflyEchoes.length > 0 || callbackResolutions.length > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: narrationLines.length * 0.6 + 3 }}
            className="mb-14 space-y-6"
          >
            {butterflyEchoes.length > 0 && (
              <div>
                <p className={`text-xs ${colors.accent} uppercase tracking-[0.2em] mb-3 opacity-50`}>What came back</p>
                {butterflyEchoes.map((echo, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.15 + narrationLines.length * 0.6 + 3.2 }}
                    className="text-sm text-neutral-400 font-light mb-1.5"
                  >
                    {echo}
                  </motion.p>
                ))}
              </div>
            )}
            {callbackResolutions.length > 0 && (
              <div className="mt-4">
                <p className={`text-xs ${colors.accent} uppercase tracking-[0.2em] mb-3 opacity-50`}>What resolved</p>
                {callbackResolutions.map((res, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.15 + narrationLines.length * 0.6 + 3.5 }}
                    className="text-sm text-neutral-400 font-light mb-1.5"
                  >
                    {res}
                  </motion.p>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: narrationLines.length * 0.6 + 4.5 }}
          className="text-center mb-14"
        >
          <p className={`text-xs ${colors.accent} uppercase tracking-[0.2em] mb-2 opacity-40`}>
            {dominantPattern.replace(/_/g, ' ')}
          </p>
          <p className="text-sm text-neutral-500 font-light">
            {emotionalReveal}
          </p>
        </motion.div>

        <ChoiceTimelineGraph
          choices={madeChoices}
          playerName={playerName}
          startingAge={startingAge}
          accentClass={colors.accent}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: narrationLines.length * 0.6 + 5.5 }}
          className="text-center"
        >
          <motion.button
            onClick={onRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${colors.accent} opacity-50 hover:opacity-90 transition-all duration-300 text-sm tracking-[0.15em] uppercase`}
          >
            Begin Again
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
