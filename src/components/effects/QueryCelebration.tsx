import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';

const COLORS = ['#6c63ff', '#38bdf8', '#4ade80', '#f472b6', '#fbbf24', '#c084fc'];

/** Full-screen particle burst; increment `burstKey` to replay. */
export function QueryCelebration({ burstKey }: { burstKey: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: `${burstKey}-${i}`,
        angle: (Math.PI * 2 * i) / 28 + Math.random() * 0.4,
        dist: 80 + Math.random() * 120,
        size: 4 + Math.random() * 5,
        color: COLORS[i % COLORS.length]!,
        delay: Math.random() * 0.08,
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="relative h-40 w-40"
        >
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
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(p.angle) * p.dist,
                y: Math.sin(p.angle) * p.dist,
                opacity: 0,
                scale: 0.2,
              }}
              transition={{
                duration: 0.85,
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

/** Subtle rim when fresh results land. */
export function ResultPulse({ pulseKey, children }: ResultPulseProps) {
  return (
    <motion.div
      key={pulseKey}
      initial={{ boxShadow: '0 0 0 3px rgba(108, 99, 255, 0.45)' }}
      animate={{ boxShadow: '0 0 0 0px rgba(108, 99, 255, 0)' }}
      transition={{ duration: 0.85, ease: 'easeOut' }}
      className="rounded-xl"
    >
      {children}
    </motion.div>
  );
}
