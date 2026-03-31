import { useState } from 'react';

type Props = {
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  constraints?: string[];
  solveGuide?: string;
  variant?: 'sql' | 'mongo';
};

const diffStyles: Record<NonNullable<Props['difficulty']>, string> = {
  Easy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Medium: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
  Hard: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
};

export function ChallengeMetaPanel({ difficulty, constraints, solveGuide, variant = 'sql' }: Props) {
  const [open, setOpen] = useState(false);
  if (!difficulty && (!constraints || constraints.length === 0) && !solveGuide) return null;

  return (
    <section className="border-t border-[var(--border-subtle)] pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            {variant === 'mongo' ? 'Problem pack' : 'Constraints'}
          </span>
          {difficulty ? (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${diffStyles[difficulty]}`}
            >
              {difficulty}
            </span>
          ) : null}
        </div>
        {solveGuide ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-xs text-[var(--accent-info)] hover:underline"
          >
            {open ? 'Hide how to think' : 'Show how to think'}
          </button>
        ) : null}
      </div>
      {constraints && constraints.length > 0 ? (
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
          {constraints.map((c) => (
            <li key={c} className="flex gap-2">
              <span className="text-[var(--text-muted)]">—</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {solveGuide && open ? (
        <div className="mt-3 border-l-2 border-[var(--accent-info)]/50 bg-[var(--bg-tertiary)]/50 px-3 py-2 text-xs leading-relaxed text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text-primary)]">Thinking frame</p>
          <p className="mt-2 whitespace-pre-wrap">{solveGuide}</p>
        </div>
      ) : null}
    </section>
  );
}
