import { buildWorld } from '../worldFactory';

const sg = (s: string) =>
  `${s}\n\nIf stuck: write the intermediate SELECT (joins only) first, add WHERE, then wrap in aggregates. Use NOT EXISTS when the spec says “never” or “no rows”.`;

export const world14 = buildWorld(
  {
    id: 14,
    name: 'SQL Grind Set',
    subtitle: 'LeetCode-style SQL',
    theme: 'grind',
    description:
      'Harder patterns on the Summit schema: anti-joins, correlated logic, CTEs, and ranking intuition — same database, sharper questions.',
    database: 'sql_summit.sql',
    icon: '🎯',
    color: '#c026d3',
    prerequisites: [13],
  },
  [
    {
      title: 'Deadbeat accounts',
      isBoss: false,
      difficulty: 'Medium',
      constraints: ['customers who have never placed a paid order', 'order by customer id'],
      solveGuide: sg(
        'Anti-pattern: start from customers and remove those with a matching paid order. Prefer NOT EXISTS (SELECT 1 FROM orders … WHERE customer_id matches AND status = paid) over juggling OUTER JOIN NULL checks until you are fluent.',
      ),
      story: 'Sales wants a cleanup list: customers with zero paid orders in the system.',
      concept: 'NOT EXISTS',
      task: 'id, name for customers with no paid order; ORDER BY id.',
      starterCode:
        "SELECT c.id, c.name\nFROM customers c\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id AND o.status = 'paid'\n)\nORDER BY c.id;",
      expectedQuery: `SELECT c.id, c.name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id AND o.status = 'paid'
)
ORDER BY c.id;`,
      validation: { strategy: ['result_match'], orderSensitive: true, expectedRowCount: 3 },
      parTimeSeconds: 240,
      xpReward: 120,
      relevantTables: ['customers', 'orders'],
    },
    {
      title: 'Open pipeline dollars',
      isBoss: false,
      difficulty: 'Medium',
      constraints: ['only open orders', 'discounted line revenue', 'one row alias open_rev'],
      solveGuide: sg(
        'Mirror the paid revenue math from Summit, but filter orders.status = open before aggregating. Single SUM across joined lines.',
      ),
      story: 'Finance asks for the total discounted line value still sitting in open orders.',
      concept: 'JOIN + SUM filter',
      task: 'One column open_rev = SUM(qty * list_price * (1 - discount_pct/100)) for open orders only.',
      starterCode:
        "SELECT ROUND(SUM(ol.qty * p.list_price * (1 - ol.discount_pct / 100.0)), 2) AS open_rev\nFROM order_lines ol\nJOIN products p ON ol.product_id = p.id\nJOIN orders o ON ol.order_id = o.id\nWHERE o.status = 'open';",
      expectedQuery: `SELECT ROUND(SUM(ol.qty * p.list_price * (1 - ol.discount_pct / 100.0)), 2) AS open_rev
FROM order_lines ol
JOIN products p ON ol.product_id = p.id
JOIN orders o ON ol.order_id = o.id
WHERE o.status = 'open';`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedRowCount: 1,
        expectedColumns: ['open_rev'],
      },
      parTimeSeconds: 200,
      xpReward: 110,
      relevantTables: ['order_lines', 'products', 'orders'],
    },
    {
      title: 'Thrifty checkout',
      isBoss: false,
      difficulty: 'Hard',
      constraints: ['paid orders only', 'lowest total discounted line revenue', 'tie-break lowest order id'],
      solveGuide: sg(
        'Compute per-order revenue in a CTE, filter paid orders, then ORDER BY revenue ASC, id ASC LIMIT 1. If you get the wrong row, check you joined lines→products before summing.',
      ),
      story: 'Which paid order generated the smallest net line revenue?',
      concept: 'CTE + MIN ordering',
      task: 'Return id (order id) and r (revenue) for the cheapest paid order by line math.',
      starterCode:
        "WITH rev AS (\n  SELECT ol.order_id,\n    SUM(ol.qty * p.list_price * (1 - ol.discount_pct / 100.0)) AS r\n  FROM order_lines ol\n  JOIN products p ON ol.product_id = p.id\n  GROUP BY ol.order_id\n)\nSELECT o.id, rev.r\nFROM orders o\nJOIN rev ON o.id = rev.order_id\nWHERE o.status = 'paid'\nORDER BY rev.r ASC, o.id ASC\nLIMIT 1;",
      expectedQuery: `WITH rev AS (
  SELECT ol.order_id,
    SUM(ol.qty * p.list_price * (1 - ol.discount_pct / 100.0)) AS r
  FROM order_lines ol
  JOIN products p ON ol.product_id = p.id
  GROUP BY ol.order_id
)
SELECT o.id, rev.r
FROM orders o
JOIN rev ON o.id = rev.order_id
WHERE o.status = 'paid'
ORDER BY rev.r ASC, o.id ASC
LIMIT 1;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 1,
        expectedColumns: ['id', 'r'],
      },
      parTimeSeconds: 320,
      xpReward: 145,
      relevantTables: ['orders', 'order_lines', 'products'],
    },
    {
      title: 'Discount burn leader',
      isBoss: false,
      difficulty: 'Hard',
      constraints: ['paid orders', 'maximize sum of qty*list_price*discount_pct/100'],
      solveGuide: sg(
        'Discount dollars per line = qty * list_price * discount_pct/100. Sum per order, keep paid only, ORDER BY that sum DESC.',
      ),
      story: 'Which paid order gave away the most dollars purely from discounts?',
      concept: 'GROUP BY order',
      task: 'Columns order_id, disc_amt — the top discount burn order.',
      starterCode:
        "SELECT ol.order_id AS order_id,\n  SUM(ol.qty * p.list_price * (ol.discount_pct / 100.0)) AS disc_amt\nFROM order_lines ol\nJOIN products p ON ol.product_id = p.id\nJOIN orders o ON ol.order_id = o.id\nWHERE o.status = 'paid'\nGROUP BY ol.order_id\nORDER BY disc_amt DESC, order_id ASC\nLIMIT 1;",
      expectedQuery: `SELECT ol.order_id AS order_id,
  SUM(ol.qty * p.list_price * (ol.discount_pct / 100.0)) AS disc_amt
FROM order_lines ol
JOIN products p ON ol.product_id = p.id
JOIN orders o ON ol.order_id = o.id
WHERE o.status = 'paid'
GROUP BY ol.order_id
ORDER BY disc_amt DESC, order_id ASC
LIMIT 1;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 1,
        expectedColumns: ['order_id', 'disc_amt'],
      },
      parTimeSeconds: 300,
      xpReward: 140,
      relevantTables: ['order_lines', 'products', 'orders'],
    },
    {
      title: 'Cross-aisle buyers',
      isBoss: false,
      difficulty: 'Hard',
      constraints: [
        'customers with paid orders touching both hw and svc products',
        'distinct customers',
      ],
      solveGuide: sg(
        'Classic interview pattern: EXISTS hw paid lines AND EXISTS svc paid lines for the same customer_id. Keep both subqueries correlated on customers.id.',
      ),
      story: 'Find customers who bought hardware and services (different paid orders allowed).',
      concept: 'double EXISTS',
      task: 'SELECT DISTINCT c.id, c.name ORDER BY c.id.',
      starterCode:
        "SELECT DISTINCT c.id, c.name\nFROM customers c\nJOIN orders o ON o.customer_id = c.id AND o.status = 'paid'\nJOIN order_lines ol ON ol.order_id = o.id\nJOIN products p ON p.id = ol.product_id\nWHERE p.category = 'hw'\n  AND EXISTS (\n    SELECT 1 FROM orders o2\n    JOIN order_lines ol2 ON ol2.order_id = o2.id\n    JOIN products p2 ON p2.id = ol2.product_id\n    WHERE o2.customer_id = c.id AND o2.status = 'paid' AND p2.category = 'svc'\n  )\nORDER BY c.id;",
      expectedQuery: `SELECT DISTINCT c.id, c.name
FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
JOIN order_lines ol ON ol.order_id = o.id
JOIN products p ON p.id = ol.product_id
WHERE p.category = 'hw'
  AND EXISTS (
    SELECT 1 FROM orders o2
    JOIN order_lines ol2 ON ol2.order_id = o2.id
    JOIN products p2 ON p2.id = ol2.product_id
    WHERE o2.customer_id = c.id AND o2.status = 'paid' AND p2.category = 'svc'
  )
ORDER BY c.id;`,
      validation: { strategy: ['result_match'], orderSensitive: true, expectedRowCount: 3 },
      parTimeSeconds: 420,
      xpReward: 180,
      relevantTables: ['customers', 'orders', 'order_lines', 'products'],
    },
    {
      title: 'Beat the average',
      isBoss: false,
      difficulty: 'Hard',
      constraints: [
        'total paid discounted revenue per customer',
        'keep customers strictly above overall average',
      ],
      solveGuide: sg(
        'CTE #1: per-customer revenue. CTE #2: AVG(rev) across those rows. Join or CROSS JOIN to filter rev > average. Watch: only customers with at least one paid line should appear in CTE #1.',
      ),
      story: 'Who spends more than the mean paid customer?',
      concept: 'CTE AVG compare',
      task: 'customer ids (column id) above average paid rev, ascending.',
      starterCode:
        "WITH cr AS (\n  SELECT c.id,\n    SUM(ol.qty * p.list_price * (1 - ol.discount_pct / 100.0)) AS rev\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'\n  JOIN order_lines ol ON ol.order_id = o.id\n  JOIN products p ON ol.product_id = p.id\n  GROUP BY c.id\n),\navg_r AS (SELECT AVG(rev) AS a FROM cr)\nSELECT cr.id\nFROM cr CROSS JOIN avg_r\nWHERE cr.rev > avg_r.a\nORDER BY cr.id;",
      expectedQuery: `WITH cr AS (
  SELECT c.id,
    SUM(ol.qty * p.list_price * (1 - ol.discount_pct / 100.0)) AS rev
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
  JOIN order_lines ol ON ol.order_id = o.id
  JOIN products p ON ol.product_id = p.id
  GROUP BY c.id
),
avg_r AS (SELECT AVG(rev) AS a FROM cr)
SELECT cr.id
FROM cr CROSS JOIN avg_r
WHERE cr.rev > avg_r.a
ORDER BY cr.id;`,
      validation: { strategy: ['result_match'], orderSensitive: true, expectedRowCount: 2 },
      parTimeSeconds: 400,
      xpReward: 170,
      relevantTables: ['customers', 'orders', 'order_lines', 'products'],
    },
    {
      title: 'Enterprise density',
      isBoss: false,
      difficulty: 'Medium',
      constraints: ['count enterprise-tier customers', 'group by region name', 'order by region name'],
      solveGuide: sg(
        'Join customers→regions for readable names. WHERE tier = enterprise, then GROUP BY region label.',
      ),
      story: 'How many enterprise accounts sit in each named region?',
      concept: 'JOIN + GROUP BY',
      task: 'Columns name (region), n (count).',
      starterCode:
        "SELECT r.name, COUNT(*) AS n\nFROM customers c\nJOIN regions r ON r.id = c.region_id\nWHERE c.tier = 'enterprise'\nGROUP BY r.id\nORDER BY r.name;",
      expectedQuery: `SELECT r.name, COUNT(*) AS n
FROM customers c
JOIN regions r ON r.id = c.region_id
WHERE c.tier = 'enterprise'
GROUP BY r.id
ORDER BY r.name;`,
      validation: { strategy: ['result_match'], orderSensitive: true, expectedRowCount: 2 },
      parTimeSeconds: 200,
      xpReward: 100,
      relevantTables: ['customers', 'regions'],
    },
    {
      title: 'Boss: silver medal SKU',
      isBoss: true,
      difficulty: 'Hard',
      constraints: [
        'rank products by total qty sold',
        'return the runner-up (2nd place)',
        'ties: higher qty wins; tie-break lower product_id',
      ],
      solveGuide: sg(
        'Aggregate SUM(qty) GROUP BY product_id ORDER BY sum DESC, product_id ASC. SQLite: wrap in a subquery and LIMIT 1 OFFSET 1, or use window ROW_NUMBER if you prefer — both are fair game here.',
      ),
      story: 'Inventory wants the second-most-moved SKU by units, not revenue.',
      concept: 'LIMIT OFFSET ranking',
      task: 'Single column product_id for rank #2 by total qty.',
      starterCode:
        'SELECT product_id FROM (\n  SELECT product_id, SUM(qty) AS q\n  FROM order_lines\n  GROUP BY product_id\n  ORDER BY q DESC, product_id ASC\n  LIMIT 1 OFFSET 1\n);',
      expectedQuery: `SELECT product_id FROM (
  SELECT product_id, SUM(qty) AS q
  FROM order_lines
  GROUP BY product_id
  ORDER BY q DESC, product_id ASC
  LIMIT 1 OFFSET 1
);`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 1,
        expectedColumns: ['product_id'],
      },
      parTimeSeconds: 360,
      xpReward: 320,
      relevantTables: ['order_lines'],
    },
  ],
);
