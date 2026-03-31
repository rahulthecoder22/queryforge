import { useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { QueryResult } from '@/types/queryforge';

interface ResultsTableProps {
  result: QueryResult | null;
  maxHeight?: number;
}

function resultSignature(r: QueryResult | null): string {
  if (!r) return '∅';
  if (r.error) return `err:${r.error.slice(0, 40)}`;
  return `${r.type}-${r.rowCount}-${r.executionTimeMs}-${r.columns.join(',')}`;
}

export function ResultsTable({ result, maxHeight = 320 }: ResultsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const sig = useMemo(() => resultSignature(result), [result]);

  const gridReady =
    result != null &&
    !result.error &&
    result.columns.length > 0;

  const rows = gridReady ? result.rows : [];
  const columns = gridReady ? result.columns : [];

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 38,
    overscan: 16,
  });

  if (!result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="qf-glass rounded-2xl border border-dashed border-[var(--border-subtle)] p-8 text-center"
      >
        <p className="qf-display text-sm font-medium text-[var(--text-primary)]">Ready when you are</p>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          Run a query — results animate in row by row.
        </p>
      </motion.div>
    );
  }

  if (result.error) {
    return (
      <motion.div
        key={sig}
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="rounded-2xl border border-[var(--accent-error)]/45 bg-[var(--accent-error)]/12 px-4 py-3 text-sm text-[var(--accent-error)]"
      >
        {result.error}
      </motion.div>
    );
  }

  if (result.columns.length === 0) {
    return (
      <motion.div
        key={sig}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="qf-glass rounded-2xl px-4 py-3 text-sm text-[var(--text-secondary)]"
      >
        <span className="font-medium text-[var(--accent-success)]">{result.type}</span> completed
        {result.affectedRows != null ? ` · ${result.affectedRows} row(s) affected` : ''} ·{' '}
        <span className="font-mono text-[var(--text-muted)]">{result.executionTimeMs}ms</span>
      </motion.div>
    );
  }

  const colCount = columns.length;
  const gridTemplate = `repeat(${colCount}, minmax(120px, 1fr))`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sig}
        className="flex min-h-0 max-w-full flex-col gap-2"
        style={{ maxHeight }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        <motion.div
          className="flex flex-wrap items-center gap-2 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          <span className="rounded-full bg-[var(--accent-primary)]/15 px-2.5 py-0.5 font-semibold text-[var(--accent-primary)]">
            {result.rowCount} row{result.rowCount === 1 ? '' : 's'}
          </span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="font-mono text-[var(--text-secondary)]">{result.executionTimeMs}ms</span>
        </motion.div>
        <div className="qf-glass flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.25 }}
            className="grid shrink-0 gap-0 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/95 px-2 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--accent-info)] backdrop-blur-md"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {columns.map((c, i) => (
              <motion.div
                key={c}
                className="truncate px-1"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 + i * 0.03 }}
              >
                {c}
              </motion.div>
            ))}
          </motion.div>
          <div
            ref={parentRef}
            className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-auto overscroll-contain bg-[var(--bg-editor)]/80"
            tabIndex={0}
            role="region"
            aria-label="Query result rows"
          >
            <div
              className="min-w-max"
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
            {rowVirtualizer.getVirtualItems().map((v) => {
              const row = rows[v.index]!;
              const delayMs = Math.min(v.index, 48) * 20;
              return (
                <div
                  key={v.key}
                  className="qf-result-row-animate absolute left-0 grid w-full border-b border-[var(--border-subtle)]/50 px-2 py-1.5 text-xs transition-colors hover:bg-[var(--accent-primary)]/6"
                  style={{
                    height: `${v.size}px`,
                    transform: `translateY(${v.start}px)`,
                    gridTemplateColumns: gridTemplate,
                    animationDelay: `${delayMs}ms`,
                  }}
                >
                  {row.map((cell, i) => (
                    <div
                      key={i}
                      className="truncate font-mono text-[13px] text-[var(--text-primary)]"
                      title={cell == null ? 'NULL' : String(cell)}
                    >
                      {cell == null ? (
                        <span className="rounded-md bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-[var(--text-muted)]">
                          NULL
                        </span>
                      ) : (
                        String(cell)
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
