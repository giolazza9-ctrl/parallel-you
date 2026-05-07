'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const modes = [
  {
    id: 'drift',
    label: 'Drift',
    title: 'Wander through emotional echoes',
    description: 'Let the story read the small things you almost do.',
    accent: 'from-sky-400 via-cyan-300 to-blue-500',
    glow: 'bg-sky-500',
  },
  {
    id: 'reveal',
    label: 'Reveal',
    title: 'See yourself in motion',
    description: 'Every answer reshapes the atmosphere and emotional arc.',
    accent: 'from-amber-300 via-orange-300 to-rose-400',
    glow: 'bg-amber-400',
  },
  {
    id: 'leap',
    label: 'Leap',
    title: 'Choose and watch the world answer back',
    description: 'The interface brightens, darkens, and mutates around your choices.',
    accent: 'from-emerald-300 via-teal-300 to-cyan-400',
    glow: 'bg-emerald-400',
  },
] as const;

export default function Home() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<(typeof modes)[number]>(modes[1]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="ambient-grid absolute inset-0 opacity-20" />

      <motion.div
        key={activeMode.id}
        initial={{ opacity: 0.3, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`absolute left-[8%] top-[12%] h-72 w-72 rounded-full ${activeMode.glow} opacity-20 blur-3xl`}
      />
      <motion.div
        key={`${activeMode.id}-secondary`}
        initial={{ opacity: 0.2, x: 40 }}
        animate={{ opacity: 0.9, x: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="absolute bottom-[10%] right-[6%] h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl"
      />

      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/40"
          style={{
            width: i % 4 === 0 ? 5 : 3,
            height: i % 4 === 0 ? 5 : 3,
            left: `${6 + i * 6}%`,
            top: `${12 + (i % 5) * 15}%`,
          }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.15, 0.65, 0.15],
            scale: [0.9, 1.15, 0.9],
          }}
          transition={{
            duration: 5 + i * 0.35,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-12 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-sky-100/80"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Responsive narrative playground
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-6xl leading-none text-white md:text-8xl"
            >
              Direct
              <span className={`block bg-gradient-to-r ${activeMode.accent} bg-clip-text text-transparent`}>
                Your Life
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-200/80 md:text-xl"
            >
              A cinematic story engine that adapts its color, pace, and emotional texture around the decisions you make.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              {modes.map((mode) => {
                const isActive = mode.id === activeMode.id;
                return (
                  <button
                    key={mode.id}
                    onMouseEnter={() => setActiveMode(mode)}
                    onFocus={() => setActiveMode(mode)}
                    onClick={() => setActiveMode(mode)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                      isActive
                        ? 'border-white/20 bg-white/12 shadow-[0_0_40px_rgba(255,255,255,0.08)]'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-300">{mode.label}</p>
                    <p className="mt-2 text-sm text-white/90">{mode.title}</p>
                  </button>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <motion.button
                onClick={() => router.push('/start')}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden rounded-full bg-gradient-to-r ${activeMode.accent} px-7 py-4 text-sm font-medium uppercase tracking-[0.28em] text-slate-950`}
              >
                <span className="relative z-10">Start Directing</span>
                <motion.span
                  aria-hidden
                  animate={{ x: ['-110%', '130%'] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-y-0 left-0 w-1/2 skew-x-[-24deg] bg-white/35 blur-xl"
                />
              </motion.button>

              <p className="text-sm text-slate-300/70">
                Hover the cards above. The whole tone shifts before the story even begins.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="glass-panel relative overflow-hidden rounded-[32px] p-6 md:p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_30%)]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">Current vibe</p>
                <div className="flex gap-2">
                  {modes.map((mode) => (
                    <span
                      key={mode.id}
                      className={`h-2.5 w-2.5 rounded-full ${
                        activeMode.id === mode.id ? 'bg-white' : 'bg-white/25'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <div className={`inline-flex rounded-full bg-gradient-to-r ${activeMode.accent} px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-950`}>
                  {activeMode.label}
                </div>
                <h2 className="mt-5 font-display text-4xl text-white">{activeMode.title}</h2>
                <p className="mt-4 text-base leading-7 text-slate-200/75">{activeMode.description}</p>
              </div>

              <div className="mt-8 grid gap-3">
                {[
                  ['Atmosphere', 'Backgrounds pulse with your emotional direction'],
                  ['Choices', 'Hovering an option previews the energy it carries'],
                  ['Momentum', 'Progress transforms panels, highlights, and motion'],
                ].map(([label, text], i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.45 + i * 0.08 }}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-100/80">{text}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-400">
                  <span>Interactive energy</span>
                  <span>{activeMode.id === 'drift' ? '62%' : activeMode.id === 'reveal' ? '84%' : '93%'}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    key={activeMode.id}
                    initial={{ width: 0 }}
                    animate={{ width: activeMode.id === 'drift' ? '62%' : activeMode.id === 'reveal' ? '84%' : '93%' }}
                    transition={{ duration: 0.65, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${activeMode.accent}`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
