import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourseStore } from '@/stores/courseStore';
import { worlds } from '@/data/courses';
import { mongoWorlds } from '@/data/mongoCourse/mongoWorlds';
import {
  ACHIEVEMENTS,
  rankForXp,
  unlockedAchievementIds,
} from '@/lib/achievements';

export function Dashboard() {
  const totalXP = useCourseStore((s) => s.totalXP);
  const levelsCompleted = useCourseStore((s) => s.levelsCompleted);
  const stats = useCourseStore((s) => s.stats);

  const done = Object.values(levelsCompleted).filter((l) => l.completed).length;
  const sqlLevels = worlds.reduce((n, w) => n + w.levels.length, 0);
  const mongoLevels = mongoWorlds.reduce((n, w) => n + w.levels.length, 0);
  const totalLevels = sqlLevels + mongoLevels;
  const rank = rankForXp(totalXP);
  const unlocked = unlockedAchievementIds({
    totalXP,
    stats,
    levelsCompleted,
    worlds,
  });

  return (
    <div className="h-full overflow-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Welcome back
        </h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          SQL workspace, document filters, and a leveled course — progress stays on this device (and
          syncs to the cloud when you ship a Pro tier).
        </p>

        <div className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Suggested path
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Build fundamentals through Summit, then tackle the{' '}
            <Link to="/learn/14-1" className="font-medium text-[var(--accent-primary)] hover:underline">
              SQL Grind
            </Link>{' '}
            (interview-style). Next,{' '}
            <Link to="/learn/31-1" className="font-medium text-[var(--accent-info)] hover:underline">
              Window functions lab
            </Link>{' '}
            (World 31) adds FIRST_VALUE, LAG/LEAD, and moving frames — finish every level there to earn
            the Pane breaker achievement — then open Interview bank (worlds 40–49) for 300 Summit drills,
            then any industry world for scenario reps. The{' '}
            <Link to="/learn/mongo" className="font-medium text-[var(--accent-primary)] hover:underline">
              Mongo track
            </Link>{' '}
            runs in parallel on local JSON.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--accent-primary)]/25 bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-primary)]">
                Rank
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{rank.title}</p>
              <p className="text-sm text-[var(--text-secondary)]">{rank.flavor}</p>
            </div>
            <div className="text-right text-sm text-[var(--text-muted)]">
              {rank.nextAt != null ? (
                <>
                  <span className="text-[var(--text-primary)]">{totalXP}</span> XP
                  <br />
                  Next: <span className="text-[var(--accent-warning)]">{rank.nextAt}</span> XP
                </>
              ) : (
                <span>Max rank — {totalXP} XP</span>
              )}
            </div>
          </div>
          {rank.nextAt != null ? (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
              <motion.div
                className="h-full rounded-full bg-[var(--accent-primary)]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(rank.progress * 100)}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              />
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">XP</div>
            <div className="mt-1 text-2xl font-semibold text-[var(--accent-warning)]">{totalXP}</div>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Levels</div>
            <div className="mt-1 text-2xl font-semibold text-[var(--accent-success)]">
              {done}/{totalLevels}
            </div>
            <p className="mt-1 text-[10px] text-[var(--text-muted)]">
              SQL {sqlLevels} + Mongo {mongoLevels}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Streak</div>
            <div className="mt-1 text-2xl font-semibold text-[var(--accent-info)]">
              {stats.streakDays} day{stats.streakDays === 1 ? '' : 's'}
            </div>
            <p className="mt-1 text-[10px] text-[var(--text-muted)]">Open the app on consecutive days</p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Queries run</div>
            <div className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
              {stats.queryRunsTotal}
            </div>
            <p className="mt-1 text-[10px] text-[var(--text-muted)]">SQL in workspace & challenges</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Achievements
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {ACHIEVEMENTS.map((a, i) => {
              const on = unlocked.has(a.id);
              return (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
                    on
                      ? 'border-[var(--accent-success)]/40 bg-[var(--accent-success)]/10'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] opacity-60'
                  }`}
                >
                  <span className="text-2xl">{on ? a.icon : '🔒'}</span>
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">{a.title}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{a.description}</div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/workspace"
            className="rounded-xl bg-[var(--accent-primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--accent-primary)]/20"
          >
            SQL workspace
          </Link>
          <Link
            to="/documents"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)]"
          >
            Document lab
          </Link>
          <Link
            to="/learn"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)]"
          >
            SQL course
          </Link>
          <Link
            to="/learn/14-1"
            className="rounded-xl border border-[var(--accent-warning)]/35 bg-[var(--accent-warning)]/10 px-5 py-3 text-sm font-semibold text-[var(--text-primary)]"
          >
            SQL Grind (interview)
          </Link>
          <Link
            to="/learn/31-1"
            className="rounded-xl border border-[var(--accent-info)]/35 bg-[var(--accent-info)]/10 px-5 py-3 text-sm font-semibold text-[var(--text-primary)]"
          >
            Window functions lab
          </Link>
          <Link
            to="/learn/40-1"
            className="rounded-xl border border-[var(--accent-primary)]/35 bg-[var(--accent-primary)]/10 px-5 py-3 text-sm font-semibold text-[var(--text-primary)]"
          >
            Interview bank (300 drills)
          </Link>
          <Link
            to="/learn/mongo"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)]"
          >
            MongoDB course
          </Link>
        </div>

        <p className="mt-8 text-xs text-[var(--text-muted)]">
          <strong className="text-[var(--text-secondary)]">QueryForge Pro (roadmap)</strong> — account
          sign-in, Stripe billing, cloud progress sync, MongoDB Atlas sandboxes, team assignments, and
          certificates. The free build stays fully offline-capable for SQLite + local document drills.
        </p>
      </motion.div>
    </div>
  );
}
