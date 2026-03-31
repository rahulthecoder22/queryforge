import { useState } from 'react';
import type { FullSchemaInfo } from '@/types/queryforge';

interface SchemaExplorerProps {
  schema: FullSchemaInfo | null | undefined;
  loading?: boolean;
  onInsertColumn?: (table: string, column: string) => void;
}

export function SchemaExplorer({
  schema,
  loading,
  onInsertColumn,
}: SchemaExplorerProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  if (loading) {
    return (
      <div className="p-3 text-xs text-[var(--text-muted)]">Loading schema…</div>
    );
  }

  if (!schema?.tables.length) {
    return (
      <div className="p-3 text-xs text-[var(--text-muted)]">
        No tables yet. Run DDL or open a sample database.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-auto p-2 text-sm">
      {schema.tables
        .filter((t) => t.type === 'table')
        .map((t) => (
          <div key={t.name}>
            <button
              type="button"
              className="flex w-full items-center gap-1 rounded px-2 py-1 text-left text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              onClick={() =>
                setOpen((o) => ({ ...o, [t.name]: !o[t.name] }))
              }
            >
              <span className="text-[var(--text-muted)]">{open[t.name] ? '▼' : '▶'}</span>
              <span className="font-medium">{t.name}</span>
            </button>
            {open[t.name] && (
              <ul className="ml-4 border-l border-[var(--border-subtle)] pl-2">
                {(schema.columnsByTable[t.name] ?? []).map((c) => (
                  <li key={c.name}>
                    <button
                      type="button"
                      className="w-full rounded px-1 py-0.5 text-left text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                      onClick={() => onInsertColumn?.(t.name, c.name)}
                    >
                      <span className="text-[var(--accent-info)]">{c.name}</span>
                      <span className="text-[var(--text-muted)]"> · {c.type}</span>
                      {c.pk ? (
                        <span className="ml-1 text-[var(--accent-warning)]">PK</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
    </div>
  );
}
