import { useMemo, useState, useTransition } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { World } from '@/data/courses/types';
import { useCourseStore } from '@/stores/courseStore';
import {
  SQL_LEARN_TRACKS,
  firstLevelPathInTrack,
  parseSqlLearnTrackParam,
  worldsForSqlLearnTrack,
  type SqlLearnTrack,
  type SqlLearnTrackId,
} from '@/config/sqlLearnTracks';

const diffClass: Record<'Easy' | 'Medium' | 'Hard', string> = {
  Easy: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/35',
  Medium: 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/35',
  Hard: 'bg-rose-500/15 text-rose-800 dark:text-rose-200 border-rose-500/35',
};

type Props = {
  worlds: World[];
};

const LEVEL_PREVIEW = 8;

export function SqlLearnHub({ worlds }: Props) {
  const [params, setParams] = useSearchParams();
  const [, startTransition] = useTransition();
  const trackId = parseSqlLearnTrackParam(params.get('t'));
  const levelsCompleted = useCourseStore((s) => s.levelsCompleted);
  const track = SQL_LEARN_TRACKS.find((x) => x.id === trackId) ?? SQL_LEARN_TRACKS[0]!;
  const totalLevels = useMemo(() => worlds.reduce((n, w) => n + w.levels.length, 0), [worlds]);
  const trackCounts = useMemo(() => {
    const m = new Map<SqlLearnTrackId, number>();
    for (const t of SQL_LEARN_TRACKS) {
      m.set(t.id, worldsForSqlLearnTrack(t.id, worlds).length);
    }
    return m;
  }, [worlds]);
  const filtered = useMemo(() => worldsForSqlLearnTrack(trackId, worlds), [trackId, worlds]);
  const startPath = useMemo(() => firstLevelPathInTrack(trackId, worlds), [trackId, worlds]);

  function setTrack(id: SqlLearnTrackId) {
    startTransition(() => {
      const next = new URLSearchParams(params);
      if (id === 'foundation') next.delete('t');
      else next.set('t', id);
      setParams(next, { replace: true });
    });
  }

  return (
    <div className="relative h-full overflow-auto">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] rounded-full opacity-25 blur-[100px]"
        style={{ backgroundColor: track.glowHex }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-40 h-[320px] w-[320px] rounded-full opacity-20 blur-[90px]"
        style={{ backgroundColor: track.glowHex }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <header className="mb-8 md:mb-10">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--accent-secondary)]"
          >
            SQL curriculum
          </motion.p>
          <h1 className="qf-display mt-2 text-3xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-5xl">
            <span className="qf-shimmer-title bg-gradient-to-r from-[var(--text-primary)] via-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
              Pick your mission
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">{worlds.length} worlds</span>,{' '}
            {totalLevels} levels.{' '}
            <span className="text-[var(--text-muted)]">Choose a track below, then open a world.</span>
          </p>
        </header>

        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          1 · Pick a track
        </p>
        <nav
          className="mb-8 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible"
          aria-label="SQL learning tracks"
        >
          {SQL_LEARN_TRACKS.map((t, i) => {
            const active = t.id === trackId;
            const count = trackCounts.get(t.id) ?? 0;
            return (
              <motion.button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 320, damping: 28 }}
                onClick={() => setTrack(t.id)}
                className={`relative shrink-0 snap-start rounded-2xl border px-4 py-3 text-left transition-shadow md:min-w-0 ${
                  active
                    ? 'border-transparent shadow-lg shadow-black/30'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 hover:border-[var(--border-subtle)] hover:bg-[var(--glass-highlight)]'
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="sql-learn-track-active"
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${t.tabGradient} opacity-95`}
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                ) : null}
                <span className="relative z-[1] flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                      active ? 'bg-white/15 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                    }`}
                  >
                    {t.icon}
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span
                      className={`block text-sm font-bold md:text-base ${active ? 'text-white' : 'text-[var(--text-primary)]'}`}
                    >
                      <span className="md:hidden">{t.labelShort}</span>
                      <span className="hidden md:inline">{t.label}</span>
                    </span>
                    <span
                      className={`mt-0.5 block text-[10px] font-medium uppercase tracking-wider ${active ? 'text-white/80' : 'text-[var(--text-muted)]'}`}
                    >
                      {count} world{count === 1 ? '' : 's'}
                    </span>
                  </span>
                </span>
              </motion.button>
            );
          })}
        </nav>

        <AnimatePresence mode="wait">
          <motion.section
            key={trackId}
            role="tabpanel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10"
          >
            <TrackHero track={track} startPath={startPath} />
          </motion.section>
        </AnimatePresence>

        <motion.h2
          layout
          className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]"
        >
          2 · Worlds in this track
        </motion.h2>

        <WorldGrid
          worlds={filtered}
          levelsCompleted={levelsCompleted}
          levelPreview={LEVEL_PREVIEW}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="qf-glass mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl p-5 md:flex-row md:items-center"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-info)]">
              Different engine
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Document filters and <code className="rounded bg-[var(--bg-tertiary)] px-1 font-mono text-xs">$elemMatch</code>{' '}
              live on the Mongo track — same progress store, zero SQL.
            </p>
          </div>
          <Link
            to="/learn/mongo"
            className="shrink-0 rounded-xl border border-[var(--accent-info)]/40 bg-[var(--accent-info)]/10 px-5 py-2.5 text-sm font-semibold text-[var(--accent-info)] transition hover:bg-[var(--accent-info)]/20"
          >
            Open Mongo track →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function TrackHero({ track, startPath }: { track: SqlLearnTrack; startPath: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 p-6 shadow-xl shadow-black/20 md:p-8">
      <div
        className="pointer-events-none absolute -right-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: track.glowHex }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.03)_50%,transparent_60%)]" />

      <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="text-[10px] font-bold uppercase tracking-[0.28em]"
            style={{ color: track.glowHex }}
          >
            {track.eyebrow}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="qf-display mt-2 text-2xl font-bold leading-tight text-[var(--text-primary)] md:text-3xl"
          >
            {track.headline}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.11 }}
            className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)] md:text-base"
          >
            {track.body}
          </motion.p>
          <ul className="mt-5 space-y-2">
            {track.highlights.map((h, i) => (
              <motion.li
                key={h}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.14 + i * 0.06 }}
                className="flex items-center gap-2 text-sm text-[var(--text-primary)]"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${track.glowHex}, transparent)` }}
                >
                  ✓
                </span>
                {h}
              </motion.li>
            ))}
          </ul>
          {startPath ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="mt-6"
            >
              <Link
                to={startPath}
                className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98] ${track.tabGradient}`}
              >
                Start first level
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  aria-hidden
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          ) : null}
        </div>

        <HeroOrbit accent={track.glowHex} icon={track.icon} label={track.label} />
      </div>
    </div>
  );
}

function HeroOrbit({ accent, icon, label }: { accent: string; icon: string; label: string }) {
  return (
    <div className="relative mx-auto flex h-[200px] w-full max-w-[280px] items-center justify-center md:h-[240px] md:max-w-none">
      <motion.div
        className="absolute inset-6 rounded-full border border-dashed border-[var(--border-subtle)] opacity-60"
        animate={{ rotate: 360 }}
        transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border border-[var(--border-subtle)] opacity-40"
        animate={{ rotate: -360 }}
        transition={{ duration: 64, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="relative flex h-28 w-28 items-center justify-center rounded-3xl text-4xl shadow-2xl md:h-32 md:w-32 md:text-5xl"
        style={{
          background: `radial-gradient(circle at 30% 25%, ${accent}55, var(--bg-tertiary))`,
          boxShadow: `0 0 60px -12px ${accent}`,
        }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        whileHover={{ scale: 1.04 }}
      >
        <span className="drop-shadow-lg">{icon}</span>
      </motion.div>
      <motion.span
        className="absolute bottom-2 left-1/2 max-w-[200px] -translate-x-1/2 text-center text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {label}
      </motion.span>
    </div>
  );
}

function WorldGrid({
  worlds,
  levelsCompleted,
  levelPreview,
}: {
  worlds: World[];
  levelsCompleted: Record<string, { completed: boolean; stars: number; completedAt?: string }>;
  levelPreview: number;
}) {
  const [expandedWorlds, setExpandedWorlds] = useState<Record<number, boolean>>({});

  if (worlds.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-8 text-center text-sm text-[var(--text-muted)]">
        No worlds in this track.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {worlds.map((w, i) => {
        const completedInWorld = w.levels.filter((l) => levelsCompleted[l.id]?.completed).length;
        const expanded = expandedWorlds[w.id] === true;
        const collapsible = w.levels.length > levelPreview;
        const visibleLevels =
          collapsible && !expanded ? w.levels.slice(0, levelPreview) : w.levels;
        const hiddenCount = w.levels.length - levelPreview;
        return (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: Math.min(i, 12) * 0.03,
              type: 'spring',
              stiffness: 320,
              damping: 28,
            }}
            whileHover={{ y: -2 }}
            className="qf-glass rounded-2xl p-5"
            style={{ boxShadow: `0 0 0 1px ${w.color}33, 0 16px 48px -16px ${w.color}55` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-2xl">{w.icon}</div>
                <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{w.name}</h3>
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
              {visibleLevels.map((l) => {
                const done = levelsCompleted[l.id]?.completed;
                return (
                  <li key={l.id}>
                    <Link
                      to={`/learn/${l.id}`}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[var(--glass-highlight)]"
                    >
                      <span className="min-w-0 flex-1 text-[var(--text-primary)]">{l.title}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {l.difficulty ? (
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${diffClass[l.difficulty]}`}
                          >
                            {l.difficulty}
                          </span>
                        ) : null}
                        {l.isBoss ? (
                          <span className="text-[10px] font-semibold text-[var(--accent-warning)]">
                            Boss
                          </span>
                        ) : null}
                        {done ? <span className="text-[var(--accent-success)]">✓</span> : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {collapsible ? (
              <button
                type="button"
                className="mt-3 w-full rounded-xl border border-dashed border-[var(--border-subtle)] py-2 text-xs font-semibold text-[var(--accent-primary)] transition hover:bg-[var(--accent-primary)]/10"
                onClick={() =>
                  setExpandedWorlds((prev) => ({ ...prev, [w.id]: !expanded }))
                }
              >
                {expanded ? 'Show fewer levels' : `Show all ${w.levels.length} levels (${hiddenCount} hidden)`}
              </button>
            ) : null}
          </motion.div>
        );
      })}
    </div>
  );
}
