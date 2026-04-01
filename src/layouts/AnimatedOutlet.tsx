import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};

/**
 * Soft cross-fade between routes. The motion page must be referentially stable whenever
 * `pathname` + `search` are unchanged: AppShell re-renders (Zustand, etc.) would otherwise
 * create a new `<motion.div>` every time and Framer's AnimatePresence keeps diffing
 * `presentChildren !== diffedChildren`, returning null — blank main content until the next
 * navigation "fixes" the tree.
 */
export function AnimatedOutlet() {
  const location = useLocation();
  const presenceKey = `${location.pathname}${location.search}`;

  const page = useMemo(
    () => (
      <motion.div
        key={presenceKey}
        className="relative z-[1] flex h-full min-h-0 flex-col"
        {...pageTransition}
      >
        <Outlet />
      </motion.div>
    ),
    [presenceKey],
  );

  return <AnimatePresence mode="sync">{page}</AnimatePresence>;
}
