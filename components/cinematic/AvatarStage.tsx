'use client';

import { motion } from 'framer-motion';
import { Scene } from '@/lib/game/types';

interface AvatarStageProps {
  scene: Scene;
  playerName?: string;
  lastChoiceText?: string | null;
  intensity?: number;
  compact?: boolean;
}

const moodHue: Record<string, string> = {
  melancholic: '198 92% 66%',
  tense: '8 92% 64%',
  quiet: '210 18% 72%',
  warm: '42 95% 64%',
  cold: '184 92% 62%',
  eerie: '148 74% 55%',
  hopeful: '199 90% 62%',
  dark: '240 6% 72%',
  nostalgic: '24 90% 66%',
  anxious: '342 92% 66%',
};

function getInitials(name?: string) {
  const trimmed = name?.trim();
  if (!trimmed) return 'Y';
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getObjectLabel(scene: Scene) {
  if (scene.memoryObject) return scene.memoryObject;
  if (scene.relationshipMoment) return scene.relationshipMoment;
  return scene.environment || scene.title;
}

export default function AvatarStage({
  scene,
  playerName,
  lastChoiceText,
  intensity = 0.45,
  compact = false,
}: AvatarStageProps) {
  const hue = moodHue[scene.mood] || moodHue.quiet;
  const objectLabel = getObjectLabel(scene);

  return (
    <motion.div
      key={`${scene.title}-${scene.mood}`}
      initial={{ opacity: 0, scale: 0.96, rotateX: 8 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, scale: 1.02, rotateX: -8 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={`avatar-stage ${compact ? 'avatar-stage-compact' : ''}`}
      style={{ ['--avatar-hue' as string]: hue, ['--avatar-intensity' as string]: intensity }}
    >
      <div className="avatar-cutline avatar-cutline-a" />
      <div className="avatar-cutline avatar-cutline-b" />
      <motion.div
        className="avatar-world"
        animate={{
          rotateY: [-7, 7, -7],
          rotateX: [3, -2, 3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="avatar-floor" />
        <div className="avatar-backdrop" />
        <motion.div
          className="avatar-person avatar-player"
          animate={{ y: [0, -5, 0], rotateY: [-10, 8, -10] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="avatar-head">{getInitials(playerName)}</div>
          <div className="avatar-body" />
          <div className="avatar-shadow" />
        </motion.div>

        <motion.div
          className="avatar-person avatar-other"
          animate={{ y: [0, 4, 0], rotateY: [10, -8, 10] }}
          transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="avatar-head avatar-head-muted" />
          <div className="avatar-body avatar-body-muted" />
          <div className="avatar-shadow" />
        </motion.div>

        <motion.div
          className="avatar-object"
          animate={{ y: [0, -7, 0], rotateZ: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span>{objectLabel.slice(0, 34)}</span>
        </motion.div>

        <motion.div
          className="avatar-choice-echo"
          animate={{ opacity: lastChoiceText ? [0.35, 0.78, 0.35] : 0.22 }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {lastChoiceText ? lastChoiceText.slice(0, 42) : scene.mood}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
