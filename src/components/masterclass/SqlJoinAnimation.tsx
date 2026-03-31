import { motion } from 'framer-motion';

const leftRows = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Ben' },
  { id: 3, name: 'Cleo' },
];

const rightRows = [
  { cust: 1, item: 'Pen' },
  { cust: 2, item: 'Desk' },
  { cust: 4, item: 'Lamp' },
];

export function SqlJoinAnimation() {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
      <p className="mb-3 text-xs font-medium text-[var(--text-secondary)]">
        Inner join keeps only rows where the key matches on both sides.
      </p>
      <div className="flex flex-wrap items-start justify-center gap-6">
        <div>
          <div className="mb-1 text-center text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
            customers
          </div>
          <div className="space-y-1">
            {leftRows.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex min-w-[140px] items-center gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-2 py-1 font-mono text-xs text-[var(--text-primary)]"
              >
                <span className="text-[var(--accent-primary)]">{r.id}</span>
                <span>{r.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-center text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
            orders
          </div>
          <div className="space-y-1">
            {rightRows.map((r, i) => (
              <motion.div
                key={`${r.cust}-${r.item}`}
                layout
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex min-w-[140px] items-center gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-2 py-1 font-mono text-xs text-[var(--text-primary)]"
              >
                <span className="text-[var(--accent-warning)]">{r.cust}</span>
                <span>{r.item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <svg className="mx-auto mt-2 h-16 w-full max-w-md text-[var(--accent-primary)]" aria-hidden>
        <motion.line
          x1="18%"
          y1="8"
          x2="52%"
          y2="48"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />
        <motion.line
          x1="18%"
          y1="32"
          x2="52%"
          y2="48"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        />
        <motion.text
          x="50%"
          y="58"
          textAnchor="middle"
          className="fill-[var(--text-muted)] text-[10px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          ON customers.id = orders.cust_id
        </motion.text>
      </svg>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-2 rounded-lg bg-[var(--bg-editor)] p-2 text-center font-mono text-[11px] text-[var(--text-primary)]"
      >
        Result: (1, Ada, Pen) · (2, Ben, Desk) — row with cust 4 dropped
      </motion.div>
    </div>
  );
}
