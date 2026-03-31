import type { WikiArticle, WikiSection } from './types';

const s = (id: string, heading: string, body: string, code?: string): WikiSection => ({
  id,
  heading,
  body,
  code,
});

/** SQL encyclopedia articles (part 1 of 2). */
export const WIKI_SQL_A: WikiArticle[] = [
  {
    id: 'sql-select-from-deep',
    category: 'SQL',
    tags: ['select', 'from', 'basics'],
    title: 'SELECT & FROM in depth',
    summary:
      'SELECT and FROM define the relational pipeline’s starting shape: which logical row source you read and which expressions become output columns. This article covers projection, table sources, subqueries in FROM, DISTINCT, set quantifiers, and dialect quirks (aliases in WHERE).',
    seeAlso: ['sql-where-deep', 'sql-alias-qualify', 'sql-union-deep'],
    sections: [
      s(
        'pipeline',
        'Clause order and mental model',
        `SQL is declarative: you describe the result, not the algorithm. Conceptually (simplified), FROM builds a multiset of rows, WHERE filters, GROUP BY buckets, HAVING filters buckets, window functions compute over partitions, SELECT projects expressions, DISTINCT deduplicates, ORDER BY sorts, LIMIT trims.

SELECT lists expressions evaluated per surviving row after grouping rules. Non-aggregated columns must be functionally determined by GROUP BY keys in standard SQL—engines like MySQL historically relaxed this with ONLY_FULL_GROUP_BY off; don’t rely on silent picks.`,
      ),
      s(
        'projection',
        'Projection: columns, expressions, literals',
        `Each SELECT item can be a column reference, a literal, or an expression (arithmetic, string concat, functions). Aliases with AS name the output column for clients and ORDER BY (in most dialects).

Qualify columns with table aliases whenever more than one source is in scope. Star expansion SELECT * expands to all columns of that source in catalog order—brittle for views and APIs.`,
      ),
      s(
        'from',
        'FROM sources',
        `FROM can name a base table, a view (stored query), a derived table (subquery), a CTE reference, or a join tree. A derived table must have an alias in standard SQL: FROM (SELECT …) AS t(x, y).

Multiple comma-separated FROM items imply CROSS JOIN (Cartesian product)—almost always accidental except for deliberate small dimension expansions.`,
      ),
      s(
        'distinct',
        'DISTINCT and ALL',
        `SELECT DISTINCT removes duplicate rows after projection—expensive when many columns or no supporting index. DISTINCT ON (PostgreSQL) picks one row per group nondeterministically unless ORDER BY disambiguates.

ALL is default for UNION; use UNION ALL when you know sets are disjoint or duplicates acceptable.`,
      ),
      s(
        'star',
        'SELECT * in production',
        `SELECT * breaks when schema evolves: new columns change ORM mappings, CSV exports, and replication. Prefer explicit lists in application queries; use * in ad-hoc exploration only.

For joined tables, table.* is slightly safer than bare * because it scopes expansion.`,
      ),
      s(
        'expressions',
        'Expressions & alias visibility',
        `Computed columns: unit_price * qty AS ext_price. String concatenation: || (ISO), + (SQL Server), CONCAT() for NULL-safe concat in some dialects.

Column aliases from SELECT are not visible in WHERE in standard SQL (WHERE runs before SELECT in the logical model). Repeat the expression, use a subquery/CTE wrapper, or use HAVING if grouping.

ORDER BY and GROUP BY can reference output aliases in PostgreSQL ORDER BY; GROUP BY may need the expression repeated or use ordinal positions (discouraged for maintainability).`,
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
    summary:
      'WHERE applies a boolean predicate per row from FROM. This article covers three-valued logic interaction, IN/BETWEEN/LIKE, correlated predicates, SARGable patterns for indexes, and debugging empty results.',
    seeAlso: ['sql-null-three-valued', 'visual-sql-where', 'sql-indexes-deep'],
    sections: [
      s(
        'semantics',
        'Predicate semantics',
        `WHERE keeps rows where the condition evaluates to TRUE. FALSE and UNKNOWN (from NULL comparisons) drop the row. AND/OR combine with short-circuit semantics in most engines for performance, not for relying on side effects.

Use parentheses liberally: WHERE a OR b AND c is parsed as WHERE a OR (b AND c) in SQL precedence rules—surprise source of bugs.`,
      ),
      s(
        'patterns',
        'Ranges, sets, patterns',
        `BETWEEN low AND high is inclusive on both ends—watch time boundaries: use half-open ranges on timestamps [start, end) to avoid double counting.

IN (list) expands to OR of equalities. NOT IN (subquery) returns UNKNOWN if the subquery yields NULLs—can empty the result unexpectedly; prefer NOT EXISTS.

LIKE '_a%' uses % multi-char wildcard and _ single char; ESCAPE defines custom escape char. ILIKE (Postgres) is case-insensitive. Leading wildcard LIKE '%foo' usually cannot use B-tree indexes.`,
        `WHERE order_date >= DATE '2025-01-01' AND order_date < DATE '2025-02-01'
  AND status IN ('paid', 'open')
  AND note NOT LIKE 'TEST%';`,
      ),
      s(
        'sargable',
        'SARGable predicates (index-friendly)',
        `SARGable = Search ARGument able—predicate shaped so an index can prune. Good: WHERE col = ? AND WHERE col BETWEEN ? AND ?. Bad: WHERE YEAR(col) = 2025 (function on column blocks index). Rewrite as range on col.

OR across different columns often defeats single-index use unless the planner uses index bitmap union (engine-specific). Sometimes rewrite as UNION ALL of two selective queries.`,
      ),
      s(
        'debug',
        'Debugging zero rows',
        `Strip predicates one at a time. Check NULLs with IS NULL. Verify types (string '1' vs int 1). Compare COUNT(*) vs COUNT(DISTINCT key) to spot join fan-out. Use EXPLAIN to see early selective filters dropped.`,
      ),
    ],
  },
  {
    id: 'sql-null-three-valued',
    category: 'SQL',
    tags: ['null', 'three-valued', 'logic'],
    title: 'NULL & three-valued logic',
    summary:
      'NULL represents unknown or inapplicable data. SQL uses three-valued logic (TRUE, FALSE, UNKNOWN). This article covers comparisons, IS NULL, aggregate behavior, OUTER JOIN NULLs, COALESCE/NULLIF, and IS DISTINCT FROM.',
    seeAlso: ['sql-where-deep', 'sql-case-deep', 'sql-left-join-deep'],
    sections: [
      s(
        'unknown',
        'UNKNOWN in WHERE and CHECK',
        `Predicates comparing NULL with =, <>, <, > yield UNKNOWN except IS NULL/IS NOT NULL. WHERE treats UNKNOWN like FALSE. CHECK constraints treat UNKNOWN like pass (row allowed)—a subtle difference: a failing CHECK must be explicitly FALSE.

AND/OR truth tables: TRUE AND UNKNOWN → UNKNOWN; FALSE AND UNKNOWN → FALSE; TRUE OR UNKNOWN → TRUE; FALSE OR UNKNOWN → UNKNOWN.`,
      ),
      s(
        'is-null',
        'IS NULL / IS NOT NULL',
        `Never write WHERE col = NULL (always UNKNOWN). Use IS NULL. For “empty string vs NULL” decide business meaning and enforce NOT NULL or CHECK (col <> '') as needed.

IS DISTINCT FROM (PostgreSQL, SQL Server) treats NULLs as comparable: NULL IS DISTINCT FROM NULL is FALSE; NULL IS DISTINCT FROM 1 is TRUE—useful for join keys.`,
        `WHERE middle_name IS NULL;
WHERE phone IS NOT NULL;`,
      ),
      s(
        'aggregates',
        'Aggregates and NULL',
        `COUNT(*) counts rows. COUNT(expr) counts rows where expr IS NOT NULL. AVG/SUM ignore NULL inputs—AVG is sum of non-null divided by count of non-null, not count of rows.

GROUP BY puts all NULLs in one bucket. DISTINCT treats NULL as indistinguishable from NULL in SQL standard.

Use COALESCE(expr, 0) when you want NULL to behave as zero in arithmetic—but distinguish “missing” from “zero” semantically.`,
      ),
      s(
        'outer',
        'NULLs from OUTER JOIN',
        `LEFT JOIN fills non-matching right columns with NULL. Testing WHERE right.key IS NULL defines anti-join semantics. Testing WHERE right.col = 'x' after LEFT JOIN removes outer rows with NULL right side—often a bug; move right filters to ON for outer semantics or use INNER JOIN if that is intended.`,
      ),
    ],
  },
  {
    id: 'sql-joins-deep',
    category: 'SQL',
    tags: ['join', 'inner', 'keys'],
    title: 'INNER JOIN deep dive',
    summary:
      'INNER JOIN keeps only pairs of rows matching the ON predicate. This article compares ON vs WHERE for inner joins, equi vs non-equi joins, self-joins, multiple-key joins, and cardinality explosion.',
    seeAlso: ['sql-left-join-deep', 'visual-sql-join', 'sql-join-algorithms'],
    sections: [
      s(
        'equi',
        'Equi-joins and keys',
        `Most joins are equi-joins: ON a.key = b.key. Composite keys AND together: ON a.k1 = b.k1 AND a.k2 = b.k2. Natural JOIN (rare in production) joins same-named columns—dangerous when names collide accidentally.

Foreign keys declare intent but enforcement is separate; join correctness is still your query’s responsibility.`,
      ),
      s(
        'on',
        'ON vs WHERE for INNER JOIN',
        `Logically filter predicates that define the relationship belong in ON; filters that subset the business result can live in WHERE. For INNER JOIN only, row result is often identical either way—but ON keeps intent clear and matches OUTER JOIN discipline where the distinction matters.

Mixing outer-style optional predicates incorrectly is a top source of silent wrong counts.`,
      ),
      s(
        'fanout',
        'Cardinality and fan-out',
        `If the right side is not unique on join keys, each left row duplicates—SUM(amount) doubles. Detect with COUNT(*) growth vs single-table counts. Fix with DISTINCT on keys, subquery deduplication, or aggregate right side before join.

Semi-join EXISTS can replace join+distinct when you only need existence.`,
        `SELECT o.id AS order_id, c.name
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'paid';`,
      ),
      s(
        'non-equi',
        'Non-equi and range joins',
        `ON between ranges (e.g. effective dates) express temporal validity. These are harder to index—consider temporal tables, exclusion constraints, or precomputed intervals.`,
      ),
    ],
  },
  {
    id: 'sql-left-join-deep',
    category: 'SQL',
    tags: ['join', 'left', 'outer', 'null'],
    title: 'LEFT OUTER JOIN',
    summary:
      'LEFT OUTER JOIN preserves every row from the preserved side, filling non-matches with NULL. This article covers ON vs WHERE pitfalls, optional enrichment, anti-join idiom, and multiple LEFT JOIN chains.',
    seeAlso: ['sql-joins-deep', 'sql-anti-join-pattern', 'sql-null-three-valued'],
    sections: [
      s(
        'behavior',
        'Preservation rule',
        `Each row from the left appears at least once. If N right rows match ON, you still get N copies (fan-out). If zero match, one row with NULL right columns.

RIGHT JOIN is LEFT JOIN with tables swapped—style guides prefer left-only for consistency.`,
      ),
      s(
        'use-cases',
        'Optional relationships',
        `Attach optional profile data, show orders with or without promotions, list all customers with paid-order flag via CASE WHEN right.id IS NOT NULL.

Anti-join: LEFT JOIN … WHERE right.id IS NULL finds left rows with no match—prefer NOT EXISTS when NULLs complicate IN lists.`,
      ),
      s(
        'pitfall',
        'WHERE on outer side nullifies outerness',
        `Filter on a nullable right column in WHERE removes NULL-filled rows, recreating an inner join. Put predicates that define match shape in ON; use OR IS NULL patterns carefully when you need “match if exists satisfying predicate else still keep row.”

For “paid orders only but list all customers,” use conditional aggregation: SUM(CASE WHEN o.status='paid' THEN 1 ELSE 0 END) with LEFT JOIN or subquery.`,
      ),
    ],
  },
  {
    id: 'sql-anti-join-pattern',
    category: 'SQL',
    tags: ['not-exists', 'anti-join', 'subquery'],
    title: 'Anti-join patterns (NOT EXISTS vs NOT IN)',
    summary:
      'Anti-joins answer “rows with no related row satisfying …”. NOT EXISTS is usually safest with NULLs. This article compares NOT IN, LEFT JOIN … IS NULL, and NOT EXISTS plans.',
    seeAlso: ['sql-subqueries-correlated', 'sql-left-join-deep', 'sql-null-three-valued'],
    sections: [
      s(
        'not-exists',
        'NOT EXISTS (preferred)',
        `Correlated NOT EXISTS stops at first match; semantics are clear with NULLs in the subquery column. Optimizer often flattens to anti-join operators.

SELECT 1 in subquery is idiomatic—the engine ignores projected columns for EXISTS.`,
        `SELECT c.id
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id AND o.status = 'paid'
);`,
      ),
      s(
        'not-in',
        'NOT IN hazards',
        `NOT IN (SELECT col FROM t) yields UNKNOWN if any col is NULL in subquery result—outer row dropped. Use NOT EXISTS or ensure subquery column NOT NULL.

NOT IN literal lists with NULL: WHERE x NOT IN (1, NULL) is UNKNOWN for any x—another trap.`,
      ),
      s(
        'left-null',
        'LEFT JOIN … IS NULL',
        `Equivalent to NOT EXISTS for many equi-joins when join keys are NOT NULL. Watch duplicate right rows: they prevent NULL on join key even when “no valid match” intuitively holds—dedupe right side first.`,
      ),
    ],
  },
  {
    id: 'sql-subqueries-correlated',
    category: 'SQL',
    tags: ['subquery', 'correlated', 'scalar'],
    title: 'Subqueries: scalar, table, correlated',
    summary:
      'Subqueries nest SELECT in SELECT/FROM/WHERE/HAVING. This article covers scalar subquery errors, lateral joins, IN/EXISTS quantifiers, derived tables, and when optimizers merge vs materialize.',
    seeAlso: ['sql-cte-deep', 'sql-anti-join-pattern', 'sql-window-intro'],
    sections: [
      s(
        'kinds',
        'Scalar, row, table subqueries',
        `Scalar: must return ≤1 row; 0 rows → NULL; >1 row → runtime error in standard SQL. Use LIMIT 1 or aggregate (MAX) defensively.

Row subquery compares to row constructor (a,b) = (SELECT x,y …) in some dialects.

Table subquery in FROM must be aliased; can be lateral (PostgreSQL CROSS JOIN LATERAL) to reference outer columns.`,
      ),
      s(
        'correlated',
        'Correlated subqueries',
        `Inner query references outer columns—conceptually runs per outer row; optimizers decorrelate into joins when possible. Correlated scalar in SELECT list is a per-row lookup—can be slow without index on inner join key.

EXISTS is often faster than IN for large inner sets because it can short-circuit.`,
      ),
      s(
        'example',
        'Pattern: per-group threshold',
        `Products above category average price: compare p.price to aggregate over same category in subquery or join to grouped derived table. Window AVG() OVER (PARTITION BY category) often clearer than scalar subquery.`,
      ),
    ],
  },
  {
    id: 'sql-cte-deep',
    category: 'SQL',
    tags: ['cte', 'with', 'readability'],
    title: 'CTEs (WITH clauses)',
    summary:
      'Common Table Expressions name intermediate result sets for readability. This article covers chaining CTEs, recursive CTEs, materialization hints (PostgreSQL NOT MATERIALIZED), and CTE scope.',
    seeAlso: ['sql-subqueries-correlated', 'sql-window-intro', 'sql-views-deep'],
    sections: [
      s(
        'why',
        'Readability and reuse',
        `WITH revenue AS (SELECT …) SELECT … FROM revenue r JOIN … documents pipeline stages. Multiple CTEs separate concerns vs nested derived tables.

CTE names are not global—they exist only for the single statement.`,
      ),
      s(
        'recursive',
        'Recursive CTEs',
        `WITH RECURSIVE consists of anchor (non-recursive) UNION ALL recursive part referencing the CTE. Termination requires the recursive part to shrink the working set (graph cycles need cycle detection columns).

Applications: org hierarchies, bill of materials explosion, shortest path in small graphs, date series generation.`,
      ),
      s(
        'optimize',
        'Optimization notes',
        `Some optimizers inline CTEs like views; others materialize once. PostgreSQL 12+ inlines by default; NOT MATERIALIZED / MATERIALIZED affect hints. Measure EXPLAIN when performance matters—CTEs are not “always materialized once.”`,
      ),
    ],
  },
  {
    id: 'sql-group-having-deep',
    category: 'SQL',
    tags: ['group-by', 'having', 'aggregate'],
    title: 'GROUP BY & HAVING in depth',
    summary:
      'GROUP BY collapses rows sharing key values; aggregates summarize each group. This article covers functional dependencies, GROUPING SETS/CUBE/ROLLUP (concept), HAVING vs WHERE, and NULL groups.',
    seeAlso: ['sql-window-intro', 'sql-null-three-valued', 'mongo-group-stage'],
    sections: [
      s(
        'rule',
        'SELECT list and functional dependency',
        `Only grouped columns and aggregates (or columns functionally determined by group keys) may appear in SELECT without aggregate. pk → all columns of that table is the common exception when grouping by primary key.

Violations either error (PostgreSQL) or return arbitrary values (MySQL legacy)—always enable strict SQL mode.`,
      ),
      s(
        'having',
        'HAVING vs WHERE',
        `WHERE filters rows before grouping (cannot reference aggregates). HAVING filters groups after aggregation (can use COUNT(*), SUM, etc.).

Pattern: WHERE removes irrelevant detail rows; HAVING removes whole groups below thresholds.`,
        `SELECT customer_id, COUNT(*) AS n
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING COUNT(*) >= 2;`,
      ),
      s(
        'sets',
        'Advanced grouping (warehouse SQL)',
        `GROUPING SETS, CUBE, ROLLUP generate multiple grouping combinations in one scan—common in reporting. GROUPING() function distinguishes NULL dimension from super-aggregate row.`,
      ),
      s(
        'null-group',
        'NULL in GROUP BY',
        `All NULL keys bucket together—one group. DISTINCT and GROUP BY treat NULL consistently within an engine.`,
      ),
    ],
  },
  {
    id: 'sql-window-intro',
    category: 'SQL',
    tags: ['window', 'rank', 'analytics'],
    title: 'Window functions (comprehensive intro)',
    summary:
      'Window functions compute over a window of rows related to the current row without collapsing the result set. This article covers PARTITION BY, ORDER BY in OVER, framing clauses (ROWS/RANGE/GROUPS), ranking functions, offsets LAG/LEAD, and aggregate windows.',
    seeAlso: ['sql-group-having-deep', 'sql-order-limit-deep'],
    sections: [
      s(
        'concept',
        'Windows vs GROUP BY',
        `GROUP BY returns one row per group. Window functions return one output row per input row, adding computed columns based on neighboring rows in a partition.

Example: running revenue per customer without losing individual order rows.`,
      ),
      s(
        'syntax',
        'OVER clause',
        `func() OVER (PARTITION BY … ORDER BY … frame). PARTITION BY slices the dataset like GROUP BY but without collapsing. ORDER BY inside OVER defines peer ordering for ranking and frame bounds.

Empty OVER () uses whole table as one partition.`,
        `SELECT order_id, amount,
  SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running
FROM orders;`,
      ),
      s(
        'ranking',
        'ROW_NUMBER, RANK, DENSE_RANK',
        `ROW_NUMBER is unique 1..N within partition order (ties broken arbitrarily unless ORDER BY is unique). RANK leaves gaps after ties; DENSE_RANK does not gap.

NTILE(n) buckets rows into n nearly equal groups for percentiles.`,
      ),
      s(
        'frame',
        'Frames: ROWS vs RANGE vs GROUPS',
        `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is common for running sums. RANGE respects peer ties (ORDER BY key ties treated as same row for bounds) — dialect differences exist.

EXCLUDE CURRENT ROW / GROUP / TIES / NO OTHERS fine-tune inclusion (PostgreSQL 11+).`,
      ),
      s(
        'offset',
        'LAG, LEAD, FIRST_VALUE, NTH_VALUE',
        `LAG(col, n, default) reads previous row in partition order; LEAD reads next. Useful for period-over-period deltas. NULLs when out of window unless default supplied.

FIRST_VALUE / LAST_VALUE with frames—watch default frame RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW; LAST_VALUE often needs explicit ROWS BETWEEN … AND UNBOUNDED FOLLOWING.`,
      ),
      s(
        'agg',
        'Aggregate functions as windows',
        `SUM/AVG/COUNT/MIN/MAX with OVER compute sliding or cumulative aggregates. DISTINCT inside window aggregates is restricted or unsupported in many engines—dedupe in subquery first.`,
      ),
    ],
  },
];
