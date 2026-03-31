import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { QueryResult } from '@/types/queryforge';

interface ResultsTableProps {
  result: QueryResult | null;
  maxHeight?: number;
}

export function ResultsTable({ result, maxHeight = 320 }: ResultsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const gridReady =
    result != null &&
    !result.error &&
    result.columns.length > 0;

  const rows = gridReady ? result.rows : [];
  const columns = gridReady ? result.columns : [];

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 16,
  });

  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border-subtle)] p-6 text-center text-sm text-[var(--text-secondary)]">
        Run a query to see results here.
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="rounded-lg border border-[var(--accent-error)]/40 bg-[var(--accent-error)]/10 p-4 text-sm text-[var(--accent-error)]">
        {result.error}
      </div>
    );
  }

  if (result.columns.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-4 text-sm text-[var(--text-secondary)]">
        {result.type} completed
        {result.affectedRows != null ? ` · ${result.affectedRows} row(s) affected` : ''} ·{' '}
        {result.executionTimeMs}ms
      </div>
    );
  }

  const colCount = columns.length;
  const gridTemplate = `repeat(${colCount}, minmax(120px, 1fr))`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
        <span>
          {result.rowCount} row{result.rowCount === 1 ? '' : 's'}
        </span>
        <span>·</span>
        <span>{result.executionTimeMs}ms</span>
      </div>
      <div
        ref={parentRef}
        className="overflow-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-editor)]"
        style={{ maxHeight }}
      >
        <div
          className="sticky top-0 z-10 grid gap-0 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2 py-2 text-xs font-medium text-[var(--accent-info)]"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {columns.map((c) => (
            <div key={c} className="truncate px-1">
              {c}
            </div>
          ))}
        </div>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((v) => {
            const row = rows[v.index]!;
            return (
              <div
                key={v.key}
                className="absolute left-0 grid w-full border-b border-[var(--border-subtle)]/40 px-2 py-1 text-xs hover:bg-[var(--bg-tertiary)]/40"
                style={{
                  height: `${v.size}px`,
                  transform: `translateY(${v.start}px)`,
                  gridTemplateColumns: gridTemplate,
                }}
              >
                {row.map((cell, i) => (
                  <div
                    key={i}
                    className="truncate font-mono text-[var(--text-primary)]"
                    title={cell == null ? 'NULL' : String(cell)}
                  >
                    {cell == null ? (
                      <span className="rounded bg-[var(--bg-tertiary)] px-1 text-[var(--text-muted)]">
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
  );
}
