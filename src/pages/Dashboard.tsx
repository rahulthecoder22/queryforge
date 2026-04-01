import { useEffect, useMemo, useState } from 'react';
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

const PATH_STEPS: {
  step: number;
  title: string;
  blurb: string;
  to: string;
  cta: string;
  accent?: 'warning' | 'info' | 'primary';
}[] = [
  {
    step: 1,
    title: 'SQL foundations',
    blurb: 'Worlds 1–13 — syntax through joins and aggregates.',
    to: '/learn',
    cta: 'Open SQL hub',
    accent: 'primary',
  },
  {
    step: 2,
    title: 'Interview tempo',
    blurb: 'Timed, constraint-style problems (SQL Grind).',
    to: '/learn?t=grind',
    cta: 'SQL Grind',
    accent: 'warning',
  },
  {
    step: 3,
    title: 'Windows & drill bank',
    blurb: 'World 31, then 300 Summit-style drills (worlds 40–49).',
    to: '/learn?t=windows',
    cta: 'Window lab',
    accent: 'info',
  },
  {
    step: 4,
    title: 'Mongo in parallel',
    blurb: 'JSON filters on local documents — same XP store.',
    to: '/learn/mongo',
    cta: 'Mongo map',
    accent: 'primary',
  },
];

export function Dashboard() {
  const totalXP = useCourseStore((s) => s.totalXP);
  const levelsCompleted = useCourseStore((s) => s.levelsCompleted);
  const stats = useCourseStore((s) => s.stats);
  const [sqlWorlds, setSqlWorlds] = useState<World[] | null>(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

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

  const achievementsOrdered = useMemo(() => {
    const on = ACHIEVEMENTS.filter((a) => unlocked.has(a.id));
    const off = ACHIEVEMENTS.filter((a) => !unlocked.has(a.id));
    return [...on, ...off];
  }, [unlocked]);

  const achievementsVisible = showAllAchievements
    ? achievementsOrdered
    : achievementsOrdered.slice(0, 6);

  return (
    <div className="relative h-full overflow-auto bg-transparent px-5 py-8 md:px-10 md:py-10">
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
        className="relative mx-auto max-w-3xl space-y-12 md:space-y-14"
      >
        {/* —— Hero —— */}
        <header className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--accent-secondary)]">
            Dashboard
          </p>
          <h1 className="qf-display text-3xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-5xl">
            <span className="qf-shimmer-title bg-gradient-to-r from-[var(--text-primary)] via-[var(--accent-secondary)] to-[var(--accent-primary)] bg-clip-text text-transparent">
              Welcome back
            </span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[var(--text-secondary)]">
            Your progress lives on this device. Start with a primary action below — everything else is
            optional detail.
          </p>
        </header>

        {/* —— Primary actions (what to do first) —— */}
        <section aria-labelledby="dash-primary-label">
          <h2 id="dash-primary-label" className="sr-only">
            Primary actions
          </h2>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Start here
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/learn"
              className="inline-flex flex-1 min-w-[200px] items-center justify-center rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] to-[#5b4dff] px-6 py-4 text-center text-sm font-bold text-white shadow-lg shadow-[var(--accent-primary)]/30 transition hover:brightness-110 active:scale-[0.99]"
            >
              Continue SQL course
            </Link>
            <Link
              to="/workspace"
              className="inline-flex flex-1 min-w-[160px] items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 px-6 py-4 text-center text-sm font-semibold text-[var(--text-primary)] backdrop-blur-sm transition hover:border-[var(--accent-primary)]/40 hover:bg-[var(--glass-highlight)]"
            >
              SQL workspace
            </Link>
            <Link
              to="/documents"
              className="inline-flex flex-1 min-w-[140px] items-center justify-center rounded-2xl border border-dashed border-[var(--border-subtle)] px-5 py-3.5 text-center text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent-info)]/50 hover:text-[var(--text-primary)]"
            >
              Document lab
            </Link>
          </div>
        </section>

        {/* —— Progress (rank + stats in one card) —— */}
        <section aria-labelledby="dash-progress-label" className="space-y-3">
          <h2
            id="dash-progress-label"
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]"
          >
            Your progress
          </h2>
          <div className="qf-glass overflow-hidden rounded-2xl">
            <div className="border-b border-[var(--border-subtle)] bg-gradient-to-br from-[var(--accent-primary)]/12 to-transparent px-5 py-5 md:px-6 md:py-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">
                    Rank
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
                    {rank.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{rank.flavor}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{totalXP}</p>
                  <p className="text-xs text-[var(--text-muted)]">total XP</p>
                  {rank.nextAt != null ? (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Next tier at{' '}
                      <span className="font-semibold text-[var(--accent-warning)]">{rank.nextAt}</span> XP
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-[var(--accent-success)]">Max rank</p>
                  )}
                </div>
              </div>
              {rank.nextAt != null ? (
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[#5b4dff]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(rank.progress * 100)}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  />
                </div>
              ) : null}
            </div>
            <div className="grid gap-px bg-[var(--border-subtle)] sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: 'Levels cleared',
                  value: sqlLevels == null ? '…' : `${done} / ${totalLevels}`,
                  hint: sqlLevels == null ? 'Loading catalog…' : `${sqlLevels} SQL · ${mongoLevels} Mongo`,
                },
                {
                  label: 'Streak',
                  value: `${stats.streakDays}d`,
                  hint: 'Open the app on consecutive days',
                },
                {
                  label: 'Queries run',
                  value: String(stats.queryRunsTotal),
                  hint: 'Workspace + challenges',
                },
                {
                  label: 'Achievements',
                  value: `${unlocked.size} / ${ACHIEVEMENTS.length}`,
                  hint: 'Unlocked badges',
                },
              ].map((cell) => (
                <div
                  key={cell.label}
                  className="bg-[var(--bg-secondary)]/90 px-4 py-4 backdrop-blur-sm md:px-5"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {cell.label}
                  </p>
                  <p className="mt-1.5 text-xl font-bold tabular-nums text-[var(--text-primary)]">
                    {cell.value}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-[var(--text-muted)]">{cell.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* —— Learning path (scannable steps) —— */}
        <section aria-labelledby="dash-path-label" className="space-y-4">
          <div>
            <h2
              id="dash-path-label"
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]"
            >
              Recommended order
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Four beats — tap a step when you are ready. Skip around anytime; XP still saves.
            </p>
          </div>
          <ol className="space-y-3">
            {PATH_STEPS.map((s) => {
              const border =
                s.accent === 'warning'
                  ? 'border-l-[var(--accent-warning)]'
                  : s.accent === 'info'
                    ? 'border-l-[var(--accent-info)]'
                    : 'border-l-[var(--accent-primary)]';
              return (
                <li
                  key={s.step}
                  className={`flex flex-col gap-2 rounded-xl border border-[var(--border-subtle)] border-l-4 ${border} bg-[var(--bg-secondary)]/50 py-4 pl-4 pr-4 md:flex-row md:items-center md:justify-between md:pl-5`}
                >
                  <div className="flex gap-3 md:gap-4">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-sm font-bold text-[var(--accent-primary)]"
                      aria-hidden
                    >
                      {s.step}
                    </span>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{s.title}</p>
                      <p className="mt-0.5 text-sm leading-snug text-[var(--text-secondary)]">{s.blurb}</p>
                    </div>
                  </div>
                  <Link
                    to={s.to}
                    className="shrink-0 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-[var(--accent-primary)] transition hover:bg-[var(--accent-primary)]/15 md:ml-4"
                  >
                    {s.cta} →
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className="text-center text-xs text-[var(--text-muted)]">
            Interview bank drills:{' '}
            <Link to="/learn?t=bank" className="font-medium text-[var(--accent-primary)] hover:underline">
              open the Bank tab
            </Link>{' '}
            in the SQL hub
          </p>
        </section>

        {/* —— Achievements (collapsed by default) —— */}
        <section aria-labelledby="dash-ach-label" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                id="dash-ach-label"
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]"
              >
                Achievements
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Unlocked first — {unlocked.size} of {ACHIEVEMENTS.length}
              </p>
            </div>
            {ACHIEVEMENTS.length > 6 ? (
              <button
                type="button"
                onClick={() => setShowAllAchievements((v) => !v)}
                className="text-xs font-semibold text-[var(--accent-info)] hover:underline"
              >
                {showAllAchievements ? 'Show fewer' : `Show all ${ACHIEVEMENTS.length}`}
              </button>
            ) : null}
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {achievementsVisible.map((a, i) => {
              const on = unlocked.has(a.id);
              return (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 8) * 0.03 }}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                    on
                      ? 'border-[var(--accent-success)]/35 bg-[var(--accent-success)]/8'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 opacity-70'
                  }`}
                >
                  <span className="text-xl leading-none" aria-hidden>
                    {on ? a.icon : '🔒'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium leading-snug text-[var(--text-primary)]">{a.title}</p>
                    <p className="mt-1 text-xs leading-snug text-[var(--text-secondary)]">{a.description}</p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </section>

        {/* —— Secondary links (compact) —— */}
        <footer className="space-y-4 border-t border-[var(--border-subtle)] pt-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            More
          </p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link to="/learn/wiki" className="text-[var(--accent-primary)] hover:underline">
              Wiki
            </Link>
            <Link to="/masterclass" className="text-[var(--accent-primary)] hover:underline">
              Masterclass
            </Link>
            <Link to="/learn?t=bank" className="text-[var(--accent-primary)] hover:underline">
              Interview bank
            </Link>
            <Link to="/interview-guide" className="text-[var(--accent-primary)] hover:underline">
              Interview guide
            </Link>
            <Link to="/settings" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              Settings
            </Link>
          </nav>
          <details className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30 px-4 py-3 text-xs text-[var(--text-muted)]">
            <summary className="cursor-pointer font-medium text-[var(--text-secondary)]">
              QueryForge Pro (roadmap)
            </summary>
            <p className="mt-2 leading-relaxed">
              Sign-in, billing, cloud sync, Atlas sandboxes, teams, certificates. The free app stays
              offline-capable for SQLite and local document drills.
            </p>
          </details>
        </footer>
      </motion.div>
    </div>
  );
}
