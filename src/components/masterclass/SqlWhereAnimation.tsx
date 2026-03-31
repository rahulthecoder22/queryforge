import { motion } from 'framer-motion';

const rows = [
  { id: 1, city: 'NYC', score: 88 },
  { id: 2, city: 'NYC', score: 42 },
  { id: 3, city: 'LA', score: 91 },
  { id: 4, city: 'NYC', score: 76 },
];

export function SqlWhereAnimation() {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
      <p className="mb-3 text-xs font-medium text-[var(--text-secondary)]">
        WHERE filters rows before SELECT runs — only matching rows move forward.
      </p>
      <div className="space-y-1.5">
        {rows.map((r, i) => {
          const pass = r.city === 'NYC' && r.score >= 70;
          return (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{
                opacity: pass ? 1 : 0.28,
                x: pass ? 0 : 0,
                backgroundColor: pass ? 'var(--accent-primary)' : 'transparent',
              }}
              transition={{ delay: i * 0.12, duration: 0.35 }}
              className={`flex items-center justify-between rounded border px-2 py-1.5 font-mono text-xs ${
                pass
                  ? 'border-transparent text-white'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] line-through decoration-[var(--text-muted)]'
              }`}
            >
              <span>
                {r.id} · {r.city} · {r.score}
              </span>
              <span className="text-[10px] uppercase">{pass ? 'keep' : 'filtered'}</span>
            </motion.div>
          );
        })}
      </div>
      <motion.p
        className="mt-3 text-center font-mono text-[11px] text-[var(--text-primary)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        WHERE city = &apos;NYC&apos; AND score &gt;= 70
      </motion.p>
    </div>
  );
}
