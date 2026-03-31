import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourseStore } from '@/stores/courseStore';
import { loadSqlWorlds } from '@/data/courses/loadSqlWorlds';
import type { World } from '@/data/courses/types';
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
  const [sqlWorlds, setSqlWorlds] = useState<World[] | null>(null);

  useEffect(() => {
    void loadSqlWorlds().then(setSqlWorlds);
  }, []);

  const done = Object.values(levelsCompleted).filter((l) => l.completed).length;
  const sqlLevels = sqlWorlds?.reduce((n, w) => n + w.levels.length, 0) ?? null;
  const mongoLevels = mongoWorlds.reduce((n, w) => n + w.levels.length, 0);
  const totalLevels = (sqlLevels ?? 0) + mongoLevels;
  const rank = rankForXp(totalXP);
  const unlocked = unlockedAchievementIds({
    totalXP,
    stats,
    levelsCompleted,
    worlds: sqlWorlds ?? [],
  });

  return (
    <div className="relative h-full overflow-auto bg-transparent p-6 md:p-8">
      <div
        className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full opacity-25 blur-[90px]"
        style={{ background: 'var(--accent-primary)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-20 right-0 h-56 w-56 rounded-full opacity-20 blur-[80px]"
        style={{ background: 'var(--accent-secondary)' }}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto max-w-3xl"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--accent-secondary)]">
          Your command center
        </p>
        <h1 className="qf-display text-3xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-5xl">
          <span className="qf-shimmer-title bg-gradient-to-r from-[var(--text-primary)] via-[var(--accent-secondary)] to-[var(--accent-primary)] bg-clip-text text-transparent">
            Welcome back
          </span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
          SQL workspace, document filters, and a leveled course — progress stays on this device (and
          syncs to the cloud when you ship a Pro tier).
        </p>

        <div className="qf-glass mt-6 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Suggested path
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Build fundamentals through Summit, then tackle the{' '}
            <Link to="/learn?t=grind" className="font-medium text-[var(--accent-primary)] hover:underline">
              SQL Grind
            </Link>{' '}
            (interview-style). Next,{' '}
            <Link to="/learn?t=windows" className="font-medium text-[var(--accent-info)] hover:underline">
              Window functions lab
            </Link>{' '}
            (World 31) adds FIRST_VALUE, LAG/LEAD, and moving frames — finish every level there to earn
            the Pane breaker achievement — then open{' '}
            <Link to="/learn?t=bank" className="font-medium text-[var(--accent-primary)] hover:underline">
              Interview bank
            </Link>{' '}
            (worlds 40–49) for 300 Summit drills, then any industry world for scenario reps. The{' '}
            <Link to="/learn/mongo" className="font-medium text-[var(--accent-primary)] hover:underline">
              Mongo track
            </Link>{' '}
            runs in parallel on local JSON.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--accent-primary)]/30 bg-gradient-to-br from-[var(--accent-primary)]/14 via-transparent to-[var(--accent-secondary)]/10 p-6 shadow-lg shadow-[var(--accent-primary)]/10">
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
          {[
            {
              label: 'XP',
              value: totalXP,
              valueClass: 'text-[var(--accent-warning)]',
              sub: null as string | null,
            },
            {
              label: 'Levels',
              value:
                sqlLevels == null ? '…' : `${done}/${totalLevels}`,
              valueClass: 'text-[var(--accent-success)]',
              sub:
                sqlLevels == null
                  ? 'Loading course catalog…'
                  : `SQL ${sqlLevels} + Mongo ${mongoLevels}`,
            },
            {
              label: 'Streak',
              value: `${stats.streakDays} day${stats.streakDays === 1 ? '' : 's'}`,
              valueClass: 'text-[var(--accent-info)]',
              sub: 'Open the app on consecutive days',
            },
            {
              label: 'Queries run',
              value: String(stats.queryRunsTotal),
              valueClass: 'text-[var(--text-primary)]',
              sub: 'SQL in workspace & challenges',
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04, type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="qf-glass rounded-xl p-4"
            >
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                {card.label}
              </div>
              <div className={`mt-1 text-2xl font-bold ${card.valueClass}`}>{card.value}</div>
              {card.sub ? (
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">{card.sub}</p>
              ) : null}
            </motion.div>
          ))}
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
            className="rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[#5b4dff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--accent-primary)]/25 transition hover:brightness-110 active:scale-[0.98]"
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
            to="/learn?t=grind"
            className="rounded-xl border border-[var(--accent-warning)]/35 bg-[var(--accent-warning)]/10 px-5 py-3 text-sm font-semibold text-[var(--text-primary)]"
          >
            SQL Grind (interview)
          </Link>
          <Link
            to="/learn?t=windows"
            className="rounded-xl border border-[var(--accent-info)]/35 bg-[var(--accent-info)]/10 px-5 py-3 text-sm font-semibold text-[var(--text-primary)]"
          >
            Window functions lab
          </Link>
          <Link
            to="/learn?t=bank"
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
