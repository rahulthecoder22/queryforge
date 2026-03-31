import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};

/** Soft cross-fade between routes without shifting layout. */
export function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="relative z-[1] flex h-full min-h-0 flex-col"
        {...pageTransition}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
