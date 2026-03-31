import { motion } from 'framer-motion';

const docs = [
  { _id: 'a1', tags: ['sql', 'mongo'], qty: 3 },
  { _id: 'a2', tags: ['sql'], qty: 10 },
  { _id: 'a3', tags: ['mongo', 'vector'], qty: 1 },
];

export function MongoMatchAnimation() {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
      <p className="mb-3 text-xs font-medium text-[var(--text-secondary)]">
        $match is like WHERE: it shrinks the stream early in an aggregation pipeline.
      </p>
      <div className="space-y-2">
        {docs.map((d, i) => {
          const pass = d.tags.includes('mongo') && d.qty > 1;
          return (
            <motion.div
              key={d._id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden rounded border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-2 font-mono text-[11px] text-[var(--text-primary)]"
            >
              <motion.div
                className="absolute inset-0 bg-[var(--accent-primary)]/25"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: pass ? 1 : 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.35 }}
                style={{ originX: 0 }}
              />
              <div className="relative flex justify-between gap-2">
                <span>{d._id}</span>
                <span className="text-[var(--text-secondary)]">{JSON.stringify(d.tags)} qty:{d.qty}</span>
              </div>
              <div className="relative mt-1 text-[10px] text-[var(--text-muted)]">
                {pass ? 'passes $match' : 'filtered out'}
              </div>
            </motion.div>
          );
        })}
      </div>
      <motion.pre
        className="mt-3 overflow-x-auto rounded bg-[var(--bg-editor)] p-2 text-[10px] text-[var(--text-primary)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {`{ $match: { tags: "mongo", qty: { $gt: 1 } } }`}
      </motion.pre>
    </div>
  );
}
