import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { worlds } from '@/data/courses';
import { useCourseStore } from '@/stores/courseStore';

export function CourseMap() {
  const levelsCompleted = useCourseStore((s) => s.levelsCompleted);
  const totalLevels = worlds.reduce((n, w) => n + w.levels.length, 0);

  return (
    <div className="h-full overflow-auto p-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">SQL course map</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
        {worlds.length} worlds, {totalLevels} levels — fundamentals through analytics, plus the SQL
        Grind Set (LeetCode-style interview problems: anti-joins, EXISTS, CTEs, ranking). Each
        challenge lists constraints, a solve guide, and five progressive hints. Jump anywhere;
        progress and XP still save.
      </p>
      <p className="mt-3 text-sm">
        <Link
          to="/learn/mongo"
          className="font-medium text-[var(--accent-primary)] hover:underline"
        >
          MongoDB track →
        </Link>{' '}
        <span className="text-[var(--text-muted)]">(JSON filters, $elemMatch, local data)</span>
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {worlds.map((w, i) => {
          const completedInWorld = w.levels.filter(
            (l) => levelsCompleted[l.id]?.completed,
          ).length;
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
                  <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                    {w.name}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">{w.subtitle}</p>
                </div>
                <span
                  className="rounded-full px-2 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: w.color }}
                >
                  {completedInWorld}/{w.levels.length}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">{w.description}</p>
              <ul className="mt-4 space-y-1">
                {w.levels.map((l) => {
                  const done = levelsCompleted[l.id]?.completed;
                  return (
                    <li key={l.id}>
                      <Link
                        to={`/learn/${l.id}`}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--bg-tertiary)]"
                      >
                        <span className="text-[var(--text-primary)]">{l.title}</span>
                        {done ? <span className="text-[var(--accent-success)]">✓</span> : null}
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
