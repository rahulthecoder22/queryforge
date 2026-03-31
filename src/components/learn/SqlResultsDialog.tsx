import { motion, AnimatePresence } from 'framer-motion';
import { ResultsTable } from '@/components/editor/ResultsTable';
import type { QueryResult } from '@/types/queryforge';

type Props = {
  open: boolean;
  onClose: () => void;
  result: QueryResult | null;
};

export function SqlResultsDialog({ open, onClose, result }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key="sql-results-backdrop"
            type="button"
            aria-label="Close results"
            className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Flexbox centers the panel. Do not combine Tailwind -translate-y-1/2 with Framer `y` — that stacks transforms and clips the top. */}
          <motion.div
            key="sql-results-panel"
            className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="qf-glass pointer-events-auto flex max-h-[min(88vh,900px)] w-full max-w-[min(1100px,96vw)] flex-col overflow-hidden rounded-2xl shadow-2xl shadow-black/40"
            >
            <header className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent-primary)]">
                  Results window
                </p>
                <p className="text-xs text-[var(--text-muted)]">Virtualized table — safe for large result sets</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2 text-xs font-medium"
              >
                Close
              </button>
            </header>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
              <ResultsTable result={result} maxHeight={540} />
            </div>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
