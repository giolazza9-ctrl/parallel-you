'use client';

import { motion } from 'framer-motion';

interface LoadingTransitionProps {
  message?: string;
}

export default function LoadingTransition({ message = 'The story continues' }: LoadingTransitionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Animated background glow */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.03, 0.08, 0.03],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-500 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 0.8, 1.2],
          opacity: [0.02, 0.06, 0.02],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-amber-500 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center relative z-10"
      >
        {/* Animated dots */}
        <motion.div className="mb-8 flex gap-2 justify-center">
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{
                y: [0, -12, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
              className="w-2 h-2 rounded-full bg-blue-400"
            />
          ))}
        </motion.div>

        <motion.p
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-neutral-400 text-sm tracking-[0.2em] uppercase font-light"
        >
          {message}
        </motion.p>

        {/* Shimmer bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 w-32 h-px mx-auto overflow-hidden"
        >
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-full bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
