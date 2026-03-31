/** Quick-reference bullets for grind + window worlds (SQL interviews). */
export function InterviewPatternsCallout({ worldId }: { worldId: number }) {
  if (worldId !== 14 && worldId !== 31) return null;

  const items =
    worldId === 14
      ? [
          { t: 'NOT EXISTS', d: '“Never” / no matching rows — anti-join without outer-join NULL checks.' },
          { t: 'Double EXISTS', d: 'Two independent predicates on the same entity (e.g. hw and svc).' },
          { t: 'CTE + AVG', d: 'Compare each row to a global aggregate (above-average spenders).' },
          { t: 'HAVING COUNT = N', d: 'Exact frequency (e.g. precisely two paid orders).' },
          { t: 'LIMIT OFFSET', d: 'Nth place after ORDER BY (runner-up SKU).' },
        ]
      : [
          { t: 'ROW_NUMBER', d: 'Dense 1..N; filter rn = 1 for first row per partition.' },
          { t: 'Running SUM', d: 'ROWS UNBOUNDED PRECEDING through current row.' },
          { t: 'LAG / LEAD', d: 'Prior or next value in PARTITION BY … ORDER BY …' },
          { t: 'RANK vs dense', d: 'RANK gaps on ties; use for leaderboards and bands.' },
          { t: 'FIRST_VALUE', d: 'Opening row per partition; collapse with DISTINCT or GROUP BY.' },
          { t: 'ROWS frame', d: 'ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING for moving averages.' },
        ];

  return (
    <details className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/40 px-3 py-2">
      <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        Interview-style patterns
      </summary>
      <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
        {items.map((x) => (
          <li key={x.t}>
            <span className="font-medium text-[var(--text-primary)]">{x.t}</span> — {x.d}
          </li>
        ))}
      </ul>
    </details>
  );
}
