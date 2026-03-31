import { buildWorld } from '../worldFactory';

const sg = (s: string) =>
  `${s}\n\nWindows: the frame is PARTITION BY (optional) + ORDER BY; functions like ROW_NUMBER(), SUM() OVER, LAG() see neighboring rows without collapsing the grain.`;

export const world31WindowLab = buildWorld(
  {
    id: 31,
    name: 'Window & running metrics',
    subtitle: 'ROW_NUMBER · LAG/RANK · FIRST_VALUE · frames',
    theme: 'analytics',
    description:
      'SQLite 3.49+ window functions on lab_users + activity: ordered sequences, running totals, ranks, neighbors (LAG/LEAD), partition openers, and framed moving averages — typical senior analytics SQL screens.',
    database: 'sql_analytics_lab.sql',
    icon: '📊',
    color: '#0d9488',
    prerequisites: [14],
  },
  [
    {
      title: 'Ordered event index',
      isBoss: false,
      difficulty: 'Easy',
      constraints: ['user_id = 1 only', 'chronological by evt_ts', 'columns id, evt_ts, seq'],
      solveGuide: sg(
        'ROW_NUMBER() assigns 1..N within the window. Here the window is all rows for one user ordered by time.',
      ),
      story: 'Product wants a stable sequence number on alpha’s timeline for debugging exports.',
      concept: 'ROW_NUMBER window',
      task: 'For user_id = 1: id, evt_ts, and seq = ROW_NUMBER() OVER (ORDER BY evt_ts). ORDER BY evt_ts.',
      starterCode:
        'SELECT id, evt_ts,\nFROM activity\nWHERE user_id = 1\nORDER BY evt_ts;',
      expectedQuery: `SELECT id, evt_ts,
  ROW_NUMBER() OVER (ORDER BY evt_ts) AS seq
FROM activity
WHERE user_id = 1
ORDER BY evt_ts;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 6,
        expectedColumns: ['id', 'evt_ts', 'seq'],
      },
      parTimeSeconds: 200,
      xpReward: 95,
      relevantTables: ['activity'],
    },
    {
      title: 'First touch timestamp',
      isBoss: false,
      difficulty: 'Medium',
      constraints: [
        'one row per user_id',
        'earliest evt_ts only',
        'ORDER BY user_id',
      ],
      solveGuide: sg(
        'Wrap ROW_NUMBER() PARTITION BY user_id ORDER BY evt_ts, then filter rn = 1 — classic “dedupe to first row”.',
      ),
      story: 'Growth needs each account’s first-ever event time for cohort charts.',
      concept: 'PARTITION BY + ROW_NUMBER',
      task: 'user_id and evt_ts of each user’s first event; ORDER BY user_id.',
      starterCode:
        'SELECT user_id, evt_ts\nFROM (\n  SELECT user_id, evt_ts,\n    ROW_NUMBER() OVER (\n      PARTITION BY user_id\n      ORDER BY evt_ts\n    ) AS rn\n  FROM activity\n) x\nWHERE \nORDER BY user_id;',
      expectedQuery: `SELECT user_id, evt_ts
FROM (
  SELECT user_id, evt_ts,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY evt_ts
    ) AS rn
  FROM activity
) x
WHERE rn = 1
ORDER BY user_id;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 5,
        expectedColumns: ['user_id', 'evt_ts'],
      },
      parTimeSeconds: 280,
      xpReward: 130,
      relevantTables: ['activity'],
    },
    {
      title: 'Running net on one user',
      isBoss: false,
      difficulty: 'Hard',
      constraints: [
        'user_id = 1',
        'cumulative sum of impact_usd in time order',
        'alias cum',
      ],
      solveGuide: sg(
        'SUM(impact_usd) OVER (ORDER BY evt_ts ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) is the running total.',
      ),
      story: 'Finance replays alpha’s ledger as a cumulative P&L stream.',
      concept: 'SUM OVER running',
      task: 'user_id=1: evt_ts, impact_usd, cum (running sum of impact_usd ORDER BY evt_ts). ORDER BY evt_ts.',
      starterCode:
        'SELECT evt_ts, impact_usd,\nFROM activity\nWHERE user_id = 1\nORDER BY evt_ts;',
      expectedQuery: `SELECT evt_ts, impact_usd,
  SUM(impact_usd) OVER (
    ORDER BY evt_ts
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS cum
FROM activity
WHERE user_id = 1
ORDER BY evt_ts;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 6,
        expectedColumns: ['evt_ts', 'impact_usd', 'cum'],
      },
      parTimeSeconds: 320,
      xpReward: 150,
      relevantTables: ['activity'],
    },
    {
      title: 'Purchase spend ranks',
      isBoss: false,
      difficulty: 'Hard',
      constraints: [
        "only evt_type = 'purchase' lines in the sum",
        'RANK() by total descending',
        'tie-break by user_id ascending in ORDER BY',
      ],
      solveGuide: sg(
        'Aggregate to one row per user in a CTE, then apply RANK() OVER (ORDER BY total DESC) on that derived table.',
      ),
      story: 'Who leads gross purchase volume before refunds are netted elsewhere?',
      concept: 'RANK window',
      task: 'user_id, total (SUM impact_usd for purchases), rk = RANK() OVER (ORDER BY total DESC). ORDER BY rk, user_id.',
      starterCode:
        "WITH u AS (\n  SELECT user_id, SUM(impact_usd) AS total\n  FROM activity\n  WHERE evt_type = 'purchase'\n  GROUP BY user_id\n)\nSELECT user_id, total,\nFROM u\nORDER BY rk, user_id;",
      expectedQuery: `WITH u AS (
  SELECT user_id, SUM(impact_usd) AS total
  FROM activity
  WHERE evt_type = 'purchase'
  GROUP BY user_id
)
SELECT user_id, total,
  RANK() OVER (ORDER BY total DESC) AS rk
FROM u
ORDER BY rk, user_id;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 5,
        expectedColumns: ['user_id', 'total', 'rk'],
      },
      parTimeSeconds: 360,
      xpReward: 165,
      relevantTables: ['activity'],
    },
    {
      title: 'Step-up vs last event',
      isBoss: false,
      difficulty: 'Hard',
      constraints: [
        'impact_usd strictly greater than previous row for same user',
        'ignore rows with no previous row',
        'return activity id ascending',
      ],
      solveGuide: sg(
        'LAG(impact_usd) OVER (PARTITION BY user_id ORDER BY evt_ts) gives the prior amount; compare in an outer filter.',
      ),
      story: 'Growth flags sessions where spend jumped versus the immediately prior event for that user.',
      concept: 'LAG window',
      task: 'ids of activity rows where impact_usd > LAG(impact_usd) over partition user_id order by evt_ts; ORDER BY id.',
      starterCode:
        'SELECT id FROM (\n  SELECT id, impact_usd,\n    LAG(impact_usd) OVER (\n      PARTITION BY user_id\n      ORDER BY evt_ts\n    ) AS prev\n  FROM activity\n) x\nWHERE \nORDER BY id;',
      expectedQuery: `SELECT id FROM (
  SELECT id, impact_usd,
    LAG(impact_usd) OVER (
      PARTITION BY user_id
      ORDER BY evt_ts
    ) AS prev
  FROM activity
) x
WHERE prev IS NOT NULL AND impact_usd > prev
ORDER BY id;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 7,
        expectedColumns: ['id'],
      },
      parTimeSeconds: 400,
      xpReward: 175,
      relevantTables: ['activity'],
    },
    {
      title: 'Plan-weighted buckets',
      isBoss: false,
      difficulty: 'Medium',
      constraints: [
        'join lab_users for plan',
        "purchase totals only (evt_type = 'purchase')",
        'NTILE(2) high/low spend split ORDER BY total DESC',
      ],
      solveGuide: sg(
        'NTILE(n) splits the ordered partition into n buckets — here bucket 1 is the richer half of buyers.',
      ),
      story: 'RevOps splits buyers into two spend bands for outreach experiments.',
      concept: 'NTILE window',
      task: 'handle, total purchase sum, bucket = NTILE(2) OVER (ORDER BY total DESC). Join lab_users. ORDER BY bucket, handle.',
      starterCode:
        "WITH t AS (\n  SELECT user_id, SUM(impact_usd) AS total\n  FROM activity\n  WHERE evt_type = 'purchase'\n  GROUP BY user_id\n)\nSELECT u.handle, t.total,\nFROM t\nJOIN lab_users u ON u.id = t.user_id\nORDER BY bucket, handle;",
      expectedQuery: `WITH t AS (
  SELECT user_id, SUM(impact_usd) AS total
  FROM activity
  WHERE evt_type = 'purchase'
  GROUP BY user_id
)
SELECT u.handle, t.total,
  NTILE(2) OVER (ORDER BY t.total DESC) AS bucket
FROM t
JOIN lab_users u ON u.id = t.user_id
ORDER BY bucket, handle;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 5,
        expectedColumns: ['handle', 'total', 'bucket'],
      },
      parTimeSeconds: 340,
      xpReward: 140,
      relevantTables: ['activity', 'lab_users'],
    },
    {
      title: 'Boss: Podium purchasers',
      isBoss: true,
      difficulty: 'Hard',
      constraints: [
        'purchase rows only in the sum',
        'top 2 users by total spend',
        'tie-break lower user_id first in sort',
      ],
      solveGuide: sg(
        'Aggregate per user, ORDER BY total DESC, user_id ASC, LIMIT 2 — no window required, but you can also use RANK <= 2.',
      ),
      story: 'Exec slide: the two accounts with the highest lifetime purchase volume (gross).',
      concept: 'K-way LIMIT',
      task: 'user_id and tot (sum purchase impact_usd); two rows; highest totals first; tie-break user_id ASC.',
      starterCode:
        "WITH t AS (\n  SELECT user_id, SUM(impact_usd) AS tot\n  FROM activity\n  WHERE evt_type = 'purchase'\n  GROUP BY user_id\n)\nSELECT user_id, tot\nFROM t\nORDER BY \nLIMIT 2;",
      expectedQuery: `WITH t AS (
  SELECT user_id, SUM(impact_usd) AS tot
  FROM activity
  WHERE evt_type = 'purchase'
  GROUP BY user_id
)
SELECT user_id, tot
FROM t
ORDER BY tot DESC, user_id ASC
LIMIT 2;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 2,
        expectedColumns: ['user_id', 'tot'],
      },
      parTimeSeconds: 300,
      xpReward: 360,
      relevantTables: ['activity'],
    },
    {
      title: 'First ledger touch',
      isBoss: false,
      difficulty: 'Medium',
      constraints: [
        'FIRST_VALUE(impact_usd) per user_id by evt_ts',
        'one row per user',
        'ORDER BY user_id',
      ],
      solveGuide: sg(
        'FIRST_VALUE(...) OVER (PARTITION BY user_id ORDER BY evt_ts) repeats the first row’s value on every line — wrap in SELECT DISTINCT user_id, first_impact or collapse with GROUP BY to return one row per account.',
      ),
      story: 'Ops wants the very first impact_usd on each user’s timeline (signup is often 0).',
      concept: 'FIRST_VALUE window',
      task: 'Columns user_id, first_impact — DISTINCT from a subquery using FIRST_VALUE over partition user_id ordered by evt_ts.',
      starterCode:
        'SELECT DISTINCT user_id, first_impact\nFROM (\n  SELECT user_id,\n    FIRST_VALUE(impact_usd) OVER (\n      PARTITION BY user_id\n      ORDER BY evt_ts\n    ) AS first_impact\n  FROM activity\n) x\nORDER BY user_id;',
      expectedQuery: `SELECT DISTINCT user_id, first_impact
FROM (
  SELECT user_id,
    FIRST_VALUE(impact_usd) OVER (
      PARTITION BY user_id
      ORDER BY evt_ts
    ) AS first_impact
  FROM activity
) x
ORDER BY user_id;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 5,
        expectedColumns: ['user_id', 'first_impact'],
      },
      parTimeSeconds: 260,
      xpReward: 135,
      relevantTables: ['activity'],
    },
    {
      title: 'Next event peek',
      isBoss: false,
      difficulty: 'Hard',
      constraints: ['user_id = 1 only', 'LEAD(impact_usd) in time order', 'ORDER BY evt_ts'],
      solveGuide: sg(
        'LEAD reads the following row in the window. Default frame is the rest of the partition after ORDER BY — perfect for “what happens next on this timeline?”.',
      ),
      story: 'For alpha’s stream only, show each row plus the next row’s impact (NULL on the last event).',
      concept: 'LEAD window',
      task: 'id, evt_ts, impact_usd, next_impact = LEAD(impact_usd) OVER (ORDER BY evt_ts). Filter user_id = 1.',
      starterCode:
        'SELECT id, evt_ts, impact_usd,\n  \nFROM activity\nWHERE user_id = 1\nORDER BY evt_ts;',
      expectedQuery: `SELECT id, evt_ts, impact_usd,
  LEAD(impact_usd) OVER (ORDER BY evt_ts) AS next_impact
FROM activity
WHERE user_id = 1
ORDER BY evt_ts;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 6,
        expectedColumns: ['id', 'evt_ts', 'impact_usd', 'next_impact'],
      },
      parTimeSeconds: 300,
      xpReward: 155,
      relevantTables: ['activity'],
    },
    {
      title: 'Three-step smoothing',
      isBoss: false,
      difficulty: 'Hard',
      constraints: [
        'centered 3-row frame',
        'ROUND averages to 2 decimals',
        'user_id = 1',
      ],
      solveGuide: sg(
        'ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING averages the current row with its immediate neighbors in sort order — a simple moving average. Edges use fewer rows automatically.',
      ),
      story: 'Finance plots a short moving average on alpha’s impact stream to dampen one-off spikes.',
      concept: 'frame AVG OVER',
      task: 'id, evt_ts, impact_usd, ma3 = ROUND(AVG(impact_usd) OVER (...), 2) with ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING, ORDER BY evt_ts; user_id = 1.',
      starterCode:
        'SELECT id, evt_ts, impact_usd,\n  ROUND(AVG(impact_usd) OVER (\n    ORDER BY evt_ts\n    ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING\n  ), 2) AS ma3\nFROM activity\nWHERE \nORDER BY evt_ts;',
      expectedQuery: `SELECT id, evt_ts, impact_usd,
  ROUND(AVG(impact_usd) OVER (
    ORDER BY evt_ts
    ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
  ), 2) AS ma3
FROM activity
WHERE user_id = 1
ORDER BY evt_ts;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 6,
        expectedColumns: ['id', 'evt_ts', 'impact_usd', 'ma3'],
      },
      parTimeSeconds: 340,
      xpReward: 170,
      relevantTables: ['activity'],
    },
  ],
);
