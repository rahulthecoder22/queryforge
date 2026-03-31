import type { LessonTheory, LessonTheoryStep, TheoryVisualId } from '@/data/lessonTheory/types';
import type { Level } from './types';

function guide(
  visualId: TheoryVisualId,
  opts: {
    title?: string;
    goal?: string;
    steps: LessonTheoryStep[];
    sections?: LessonTheory['sections'];
    checklist?: string[];
    eyebrow?: string;
  },
): LessonTheory {
  return {
    eyebrow: opts.eyebrow ?? 'How to solve this',
    title: opts.title,
    goal: opts.goal,
    steps: opts.steps,
    sections: opts.sections ?? [],
    visualId,
    checklist: opts.checklist,
  };
}

const lib: Record<string, LessonTheory> = {
  selectStar: guide('sql-select', {
    title: 'Read rows from a table',
    goal: 'Return every column for each row in one table.',
    steps: [
      {
        title: 'Pick what to show',
        body: 'SELECT lists columns. Use * when the lesson wants the full row.',
      },
      {
        title: 'Name the source',
        body: 'FROM fixes the table. SQL reads that table row by row.',
        sql: 'SELECT *\nFROM ships;',
      },
      {
        title: 'Run and skim',
        body: 'Scroll the result grid once so you know column names before you filter or join.',
      },
    ],
    checklist: ['SELECT before FROM', '* = all columns'],
  }),

  columns: guide('sql-select', {
    title: 'Project only the columns you need',
    goal: 'Return a subset of columns in a specific order.',
    steps: [
      {
        title: 'List columns explicitly',
        body: 'Comma-separated names. Order in SELECT = order in the result set.',
      },
      {
        title: 'Example',
        body: 'Two columns from the same table:',
        sql: 'SELECT name, capacity_teu\nFROM ships;',
      },
    ],
    checklist: ['No trailing comma before FROM', 'Match spelling to the schema'],
  }),

  where: guide('sql-where', {
    title: 'Filter rows before they are aggregated',
    goal: 'Keep only rows that pass a true/false condition.',
    steps: [
      {
        title: 'WHERE is a predicate',
        body: 'Each row is tested; false rows disappear from the result. Compare numbers with =, <, >, BETWEEN. Compare text with single quotes.',
      },
      {
        title: 'Pattern',
        body: 'Filter on a text column with = and a literal.',
        sql: "SELECT code, name\nFROM ports\nWHERE country = 'US';",
      },
      {
        title: 'Combine tests',
        body: 'Use AND / OR with parentheses when the story asks for multiple rules.',
      },
    ],
    checklist: ["Strings use single quotes: 'US'", 'WHERE applies to raw rows, not groups'],
  }),

  join: guide('sql-join', {
    title: 'Combine related tables',
    goal: 'Attach rows from another table using a shared key.',
    steps: [
      {
        title: 'Start from the driving table',
        body: 'Put the table whose rows you care about in FROM, then JOIN the lookup table.',
      },
      {
        title: 'Match keys with ON',
        body: 'Usually foreign key = primary key. Aliases (v, s) keep the SELECT short.',
        sql: 'SELECT v.id, s.name\nFROM voyages v\nJOIN ships s ON v.ship_id = s.id;',
      },
      {
        title: 'Qualify ambiguous columns',
        body: 'If both tables have id, write v.id or s.id so the engine knows which one you mean.',
      },
    ],
    checklist: ['JOIN needs ON (or equivalent)', 'One row in A can match one row in B per key'],
  }),

  group: guide('sql-group', {
    title: 'Aggregate rows that share a key',
    goal: 'Collapse many rows into one summary row per group.',
    steps: [
      {
        title: 'Choose the grain',
        body: 'Decide what one output row represents (per ship, per voyage, per customer, …). That key goes in GROUP BY.',
      },
      {
        title: 'Use aggregate functions',
        body: 'COUNT(*), SUM(col), AVG(col), MIN/MAX turn a bag of rows inside the group into a single value.',
        sql: 'SELECT ship_id, COUNT(*) AS trip_count\nFROM voyages\nGROUP BY ship_id;',
      },
      {
        title: 'SELECT vs GROUP BY',
        body: 'Every non-aggregated column in SELECT must appear in GROUP BY (standard SQL).',
      },
      {
        title: 'Filter groups with HAVING',
        body: 'WHERE removes rows before grouping. HAVING removes groups after aggregation (e.g. HAVING COUNT(*) > 3).',
      },
    ],
    checklist: ['WHERE before groups, HAVING after', 'COUNT(*) counts rows inside each group'],
  }),

  groupRank: guide('sql-group', {
    title: 'Find the “top” group',
    goal: 'After counting per group, pick the group with the highest metric.',
    steps: [
      {
        title: 'Aggregate first',
        body: 'GROUP BY your key and compute COUNT / SUM / AVG as required.',
      },
      {
        title: 'Sort the summaries',
        body: 'ORDER BY the aggregate (use the column alias). DESC puts the largest first.',
        sql: 'SELECT ship_id, COUNT(*) AS voyage_count\nFROM voyages\nGROUP BY ship_id\nORDER BY voyage_count DESC;',
      },
      {
        title: 'Keep one winner',
        body: 'LIMIT 1 returns a single row—the top bucket after sorting.',
      },
    ],
    checklist: ['ORDER BY runs after GROUP BY', 'Ties: two groups with the same max both appear until you LIMIT'],
  }),

  orderLimit: guide('none', {
    title: 'Sort and trim',
    goal: 'Order rows by a column, then return only the first row(s).',
    steps: [
      {
        title: 'ORDER BY',
        body: 'ASC (default) smallest first; DESC largest first. Tie-break with a second column if needed.',
      },
      {
        title: 'LIMIT',
        body: 'Cuts the result to N rows after sorting.',
        sql: 'SELECT id, description, weight_kg\nFROM cargo\nORDER BY weight_kg DESC\nLIMIT 1;',
      },
    ],
    checklist: ['ORDER BY is last among SELECT / FROM / WHERE', 'LIMIT applies after ORDER BY'],
  }),
};

export function resolveSqlTheory(level: Pick<Level, 'concept' | 'theory'>): LessonTheory {
  if (level.theory) return level.theory;
  const c = level.concept.toLowerCase();

  if (c.includes('select *')) return lib.selectStar;
  if (c.includes('column')) return lib.columns;
  if (c.includes('where') || c.includes('like') || c.includes('between') || c.includes('null'))
    return lib.where;
  if (c.includes('join') || c.includes('inner') || c.includes('outer')) return lib.join;

  if (c.includes('order') && c.includes('limit') && !c.includes('group')) return lib.orderLimit;

  if (c.includes('group') && (c.includes('order') || c.includes('limit'))) return lib.groupRank;
  if (c.includes('group') || c.includes('having') || c.includes('aggregate') || c.includes('count'))
    return lib.group;

  if (
    c.includes('window') ||
    c.includes('row_number') ||
    c.includes('partition by') ||
    c.includes('partition') ||
    c.includes('lag ') ||
    c.includes('lead ') ||
    (c.includes('rank') && (c.includes('window') || c.includes('over'))) ||
    c.includes('ntile') ||
    (c.includes('running') && c.includes('sum')) ||
    c.includes('sum over') ||
    c.includes('first_value') ||
    (c.includes('frame') && c.includes('over'))
  ) {
    return guide('sql-window', {
      title: 'Window (analytic) functions',
      goal: 'Compute per-row metrics using a sliding frame without GROUP BY collapsing rows.',
      steps: [
        {
          title: 'PARTITION vs global',
          body: 'PARTITION BY slices the table so the window resets per key (e.g. per user). Omit it for one global ordering.',
        },
        {
          title: 'Common functions',
          body: 'ROW_NUMBER() is dense 1..N; RANK() leaves gaps after ties; FIRST_VALUE picks the opening row per frame; SUM(...) OVER (ORDER BY … ROWS UNBOUNDED PRECEDING) is a running total; LAG/LEAD read neighbors; ROWS BETWEEN builds explicit moving frames.',
          sql: 'SELECT evt_ts,\n  SUM(amt) OVER (ORDER BY evt_ts ROWS UNBOUNDED PRECEDING) AS running\nFROM events;',
        },
        {
          title: 'ORDER BY matters',
          body: 'The window’s ORDER BY defines “previous” for LAG and the sort path for running aggregates.',
        },
      ],
      checklist: ['Try one user_id or date range first to debug frames', 'Watch tie-breakers in ranked outputs'],
    });
  }

  if (c.includes('not exists')) {
    return guide('none', {
      title: 'NOT EXISTS (anti-join)',
      goal: 'Keep outer rows that have no matching inner rows.',
      steps: [
        {
          title: 'Correlate the subquery',
          body: 'The inner SELECT references the outer row (e.g. o.customer_id = c.id) so each customer is tested individually.',
        },
        {
          title: 'Pattern',
          body: 'NOT EXISTS returns true when the subquery returns zero rows — “never happened”.',
          sql: "SELECT c.id FROM customers c\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id AND o.status = 'paid'\n);",
        },
      ],
    });
  }

  if (c.includes('double exists') || c.includes('two exists')) {
    return guide('none', {
      title: 'Multiple EXISTS predicates',
      goal: 'Require two independent facts about the same entity.',
      steps: [
        {
          title: 'AND two tests',
          body: 'Each EXISTS block is its own correlated existence check. Combine with AND so both must be true.',
        },
        {
          title: 'Keep correlation',
          body: 'Both subqueries should tie back to the same outer key (e.g. c.id) so logic stays per customer.',
        },
      ],
    });
  }

  if (c.includes('subquery') || c.includes('cte') || c.includes('with')) {
    return guide('none', {
      title: 'Subqueries & CTEs',
      goal: 'Reuse a SELECT as a building block inside a larger query.',
      steps: [
        {
          title: 'Subquery',
          body: 'A SELECT in parentheses can act as a value or a derived table.',
        },
        {
          title: 'CTE (WITH)',
          body: 'WITH stats AS (SELECT …) lets you name that block and read the main query top-down.',
          sql: 'WITH heavy AS (\n  SELECT id FROM cargo WHERE weight_kg > 50000\n)\nSELECT * FROM heavy;',
        },
      ],
    });
  }

  return {
    eyebrow: 'How to approach it',
    title: level.concept,
    goal: `Practice: ${level.concept}. Build the smallest query that satisfies the challenge, then refine.`,
    steps: [
      {
        title: 'Clause order',
        body: 'SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT. Not all clauses appear every time.',
      },
      {
        title: 'Iterate',
        body: 'Run after each logical step. Fix syntax first, then compare row counts to your intuition.',
      },
    ],
    sections: [],
    visualId: 'none',
    checklist: ['Use the schema rail for exact table/column names', 'Run often'],
  };
}
