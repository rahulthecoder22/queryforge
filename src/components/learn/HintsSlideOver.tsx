import { motion, AnimatePresence } from 'framer-motion';
import type { HintTier } from '@/data/courses/types';

type Props = {
  open: boolean;
  onClose: () => void;
  hints: HintTier[];
  hintTier: number;
  onNextHint: () => void;
  title?: string;
};

export function HintsSlideOver({
  open,
  onClose,
  hints,
  hintTier,
  onNextHint,
  title = 'Hints — only if you need them',
}: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close hints"
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <p className="text-xs text-[var(--text-muted)]">
                Theory above should be enough to start. Use hints only when blocked — the last step may show the
                canonical answer.
              </p>
              <div className="mt-4 space-y-4">
                {hints.slice(0, hintTier + 1).map((h) => (
                  <div key={h.tier} className="border-l-2 border-[var(--accent-primary)]/50 pl-3">
                    {h.headline ? (
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--accent-info)]">
                        {h.headline}
                      </div>
                    ) : null}
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      <span className="font-mono text-[var(--text-muted)]">{h.tier}.</span> {h.content}
                    </p>
                  </div>
                ))}
              </div>
              {hintTier < hints.length - 1 ? (
                <button
                  type="button"
                  onClick={onNextHint}
                  className="mt-6 w-full rounded-xl bg-[var(--accent-primary)] py-3 text-sm font-medium text-white hover:opacity-95"
                >
                  Next hint
                  {hints[hintTier + 1]?.cost ? ` (−${hints[hintTier + 1]!.cost} XP)` : ''}
                </button>
              ) : (
                <p className="mt-6 text-center text-xs text-[var(--text-muted)]">All hints revealed.</p>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
