import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mongoWorlds } from '@/data/mongoCourse/mongoWorlds';
import { useCourseStore } from '@/stores/courseStore';

export function MongoCourseMap() {
  const levelsCompleted = useCourseStore((s) => s.levelsCompleted);
  const total = mongoWorlds.reduce((n, w) => n + w.levels.length, 0);

  return (
    <div className="h-full overflow-auto p-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">MongoDB course map</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
        {mongoWorlds.length} modules, {total} challenges — LeetCode-style JSON filters on local
        documents (no server). Each problem has constraints, a “how to think” guide, and five
        progressive hints (canonical answer on the last tier). Jump anywhere; XP still saves.
      </p>
      <p className="mt-3 text-sm">
        <Link to="/learn" className="text-[var(--accent-info)] hover:underline">
          ← SQL course
        </Link>
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {mongoWorlds.map((w, i) => {
          const done = w.levels.filter((l) => levelsCompleted[l.id]?.completed).length;
          return (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5"
              style={{ boxShadow: `0 0 0 1px ${w.color}44` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-2xl">{w.icon}</div>
                  <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{w.name}</h2>
                  <p className="text-xs text-[var(--text-muted)]">{w.subtitle}</p>
                </div>
                <span
                  className="rounded-full px-2 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: w.color }}
                >
                  {done}/{w.levels.length}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">{w.description}</p>
              <ul className="mt-4 space-y-1">
                {w.levels.map((l) => (
                  <li key={l.id}>
                    <Link
                      to={`/learn/mongo/${l.id}`}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--bg-tertiary)]"
                    >
                      <span className="text-[var(--text-primary)]">{l.title}</span>
                      {levelsCompleted[l.id]?.completed ? (
                        <span className="text-[var(--accent-success)]">✓</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
