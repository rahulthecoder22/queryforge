import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  count: number;
  error: string | null;
  rows: Record<string, unknown>[];
};

/** Full-screen friendly overlay so results are never buried under hints. */
export function MongoResultsDialog({ open, onClose, title, count, error, rows }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key="mongo-results-backdrop"
            type="button"
            aria-label="Close results"
            className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="mongo-results-panel"
            className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Query results"
              className="pointer-events-auto flex max-h-[min(88vh,900px)] w-full max-w-[min(960px,94vw)] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-2xl"
            >
            <header className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent-primary)]">
                  Results window
                </p>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {error ? 'Filter error' : `${count} document(s)`}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
              >
                Close
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              {error ? (
                <pre className="text-sm text-[var(--accent-error)]">{error}</pre>
              ) : (
                <ul className="space-y-3">
                  {rows.map((doc) => (
                    <li key={String(doc._id)} className="rounded-xl bg-[var(--bg-tertiary)] p-3 ring-1 ring-[var(--border-subtle)]">
                      <pre className="whitespace-pre-wrap break-all font-mono text-[11px] text-[var(--text-secondary)]">
                        {JSON.stringify(doc, null, 2)}
                      </pre>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
