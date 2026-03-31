import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mongoWorlds } from '@/data/mongoCourse/mongoWorlds';
import type { MongoLevel } from '@/data/mongoCourse/types';
import { useCourseStore } from '@/stores/courseStore';

const diffClass: Record<'Easy' | 'Medium' | 'Hard', string> = {
  Easy: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/35',
  Medium: 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/35',
  Hard: 'bg-rose-500/15 text-rose-800 dark:text-rose-200 border-rose-500/35',
};

function mongoLevelDifficulty(l: MongoLevel): 'Easy' | 'Medium' | 'Hard' {
  if (l.difficulty) return l.difficulty;
  if (l.isBoss) return 'Hard';
  if (l.parTimeSeconds >= 200) return 'Medium';
  return 'Easy';
}

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
        <Link to="/learn" className="font-medium text-[var(--accent-primary)] hover:underline">
          ← SQL course map
        </Link>{' '}
        <span className="text-[var(--text-muted)]">(fundamentals, Grind, windows, industries)</span>
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {mongoWorlds.map((w, i) => {
          const done = w.levels.filter((l) => levelsCompleted[l.id]?.completed).length;
          return (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5"
              style={{ boxShadow: `0 0 0 1px ${w.color}22` }}
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
                {w.levels.map((l) => {
                  const d = mongoLevelDifficulty(l);
                  const complete = levelsCompleted[l.id]?.completed === true;
                  return (
                    <li key={l.id}>
                      <Link
                        to={`/learn/mongo/${l.id}`}
                        className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--bg-tertiary)]"
                      >
                        <span className="min-w-0 flex-1 text-[var(--text-primary)]">{l.title}</span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${diffClass[d]}`}
                          >
                            {d}
                          </span>
                          {l.isBoss ? (
                            <span className="text-[10px] font-semibold text-[var(--accent-warning)]">
                              Boss
                            </span>
                          ) : null}
                          {complete ? <span className="text-[var(--accent-success)]">✓</span> : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
