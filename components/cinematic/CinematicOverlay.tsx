'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useMemo } from 'react';

interface CinematicOverlayProps {
  children: ReactNode;
  mood?: string;
  environment?: string;
  accentTag?: string;
  intensity?: number;
  playerName?: string;
}

const moodThemes: Record<string, {
  bg1: string;
  bg2: string;
  bg3: string;
  glow: string;
  glow2: string;
  particle: string;
  scanline: string;
}> = {
  melancholic: {
    bg1: 'from-blue-900/30 via-slate-950/20 to-blue-950/25',
    bg2: 'from-cyan-900/15 to-transparent',
    bg3: 'from-blue-800/10 via-transparent to-slate-900/15',
    glow: 'bg-blue-500',
    glow2: 'bg-cyan-400',
    particle: 'bg-blue-400',
    scanline: 'rgba(59,130,246,0.03)',
  },
  tense: {
    bg1: 'from-red-900/30 via-rose-950/20 to-orange-950/25',
    bg2: 'from-red-800/15 to-transparent',
    bg3: 'from-amber-900/10 via-transparent to-red-900/15',
    glow: 'bg-red-500',
    glow2: 'bg-orange-400',
    particle: 'bg-red-400',
    scanline: 'rgba(239,68,68,0.03)',
  },
  quiet: {
    bg1: 'from-slate-800/25 via-gray-950/15 to-zinc-900/20',
    bg2: 'from-gray-800/10 to-transparent',
    bg3: 'from-slate-700/8 via-transparent to-gray-900/10',
    glow: 'bg-slate-400',
    glow2: 'bg-gray-300',
    particle: 'bg-slate-300',
    scanline: 'rgba(148,163,184,0.02)',
  },
  warm: {
    bg1: 'from-amber-800/30 via-orange-950/20 to-yellow-900/25',
    bg2: 'from-amber-700/15 to-transparent',
    bg3: 'from-orange-800/10 via-transparent to-yellow-900/15',
    glow: 'bg-amber-500',
    glow2: 'bg-yellow-400',
    particle: 'bg-amber-300',
    scanline: 'rgba(245,158,11,0.03)',
  },
  cold: {
    bg1: 'from-cyan-900/30 via-blue-950/20 to-teal-950/25',
    bg2: 'from-cyan-800/15 to-transparent',
    bg3: 'from-teal-900/10 via-transparent to-blue-900/15',
    glow: 'bg-cyan-500',
    glow2: 'bg-teal-400',
    particle: 'bg-cyan-300',
    scanline: 'rgba(6,182,212,0.03)',
  },
  eerie: {
    bg1: 'from-emerald-900/30 via-teal-950/20 to-green-950/25',
    bg2: 'from-emerald-800/15 to-transparent',
    bg3: 'from-green-900/10 via-transparent to-teal-900/15',
    glow: 'bg-emerald-500',
    glow2: 'bg-green-400',
    particle: 'bg-emerald-300',
    scanline: 'rgba(16,185,129,0.03)',
  },
  hopeful: {
    bg1: 'from-sky-800/25 via-blue-950/15 to-cyan-900/20',
    bg2: 'from-sky-700/12 to-transparent',
    bg3: 'from-cyan-800/8 via-transparent to-blue-900/12',
    glow: 'bg-sky-500',
    glow2: 'bg-cyan-400',
    particle: 'bg-sky-300',
    scanline: 'rgba(14,165,233,0.03)',
  },
  dark: {
    bg1: 'from-gray-900/40 via-neutral-950/30 to-black/40',
    bg2: 'from-gray-800/10 to-transparent',
    bg3: 'from-neutral-800/8 via-transparent to-black/20',
    glow: 'bg-gray-500',
    glow2: 'bg-neutral-400',
    particle: 'bg-gray-400',
    scanline: 'rgba(156,163,175,0.02)',
  },
  nostalgic: {
    bg1: 'from-amber-900/25 via-orange-950/15 to-rose-900/20',
    bg2: 'from-amber-800/12 to-transparent',
    bg3: 'from-orange-900/8 via-transparent to-rose-900/12',
    glow: 'bg-amber-500',
    glow2: 'bg-rose-400',
    particle: 'bg-amber-200',
    scanline: 'rgba(217,119,6,0.03)',
  },
  anxious: {
    bg1: 'from-rose-900/30 via-red-950/20 to-pink-950/25',
    bg2: 'from-rose-800/15 to-transparent',
    bg3: 'from-pink-900/10 via-transparent to-red-900/15',
    glow: 'bg-rose-500',
    glow2: 'bg-pink-400',
    particle: 'bg-rose-300',
    scanline: 'rgba(244,63,94,0.03)',
  },
};

function getAccentGlow(tag?: string) {
  const normalized = tag?.toLowerCase() || '';
  if (normalized.includes('fear') || normalized.includes('tense')) return 'bg-rose-500/18';
  if (normalized.includes('honest') || normalized.includes('reveal')) return 'bg-emerald-400/18';
  if (normalized.includes('risk') || normalized.includes('jump')) return 'bg-orange-400/18';
  if (normalized.includes('connect') || normalized.includes('love')) return 'bg-amber-300/18';
  return 'bg-sky-400/14';
}

export default function CinematicOverlay({
  children,
  mood = 'quiet',
  environment,
  accentTag,
  intensity = 0.45,
  playerName,
}: CinematicOverlayProps) {
  const theme = moodThemes[mood] || moodThemes.quiet;
  const accentGlow = getAccentGlow(accentTag);

  const particles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 5,
    })), []);

  return (
    <div className="video-cut-bars relative min-h-screen overflow-hidden bg-black">
      {/* Primary gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.bg1} pointer-events-none z-0`} />

      {/* Secondary side glow */}
      <div className={`absolute inset-0 bg-gradient-to-r ${theme.bg2} pointer-events-none z-0`} />

      {/* Bottom accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t ${theme.bg3} pointer-events-none z-0`} />

      <motion.div
        animate={{ opacity: [0.2, 0.45 + intensity * 0.25, 0.2], scale: [0.92, 1.05, 0.92] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute inset-x-[16%] top-[18%] h-56 rounded-full ${accentGlow} blur-3xl pointer-events-none z-0`}
      />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${theme.scanline} 2px, ${theme.scanline} 4px)`,
        }}
      />

      {/* Floating glow orbs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={environment || mood}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 pointer-events-none z-[1]"
        >
          <motion.div
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 10, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute top-[15%] right-[8%] w-72 h-72 rounded-full ${theme.glow} opacity-[0.06] blur-3xl`}
          />
          <motion.div
            animate={{
              x: [0, -25, 15, 0],
              y: [0, 15, -25, 0],
              scale: [1, 0.8, 1.1, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute bottom-[25%] left-[5%] w-56 h-56 rounded-full ${theme.glow2} opacity-[0.04] blur-3xl`}
          />
          <motion.div
            animate={{
              x: [0, 20, -10, 0],
              y: [0, -30, 5, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute top-[50%] left-[40%] w-40 h-40 rounded-full ${theme.glow} opacity-[0.03] blur-3xl`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Floating particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${theme.particle} pointer-events-none z-[1]`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -40 - intensity * 20, 0],
            x: [0, p.id % 2 === 0 ? 15 + intensity * 10 : -15 - intensity * 10, 0],
            opacity: [0, 0.25 + intensity * 0.35, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Top/bottom vignette */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/70 to-transparent z-[2] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/70 to-transparent z-[2] pointer-events-none" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] flex items-center justify-between px-6 py-5 text-[11px] uppercase tracking-[0.32em] text-white/30 md:px-10">
        <span>{playerName ? `${playerName} perspective` : 'First person mode'}</span>
        <span>{environment || mood}</span>
      </div>

      <motion.div
        key={`${environment}-${mood}`}
        initial={{ opacity: 0.95 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="pointer-events-none absolute inset-0 z-[2] bg-white/10 mix-blend-soft-light"
      />

      <div className="viewfinder-corners z-[2]" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
