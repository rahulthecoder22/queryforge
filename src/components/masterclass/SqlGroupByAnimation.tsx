import { motion } from 'framer-motion';

const rows = [
  { k: 'east', v: 10 },
  { k: 'east', v: 20 },
  { k: 'west', v: 5 },
];

export function SqlGroupByAnimation() {
  const east = rows.filter((r) => r.k === 'east');
  const west = rows.filter((r) => r.k === 'west');
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
      <p className="mb-3 text-xs font-medium text-[var(--text-secondary)]">
        GROUP BY collapses rows that share the same key, then aggregates (here: SUM) run inside each bucket.
      </p>
      <div className="flex flex-wrap items-end justify-center gap-6">
        <div>
          <div className="mb-1 text-center text-[10px] uppercase text-[var(--text-muted)]">Raw rows</div>
          <div className="space-y-1">
            {rows.map((r, i) => (
              <motion.div
                key={i}
                layout
                className="rounded border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-2 py-1 font-mono text-[10px] text-[var(--text-primary)]"
              >
                region={r.k} · amt={r.v}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="text-2xl text-[var(--text-muted)]">⇒</div>
        <div>
          <div className="mb-1 text-center text-[10px] uppercase text-[var(--text-muted)]">After GROUP BY</div>
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="rounded-lg bg-[var(--accent-primary)]/20 px-3 py-2 font-mono text-[10px] text-[var(--text-primary)]">
              east → SUM = {east.reduce((a, r) => a + r.v, 0)}
            </div>
            <div className="rounded-lg bg-[var(--accent-primary)]/20 px-3 py-2 font-mono text-[10px] text-[var(--text-primary)]">
              west → SUM = {west.reduce((a, r) => a + r.v, 0)}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
