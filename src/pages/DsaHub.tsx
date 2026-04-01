import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadDsaCatalog } from '@/data/dsa/catalog';
import type { DsaWorld } from '@/data/dsa/types';
import { useCourseStore } from '@/stores/courseStore';

export function DsaHub() {
  const [worlds, setWorlds] = useState<DsaWorld[] | null>(null);
  const levelsCompleted = useCourseStore((s) => s.levelsCompleted);

  useEffect(() => {
    let cancelled = false;
    void loadDsaCatalog().then((c) => {
      if (!cancelled) setWorlds(c.worlds);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (worlds == null) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
        Loading algorithms track…
      </div>
    );
  }

  const totalChallenges = worlds.reduce((n, w) => n + w.challenges.length, 0);

  return (
    <div className="relative h-full overflow-auto bg-transparent p-6 md:p-8">
      <div
        className="pointer-events-none absolute right-10 top-10 h-64 w-64 rounded-full opacity-20 blur-[90px]"
        style={{ background: '#a855f7' }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--accent-secondary)]">
          Algorithms & structures
        </p>
        <h1 className="qf-display text-2xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-4xl">
          <span className="qf-shimmer-title bg-gradient-to-r from-[var(--text-primary)] via-[var(--accent-primary)] to-[#c084fc] bg-clip-text text-transparent">
            Data structures & algorithms
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">{worlds.length} worlds</span>,{' '}
          {totalChallenges} JavaScript challenges — LeetCode-style prompts with deep explanations, hints,
          and auto-graded tests. Difficulty ramps across worlds; XP ties into your global progress.
        </p>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          Flow: pick a world → open a challenge → code → Run tests → next
        </p>
        <p className="mt-4 text-sm">
          <Link to="/" className="font-medium text-[var(--accent-primary)] hover:underline">
            ← Dashboard
          </Link>{' '}
          <span className="text-[var(--text-muted)]">·</span>{' '}
          <Link to="/learn" className="font-medium text-[var(--accent-info)] hover:underline">
            SQL course
          </Link>{' '}
          <span className="text-[var(--text-muted)]">·</span>{' '}
          <Link to="/interview-guide" className="font-medium text-[var(--accent-info)] hover:underline">
            Interview guide
          </Link>
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {worlds.map((w, i) => {
            const done = w.challenges.filter((c) => levelsCompleted[c.id]?.completed).length;
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="qf-glass rounded-2xl p-5"
                style={{ boxShadow: `0 0 0 1px ${w.color}33, 0 12px 40px -12px ${w.color}44` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-2xl">{w.icon}</div>
                    <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{w.name}</h2>
                    <p className="text-xs text-[var(--text-muted)]">{w.subtitle}</p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: w.color }}
                  >
                    {done}/{w.challenges.length}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">{w.description}</p>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">{w.learningArc}</p>
                <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto pr-1">
                  {[...w.challenges]
                    .sort((a, b) => a.order - b.order)
                    .map((c) => {
                      const complete = levelsCompleted[c.id]?.completed === true;
                      return (
                        <li key={c.id}>
                          <Link
                            to={`/learn/dsa/${c.id}`}
                            className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--bg-tertiary)]"
                          >
                            <span className="min-w-0 flex-1 text-[var(--text-primary)]">{c.title}</span>
                            <span className="flex shrink-0 items-center gap-1.5">
                              <span
                                className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                                  c.difficulty === 'Easy'
                                    ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-300'
                                    : c.difficulty === 'Medium'
                                      ? 'border-amber-500/35 bg-amber-500/15 text-amber-200'
                                      : 'border-rose-500/35 bg-rose-500/15 text-rose-200'
                                }`}
                              >
                                {c.difficulty}
                              </span>
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
    </div>
  );
}
