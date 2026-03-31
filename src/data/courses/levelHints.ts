import type { HintTier } from './types';

export function solutionHints(): HintTier[] {
  return [
    {
      tier: 1,
      cost: 0,
      headline: 'Understand the output',
      content:
        'Name the exact columns, sort order, and filters. Sketch which tables hold each column before writing SQL.',
    },
    {
      tier: 2,
      cost: 6,
      headline: 'Decompose',
      content:
        'Break into sub-problems: (1) base rows, (2) joins, (3) filters, (4) aggregation, (5) ORDER BY / LIMIT. Implement the inner shape first, then wrap.',
    },
    {
      tier: 3,
      cost: 12,
      headline: 'Pattern match',
      content:
        '“Per X” → GROUP BY X. “Only rows with …” → HAVING or WHERE. “Top 1” → ORDER BY … DESC, LIMIT 1 (watch tie-breakers). “Absent rows” → NOT EXISTS or LEFT JOIN … IS NULL.',
    },
    {
      tier: 4,
      cost: 20,
      headline: 'Validate',
      content:
        'Run a COUNT(*) or SELECT * with LIMIT on intermediate steps. If results look empty, relax filters or check join direction (fact vs dimension).',
    },
    {
      tier: 5,
      cost: 35,
      headline: 'Last-mile check',
      content:
        'Re-read every constraint (columns, aliases, ORDER BY, string quotes). Run your query and compare row count and column names to the task — the reference is not shown so you own the solution.',
    },
  ];
}
