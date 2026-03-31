import type { WikiArticle, WikiSection } from './types';

const s = (id: string, heading: string, body: string, code?: string): WikiSection => ({
  id,
  heading,
  body,
  code,
});

export const WIKI_SQL: WikiArticle[] = [
  {
    id: 'sql-select-from-deep',
    category: 'SQL',
    tags: ['select', 'from', 'basics'],
    title: 'SELECT & FROM in depth',
    summary: 'Projection, row sources, and mental model of the first two clauses.',
    seeAlso: ['sql-where-deep', 'sql-alias-qualify'],
    sections: [
      s(
        'projection',
        'What SELECT really does',
        `SELECT defines the shape of each output row: column names, expressions, and literals. FROM defines which logical row source you start from — usually one table, sometimes a join or subquery.`,
      ),
      s(
        'star',
        'SELECT *',
        `Expands to all columns in order of table definition. Fine for exploration; risky in production because ALTER TABLE can break downstream consumers expecting a fixed column order.`,
      ),
      s(
        'expressions',
        'Expressions & aliases',
        `You can compute columns: list_price * qty AS line_total. Aliases are visible in ORDER BY (in most dialects) but not in WHERE — use outer query or repeat expression.`,
        `SELECT first_name || ' ' || last_name AS full_name, age * 12 AS age_months
FROM residents;`,
      ),
    ],
  },
  {
    id: 'sql-where-deep',
    category: 'SQL',
    tags: ['where', 'filter', 'predicate'],
    title: 'WHERE: filters and predicates',
    summary: 'Building safe boolean conditions and debugging empty results.',
    seeAlso: ['sql-null-three-valued', 'visual-sql-where'],
    sections: [
      s(
        'semantics',
        'Predicate semantics',
        `WHERE <boolean expression>. Only rows where the expression evaluates to TRUE are kept. FALSE drops the row. UNKNOWN (from NULL comparisons) is treated like FALSE for filtering.`,
      ),
      s(
        'patterns',
        'Common patterns',
        `Range: BETWEEN a AND b is inclusive. Set membership: IN ('a','b'). Pattern: LIKE with % and _. Escape wildcards with ESCAPE if supported. Negation: NOT, NOT IN (watch NULLs).`,
        `WHERE order_date >= '2025-01-01' AND order_date < '2025-02-01'
  AND status IN ('paid', 'open')
  AND note NOT LIKE 'TEST%';`,
      ),
    ],
  },
  {
    id: 'sql-null-three-valued',
    category: 'SQL',
    tags: ['null', 'three-valued', 'logic'],
    title: 'NULL & three-valued logic',
    summary: 'Why WHERE x = NULL returns nothing and how to test missing data.',
    seeAlso: ['sql-where-deep'],
    sections: [
      s(
        'unknown',
        'UNKNOWN',
        `NULL means "unknown value". Any comparison with NULL using =, <>, <, > usually yields UNKNOWN, not TRUE/FALSE. WHERE only keeps TRUE.`,
      ),
      s(
        'is-null',
        'IS NULL / IS NOT NULL',
        `Always use IS NULL to find missing values. For "equals NULL or value", some dialects offer IS DISTINCT FROM.`,
        `WHERE middle_name IS NULL;
WHERE phone IS NOT NULL;`,
      ),
      s(
        'aggregates',
        'Aggregates ignore NULLs',
        `COUNT(*) counts rows; COUNT(col) counts non-NULL col. SUM/AVG skip NULL inputs. Be explicit if you need zeros instead.`,
      ),
    ],
  },
  {
    id: 'sql-joins-deep',
    category: 'SQL',
    tags: ['join', 'inner', 'keys'],
    title: 'INNER JOIN deep dive',
    summary: 'Key matching, qualifiers, and join order intuition.',
    seeAlso: ['sql-left-join-deep', 'visual-sql-join', 'sql-join-algorithms'],
    sections: [
      s(
        'on',
        'ON vs WHERE (inner join)',
        `For INNER JOIN, filtering in ON or WHERE often yields the same rows — but ON is clearer for join keys, WHERE for post-join filters. For OUTER joins, moving predicates can change results.`,
      ),
      s(
        'qualify',
        'Qualify every ambiguous column',
        `If two tables share column names, write orders.id not bare id. This prevents bugs when schemas evolve.`,
        `SELECT o.id AS order_id, c.name
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'paid';`,
      ),
    ],
  },
  {
    id: 'sql-left-join-deep',
    category: 'SQL',
    tags: ['join', 'left', 'outer', 'null'],
    title: 'LEFT OUTER JOIN',
    summary: 'Keep the left side even when the right has no match.',
    seeAlso: ['sql-joins-deep', 'sql-anti-join-pattern'],
    sections: [
      s(
        'behavior',
        'Behavior',
        `Every row from the left table appears once (per join logic). If no right row matches ON, right-side columns are NULL in the result.`,
      ),
      s(
        'use-cases',
        'Typical uses',
        `Customers without orders: LEFT JOIN orders … WHERE orders.id IS NULL. Optional enrichment: attach profile rows that may not exist.`,
      ),
      s(
        'pitfall',
        'Predicate placement',
        `Putting filter on right table in WHERE turns the join into an inner join in effect. For "paid orders only but keep customers with none", you often need conditional aggregation or subqueries.`,
      ),
    ],
  },
  {
    id: 'sql-anti-join-pattern',
    category: 'SQL',
    tags: ['not-exists', 'anti-join', 'subquery'],
    title: 'Anti-join patterns (NOT EXISTS)',
    summary: 'Expressing "no matching row" clearly and efficiently.',
    seeAlso: ['sql-subqueries-correlated', 'sql-left-join-deep'],
    sections: [
      s(
        'not-exists',
        'NOT EXISTS',
        `Correlated subquery: EXISTS returns TRUE if the subquery returns any row. NOT EXISTS keeps outer rows with zero matches. Preferred over NOT IN when NULLs appear in the subquery column.`,
        `SELECT c.id
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id AND o.status = 'paid'
);`,
      ),
    ],
  },
  {
    id: 'sql-subqueries-correlated',
    category: 'SQL',
    tags: ['subquery', 'correlated', 'scalar'],
    title: 'Subqueries: scalar, table, correlated',
    summary: 'Nesting SELECTs — when each form is appropriate.',
    seeAlso: ['sql-cte-deep', 'sql-anti-join-pattern'],
    sections: [
      s(
        'kinds',
        'Three shapes',
        `Scalar subquery returns one row one column (or error). Table subquery used in FROM. Correlated subquery references outer columns — re-evaluated per outer row (optimizer may rewrite).`,
      ),
      s(
        'example',
        'Scalar example',
        `Products priced above category average: compare list_price to (SELECT AVG(...) FROM products p2 WHERE p2.category = p1.category).`,
      ),
    ],
  },
  {
    id: 'sql-cte-deep',
    category: 'SQL',
    tags: ['cte', 'with', 'readability'],
    title: 'CTEs (WITH clauses)',
    summary: 'Named subqueries for readable multi-step SQL.',
    seeAlso: ['sql-subqueries-correlated', 'sql-window-intro'],
    sections: [
      s(
        'why',
        'Why use CTEs',
        `Break a problem into named steps: revenue per order, then filter orders, then rank customers. Easier to document than nested FROM (SELECT …) chains.`,
      ),
      s(
        'recursive',
        'Recursive CTEs (concept)',
        `WITH RECURSIVE walks trees/graphs: anchor member UNION ALL recursive member until fixpoint. Supported in PostgreSQL, SQL Server, SQLite 3.8+. Use for org charts, bill of materials.`,
      ),
    ],
  },
  {
    id: 'sql-group-having-deep',
    category: 'SQL',
    tags: ['group-by', 'having', 'aggregate'],
    title: 'GROUP BY & HAVING in depth',
    summary: 'Aggregating safely and filtering groups.',
    seeAlso: ['sql-window-intro', 'sql-null-three-valued'],
    sections: [
      s(
        'rule',
        'Functional dependency rule',
        `In standard SQL, every non-aggregated column in SELECT must appear in GROUP BY (or be functionally determined by grouped columns). Some engines are permissive — don’t rely on that.`,
      ),
      s(
        'having',
        'HAVING vs WHERE',
        `WHERE filters input rows before aggregation. HAVING filters groups after aggregation. Example: HAVING COUNT(*) > 1 for duplicate detection.`,
        `SELECT customer_id, COUNT(*) AS n
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING COUNT(*) >= 2;`,
      ),
    ],
  },
  {
    id: 'sql-window-intro',
    category: 'SQL',
    tags: ['window', 'rank', 'analytics'],
    title: 'Window functions introduction',
    summary: 'ROW_NUMBER, PARTITION BY, and running totals without collapsing rows.',
    seeAlso: ['sql-group-having-deep'],
    sections: [
      s(
        'concept',
        'Concept',
        `A window function computes over a partition of rows related to the current row but does not collapse them into one row per group (unlike GROUP BY).`,
      ),
      s(
        'syntax',
        'Common pattern',
        `func() OVER (PARTITION BY col ORDER BY col2). ROW_NUMBER assigns unique ranks; RANK leaves gaps for ties; SUM() OVER can produce running totals.`,
        `SELECT order_id, amount,
  SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running
FROM orders;`,
      ),
    ],
  },
  {
    id: 'sql-order-limit-deep',
    category: 'SQL',
    tags: ['order-by', 'limit', 'pagination'],
    title: 'ORDER BY, LIMIT, OFFSET',
    summary: 'Deterministic sorting and stable pagination.',
    seeAlso: ['sql-window-intro'],
    sections: [
      s(
        'stable',
        'Stable ordering',
        `Always add a unique tie-breaker (e.g. id) when order matters for LIMIT … OFFSET pagination; otherwise rows can shuffle between pages.`,
      ),
      s(
        'offset-cost',
        'OFFSET cost',
        `Large OFFSET scans and discards rows — expensive at scale. Prefer keyset pagination WHERE id > :cursor ORDER BY id LIMIT n.`,
      ),
    ],
  },
  {
    id: 'sql-union-deep',
    category: 'SQL',
    tags: ['union', 'set-ops'],
    title: 'UNION, INTERSECT, EXCEPT',
    summary: 'Combining result sets vertically.',
    seeAlso: ['sql-select-from-deep'],
    sections: [
      s(
        'rules',
        'Rules',
        `Same number of columns; compatible types. UNION removes duplicates; UNION ALL keeps all rows (usually faster). INTERSECT / EXCEPT are less portable.`,
      ),
    ],
  },
  {
    id: 'sql-case-deep',
    category: 'SQL',
    tags: ['case', 'conditional'],
    title: 'CASE expressions',
    summary: 'Conditional values in SELECT, ORDER BY, GROUP BY, HAVING.',
    seeAlso: ['sql-null-three-valued'],
    sections: [
      s(
        'forms',
        'Searched vs simple CASE',
        `Searched CASE WHEN cond THEN … END evaluates booleans. Simple CASE expr WHEN val THEN … compares equality.`,
        `SELECT order_id,
  CASE status
    WHEN 'paid' THEN 1
    WHEN 'open' THEN 0
    ELSE -1
  END AS status_rank
FROM orders;`,
      ),
    ],
  },
  {
    id: 'sql-constraints-fk',
    category: 'SQL',
    tags: ['constraints', 'foreign-key', 'integrity'],
    title: 'Constraints & foreign keys',
    summary: 'PRIMARY KEY, UNIQUE, NOT NULL, CHECK, REFERENCES.',
    seeAlso: ['concepts-normalization-deep'],
    sections: [
      s(
        'fk',
        'Foreign keys',
        `REFERENCES enforces that child values exist in parent (or NULL). ON DELETE / ON UPDATE actions define cascade behavior. SQLite requires PRAGMA foreign_keys=ON for enforcement.`,
      ),
    ],
  },
  {
    id: 'sql-indexes-deep',
    category: 'SQL',
    tags: ['index', 'performance', 'b-tree'],
    title: 'Indexes & selective queries',
    summary: 'How indexes help and when they hurt.',
    seeAlso: ['sql-explain-deep'],
    sections: [
      s(
        'btree',
        'B-tree (common default)',
        `Speeds equality and range lookups on indexed columns. Composite index (a,b) helps WHERE a=? and WHERE a=? AND b=?; less helpful for leading wildcard LIKE '%x'.`,
      ),
      s(
        'covering',
        'Covering index',
        `If all selected columns exist in the index, the engine may avoid table lookups (index-only scan).`,
      ),
    ],
  },
  {
    id: 'sql-explain-deep',
    category: 'SQL',
    tags: ['explain', 'plan', 'optimization'],
    title: 'Reading EXPLAIN / query plans',
    summary: 'High-level plan anatomy without vendor lock-in.',
    seeAlso: ['sql-indexes-deep'],
    sections: [
      s(
        'goal',
        'Goal',
        `Identify full table scans, large row estimates, and join order. Compare plans before/after index or query rewrite.`,
      ),
      s(
        'sqlite',
        'SQLite / QueryForge',
        `EXPLAIN QUERY PLAN prefixes show simplified plans. Use it on SELECT statements you run in the app.`,
      ),
    ],
  },
  {
    id: 'sql-dml-deep',
    category: 'SQL',
    tags: ['insert', 'update', 'delete', 'upsert'],
    title: 'INSERT, UPDATE, DELETE, UPSERT patterns',
    summary: 'Changing data safely.',
    seeAlso: ['sql-constraints-fk'],
    sections: [
      s(
        'insert',
        'INSERT',
        `INSERT INTO t (cols) VALUES (…) or INSERT SELECT. Batch inserts reduce round trips.`,
      ),
      s(
        'upsert',
        'Upsert',
        `Dialect-specific: ON CONFLICT DO UPDATE (PostgreSQL/SQLite), MERGE (SQL Server). Understand unique constraints that trigger conflict.`,
      ),
    ],
  },
  {
    id: 'sql-views-deep',
    category: 'SQL',
    tags: ['view', 'security', 'abstraction'],
    title: 'Views & materialized views (concept)',
    summary: 'Virtual tables for abstraction and permission boundaries.',
    seeAlso: ['sql-cte-deep'],
    sections: [
      s(
        'view',
        'Ordinary view',
        `Stored query definition. Simplifies reporting queries; can enforce column-level access in some systems.`,
      ),
      s(
        'matview',
        'Materialized',
        `Precomputed results — fast reads, stale until refreshed. Common in warehouses.`,
      ),
    ],
  },
  {
    id: 'sql-alias-qualify',
    category: 'SQL',
    tags: ['alias', 'style'],
    title: 'Table aliases & qualifying columns',
    summary: 'Readable SQL and avoiding ambiguous names.',
    seeAlso: ['sql-joins-deep'],
    sections: [
      s(
        'style',
        'Convention',
        `Short aliases: o for orders, c for customers. Always qualify: o.id. Improves diffs and prevents bugs when joining self-joins.`,
      ),
    ],
  },
  {
    id: 'sql-join-algorithms',
    category: 'SQL',
    tags: ['join', 'nested-loop', 'hash'],
    title: 'How databases execute joins (intuition)',
    summary: 'Nested loop, hash join, merge join — without vendor specifics.',
    seeAlso: ['sql-joins-deep', 'sql-indexes-deep'],
    sections: [
      s(
        'nested',
        'Nested loop',
        `For each left row, scan right for matches. Fine for small data or indexed lookups on inner side.`,
      ),
      s(
        'hash',
        'Hash join',
        `Build hash table on one side, probe with the other — good for large equi-joins without helpful indexes.`,
      ),
      s(
        'merge',
        'Merge join',
        `Both sides sorted on join keys — efficient when inputs already ordered (e.g. index range scans).`,
      ),
    ],
  },
];
