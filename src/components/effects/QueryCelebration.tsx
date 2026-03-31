import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';

const COLORS = ['#7c6cff', '#38bdf8', '#4ade80', '#f472b6', '#fbbf24', '#2dd4bf'];

/** Deterministic pseudo-random in [0,1) from seeds (no Math.random in render). */
function det01(i: number, burstKey: number, salt: number): number {
  const x = Math.sin(burstKey * 12.9898 + i * 78.233 + salt * 43.758) * 43758.5453;
  return x - Math.floor(x);
}

/** Full-screen particle burst; increment `burstKey` to replay. */
export function QueryCelebration({ burstKey }: { burstKey: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        id: `${burstKey}-${i}`,
        angle: (Math.PI * 2 * i) / 32 + det01(i, burstKey, 1) * 0.55,
        dist: 90 + det01(i, burstKey, 2) * 140,
        size: 4 + det01(i, burstKey, 3) * 6,
        color: COLORS[i % COLORS.length]!,
        delay: det01(i, burstKey, 4) * 0.1,
      })),
    [burstKey],
  );

  if (burstKey === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
      aria-hidden
    >
      <AnimatePresence>
        <motion.div
          key={burstKey}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="relative h-48 w-48"
        >
          <motion.div
            className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-primary)]/25 blur-2xl"
            initial={{ scale: 0.4, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          />
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 2.5}px ${p.color}`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(p.angle) * p.dist,
                y: Math.sin(p.angle) * p.dist,
                opacity: 0,
                scale: 0.15,
              }}
              transition={{
                duration: 0.9,
                delay: p.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface ResultPulseProps {
  pulseKey: number;
  children: React.ReactNode;
}

/** Rim + scale when fresh results land. */
export function ResultPulse({ pulseKey, children }: ResultPulseProps) {
  return (
    <motion.div
      key={pulseKey}
      initial={{ scale: 0.992, boxShadow: '0 0 0 3px rgba(124, 108, 255, 0.5)' }}
      animate={{
        scale: 1,
        boxShadow: '0 0 0 0px rgba(124, 108, 255, 0)',
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className="rounded-2xl"
    >
      {children}
    </motion.div>
  );
}
