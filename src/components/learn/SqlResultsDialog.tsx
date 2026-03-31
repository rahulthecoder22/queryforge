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
            <div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto flex max-h-[min(88vh,900px)] w-full max-w-[min(1100px,96vw)] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-2xl"
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
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <ResultsTable result={result} maxHeight={560} />
            </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
