'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type SfxName = 'hover' | 'select' | 'advance';

function clampSample(value: number) {
  return Math.max(-1, Math.min(1, value));
}

function createWavBlob(samples: Float32Array, sampleRate = 44100): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    view.setInt16(offset, clampSample(samples[i]) * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function synthesizeEffect(type: SfxName): Blob {
  const sampleRate = 44100;
  const durations = {
    hover: 0.12,
    select: 0.28,
    advance: 0.42,
  } as const;

  const length = Math.floor(sampleRate * durations[type]);
  const samples = new Float32Array(length);

  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const progress = i / Math.max(1, length - 1);
    const envelope = Math.sin(Math.PI * Math.min(1, progress)) ** 1.6;

    if (type === 'hover') {
      const frequency = 260 + progress * 90;
      samples[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.18;
    } else if (type === 'select') {
      const low = Math.sin(2 * Math.PI * (160 + progress * 80) * t) * 0.18;
      const high = Math.sin(2 * Math.PI * (320 - progress * 40) * t) * 0.1;
      samples[i] = (low + high) * envelope;
    } else {
      const rumble = Math.sin(2 * Math.PI * (90 + progress * 25) * t) * 0.2;
      const hit = Math.sin(2 * Math.PI * (220 - progress * 120) * t) * 0.12;
      const noise = (Math.random() * 2 - 1) * 0.03 * (1 - progress);
      samples[i] = (rumble + hit + noise) * envelope;
    }
  }

  return createWavBlob(samples, sampleRate);
}

export function useImmersiveStory() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const sfxUrlsRef = useRef<Record<SfxName, string> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urls: Record<SfxName, string> = {
      hover: URL.createObjectURL(synthesizeEffect('hover')),
      select: URL.createObjectURL(synthesizeEffect('select')),
      advance: URL.createObjectURL(synthesizeEffect('advance')),
    };

    sfxUrlsRef.current = urls;

    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const playSfx = useCallback((type: SfxName) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    const url = sfxUrlsRef.current?.[type];
    if (!url) return;

    const audio = new Audio(url);
    audio.volume = type === 'hover' ? 0.22 : type === 'select' ? 0.35 : 0.4;
    void audio.play().catch(() => undefined);
  }, [soundEnabled]);

  const playHover = useCallback(() => playSfx('hover'), [playSfx]);
  const playSelect = useCallback(() => playSfx('select'), [playSfx]);
  const playAdvance = useCallback(() => playSfx('advance'), [playSfx]);

  return {
    soundEnabled,
    setSoundEnabled,
    playHover,
    playSelect,
    playAdvance,
  };
}
