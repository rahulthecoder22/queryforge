import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sampleEngineeringRoster } from '@/data/documentSamples';
import { filterDocuments } from '@/lib/mongoLite';
import { useCourseStore } from '@/stores/courseStore';
import { ResultPulse } from '@/components/effects/QueryCelebration';

const defaultFilter = `{
  "role": "engineer",
  "tenureMonths": { "$gte": 18 }
}`;

export function DocumentLab() {
  const recordDocumentQuery = useCourseStore((s) => s.recordDocumentQuery);
  const [filterText, setFilterText] = useState(defaultFilter);
  const [error, setError] = useState<string | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  const rows = useMemo(() => {
    try {
      const q = JSON.parse(filterText) as unknown;
      if (q === null || typeof q !== 'object' || Array.isArray(q)) {
        return { ok: false as const, err: 'Filter must be a JSON object, e.g. { "role": "engineer" }' };
      }
      const matched = filterDocuments(sampleEngineeringRoster, q as Record<string, unknown>);
      return { ok: true as const, matched };
    } catch {
      return { ok: false as const, err: 'Invalid JSON. Check commas and quotes.' };
    }
  }, [filterText]);

  const run = useCallback(() => {
    if (!rows.ok) {
      setError(rows.err);
      return;
    }
    setError(null);
    recordDocumentQuery();
    setPulseKey((k) => k + 1);
  }, [rows, recordDocumentQuery]);

  const displayRows = rows.ok ? rows.matched : [];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-transparent">
      <header className="qf-glass shrink-0 border-b border-[var(--border-subtle)] px-4 py-4 pl-16">
        <Link to="/" className="text-xs font-medium text-[var(--accent-info)] hover:underline">
          ← Dashboard
        </Link>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-secondary)]">
          Document store
        </p>
        <h1 className="qf-display text-xl font-extrabold text-[var(--text-primary)] md:text-2xl">
          <span className="bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-info)] bg-clip-text text-transparent">
            Document lab
          </span>
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Mongo-style filters on local JSON. No cloud.
        </p>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          Flow: JSON filter → Run find → results panel
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 lg:flex-row">
          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4"
          >
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">1 · Filter (JSON)</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              <code className="text-[var(--accent-warning)]">$gte</code>,{' '}
              <code className="text-[var(--accent-warning)]">$in</code>,{' '}
              <code className="text-[var(--accent-warning)]">$and</code>, dot paths —{' '}
              <code className="text-[var(--accent-warning)]">{}</code> matches all.
            </p>
            <textarea
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              spellCheck={false}
              className="mt-3 h-56 w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 font-mono text-xs text-[var(--text-primary)]"
            />
            <button
              type="button"
              onClick={() => void run()}
              className="mt-3 rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-white"
            >
              Run find
            </button>
            {error ? (
              <p className="mt-2 text-xs text-red-400" role="alert">
                {error}
              </p>
            ) : null}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4"
          >
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">2 · Results</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {displayRows.length} document{displayRows.length === 1 ? '' : 's'}
            </p>
            <ResultPulse pulseKey={pulseKey}>
              <div className="mt-3 max-h-[min(420px,50vh)] overflow-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2">
                <ul className="space-y-2 font-mono text-[11px] text-[var(--text-secondary)]">
                  {displayRows.map((doc) => (
                    <li key={String(doc._id)} className="rounded-md bg-[var(--bg-tertiary)] p-2">
                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(doc, null, 2)}</pre>
                    </li>
                  ))}
                </ul>
              </div>
            </ResultPulse>
          </motion.section>
        </div>

        <div className="mx-auto mt-6 max-w-5xl rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-secondary)]/60 p-4 text-xs text-[var(--text-secondary)]">
          <p>
            <span className="font-medium text-[var(--text-primary)]">More practice:</span>{' '}
            <Link to="/learn/mongo" className="text-[var(--accent-info)] hover:underline">
              Mongo course map
            </Link>{' '}
            for graded challenges with hints.
          </p>
        </div>
      </div>
    </div>
  );
}
