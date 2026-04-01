import { Outlet } from 'react-router-dom';

/**
 * Route outlet without Framer `AnimatePresence` here: wrapping `<Outlet />` in animated
 * primitives caused intermittent blank main content (presence diff returns null, or opacity
 * stuck) on first navigation—especially to `/learn`.
 */
export function AnimatedOutlet() {
  return (
    <div className="relative z-[1] flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <Outlet />
    </div>
  );
}
