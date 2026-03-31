import type { WikiArticle, WikiSection } from './types';

const s = (id: string, heading: string, body: string, code?: string): WikiSection => ({
  id,
  heading,
  body,
  code,
});

/** SQL encyclopedia articles (part 2 of 2). */
export const WIKI_SQL_B: WikiArticle[] = [
  {
    id: 'sql-order-limit-deep',
    category: 'SQL',
    tags: ['order-by', 'limit', 'pagination'],
    title: 'ORDER BY, LIMIT, OFFSET',
    summary:
      'ORDER BY sorts the result. LIMIT/TOP/FETCH cap row count; OFFSET skips leading rows. This article covers collation, NULL ordering, stable sorts, pagination strategies, and performance.',
    seeAlso: ['sql-window-intro', 'sql-select-from-deep'],
    sections: [
      s(
        'order',
        'ORDER BY expressions',
        `Sort keys can be columns, aliases (dialect-dependent in GROUP BY queries), or expressions. DESC/ASC per key. COLLATE for linguistic sort rules—must match index collation for index-assisted sort.

NULLS FIRST / LAST (PostgreSQL, SQL Server) controls NULL placement; default varies by engine.`,
      ),
      s(
        'stable',
        'Deterministic ordering',
        `Ties on sort keys need a final unique key (often primary key) so pagination and exports are reproducible. Non-deterministic ORDER BY causes flaky tests and duplicate/missing rows across pages.`,
      ),
      s(
        'offset',
        'OFFSET cost and alternatives',
        `OFFSET n scans and discards n rows—O(offset) work. For deep pages use keyset pagination: WHERE (sort_col, id) > (:last_sort, :last_id) ORDER BY sort_col, id LIMIT k.

FETCH FIRST n ROWS ONLY (SQL:2008) standardizes LIMIT; SQL Server uses OFFSET-FETCH; MySQL LIMIT offset,count.`,
      ),
    ],
  },
  {
    id: 'sql-union-deep',
    category: 'SQL',
    tags: ['union', 'set-ops'],
    title: 'UNION, INTERSECT, EXCEPT',
    summary:
      'Set operations combine queries vertically. This article covers type coercion, column count/name rules, ORDER BY placement, and DISTINCT vs ALL.',
    seeAlso: ['sql-select-from-deep', 'sql-null-three-valued'],
    sections: [
      s(
        'rules',
        'Shape and types',
        `Same number of columns; types must be compatible (implicit casts apply per engine rules). Column names come from first branch in standard SQL.

ORDER BY final result applies to whole union—use column position or outer subquery alias.`,
      ),
      s(
        'union-all',
        'UNION vs UNION ALL',
        `UNION implies DISTINCT merge—sort/hash dedupe cost. UNION ALL keeps duplicates when sets are disjoint by construction—preferred for ETL append pipelines.

INTERSECT returns rows appearing in both sets; EXCEPT (MINUS in Oracle) returns left-not-right. Portability varies; emulate with EXISTS/NOT EXISTS when needed.`,
      ),
    ],
  },
  {
    id: 'sql-case-deep',
    category: 'SQL',
    tags: ['case', 'conditional'],
    title: 'CASE expressions',
    summary:
      'CASE is SQL’s conditional expression (returns a value). Searched vs simple CASE, NULL handling, use in aggregates, pivot patterns, and boolean tricks.',
    seeAlso: ['sql-null-three-valued', 'sql-group-having-deep'],
    sections: [
      s(
        'forms',
        'Searched vs simple CASE',
        `Searched: CASE WHEN cond1 THEN v1 WHEN cond2 THEN v2 ELSE v0 END — each WHEN is boolean.

Simple: CASE expr WHEN val1 THEN … compares equality to expr (NULL-safe issues same as =).

CASE is an expression—must return one type (coercion rules apply). ELSE NULL is implicit if omitted.`,
        `SELECT order_id,
  CASE status
    WHEN 'paid' THEN 1
    WHEN 'open' THEN 0
    ELSE -1
  END AS status_rank
FROM orders;`,
      ),
      s(
        'agg',
        'CASE inside aggregates',
        `Conditional aggregates: SUM(CASE WHEN flag THEN amount ELSE 0 END). Pivot-style counts without PIVOT syntax. Faster than multiple table scans in one pass.`,
      ),
    ],
  },
  {
    id: 'sql-constraints-fk',
    category: 'SQL',
    tags: ['constraints', 'foreign-key', 'integrity'],
    title: 'Constraints & foreign keys',
    summary:
      'Declarative integrity: PRIMARY KEY, UNIQUE, NOT NULL, CHECK, FOREIGN KEY, DEFERRABLE. This article covers ON DELETE/UPDATE actions, composite keys, and SQLite PRAGMA foreign_keys.',
    seeAlso: ['concepts-normalization-deep', 'schema-migrations', 'sql-dml-deep'],
    sections: [
      s(
        'types',
        'Constraint types',
        `PRIMARY KEY implies UNIQUE NOT NULL and identifies a row. UNIQUE allows one NULL (in most engines) unless NOT NULL added. CHECK (expr) validates row on insert/update—expr can reference other columns.

ASSERTION (standard) is rarely implemented; use triggers for cross-table rules.`,
      ),
      s(
        'fk',
        'Foreign keys',
        `REFERENCES parent(pk) ensures child.fk exists in parent or is NULL if nullable. ON DELETE CASCADE removes children; SET NULL clears fk; RESTRICT/NO ACTION blocks delete; SET DEFAULT if default exists.

ON UPDATE rarely needed with surrogate keys. Composite FKs match composite PKs column-wise.

SQLite: enforcement requires PRAGMA foreign_keys=ON per connection.`,
      ),
      s(
        'defer',
        'Deferrable constraints',
        `INITIALLY DEFERRED constraints check at COMMIT—allows circular inserts within a transaction. Without deferral, insert order must respect dependency graph.`,
      ),
    ],
  },
  {
    id: 'sql-indexes-deep',
    category: 'SQL',
    tags: ['index', 'performance', 'b-tree'],
    title: 'Indexes & selective queries',
    summary:
      'B-tree indexes accelerate lookup and ordered access. This article covers composite indexes, include columns, partial indexes, hash/GiST (mention), write amplification, and statistics.',
    seeAlso: ['sql-explain-deep', 'sql-where-deep', 'mongo-indexes-concept'],
    sections: [
      s(
        'btree',
        'B-tree basics',
        `Default for many engines. Supports =, range, ORDER BY on leading prefix, MIN/MAX on indexed path. Each index adds write cost on INSERT/UPDATE/DELETE of covered columns.

Composite (a,b,c): usable for predicates on a; a+b; a+b+c—not b alone.`,
      ),
      s(
        'covering',
        'Covering / include columns',
        `INCLUDE columns (SQL Server) or storing extra columns in index-only scans lets SELECT read index without heap access—trade space for read speed.

Index-only scans still need visibility checks under MVCC in PostgreSQL unless snapshot satisfies.`,
      ),
      s(
        'partial',
        'Partial and expression indexes',
        `WHERE clause on index definition indexes subset (e.g. active rows only). Expression index on LOWER(email) supports case-insensitive search—query must match expression exactly.

Run ANALYZE/UPDATE STATISTICS so planner knows selectivity.`,
      ),
    ],
  },
  {
    id: 'sql-explain-deep',
    category: 'SQL',
    tags: ['explain', 'plan', 'optimization'],
    title: 'Reading EXPLAIN / query plans',
    summary:
      'Execution plans reveal scans, joins, costs, and row estimates. This article gives a dialect-neutral checklist and SQLite/QueryForge specifics.',
    seeAlso: ['sql-indexes-deep', 'sql-join-algorithms'],
    sections: [
      s(
        'goal',
        'What to look for',
        `• Seq/table scans on large tables with selective WHERE—missing index?

• Nested loop with huge inner loops—needs index on inner join key?

• Hash join memory spills—statistics or work_mem?

• Wrong row estimates—stale stats, correlated columns?

Compare estimated vs actual rows when EXPLAIN ANALYZE available.`,
      ),
      s(
        'sqlite',
        'SQLite EXPLAIN QUERY PLAN',
        `Prefix EXPLAIN QUERY PLAN before SELECT in QueryForge workspace. Shows SCAN vs SEARCH, which index, estimated rows. Temporary B-trees for GROUP BY or ORDER BY without index show sort cost.

Use .eqp on in sqlite3 CLI for automatic plans.`,
      ),
      s(
        'hints',
        'Hints and overrides',
        `Last resort: optimizer hints (vendor-specific) or query rewrite. Prefer fixing statistics and indexes. Forcing join order can help rare cases but rots quickly as data grows.`,
      ),
    ],
  },
  {
    id: 'sql-dml-deep',
    category: 'SQL',
    tags: ['insert', 'update', 'delete', 'upsert'],
    title: 'INSERT, UPDATE, DELETE, UPSERT patterns',
    summary:
      'Data modification semantics, RETURNING, bulk operations, conflict resolution, and safe multi-step workflows.',
    seeAlso: ['sql-constraints-fk', 'acid-deep'],
    sections: [
      s(
        'insert',
        'INSERT variants',
        `INSERT INTO t VALUES row; multi-row VALUES; INSERT SELECT for ETL. DEFAULT VALUES for row with all defaults. RETURNING * (PostgreSQL, SQLite 3.35+) captures generated keys.

Triggers fire per row—batch size affects trigger overhead.`,
      ),
      s(
        'update-delete',
        'UPDATE / DELETE',
        `JOIN syntax for UPDATE varies by dialect (FROM in PostgreSQL, multi-table in MySQL). Always run selective SELECT first to preview affected rows.

DELETE without WHERE truncates table logically—use transactions in production shells.`,
      ),
      s(
        'upsert',
        'Upsert / merge',
        `INSERT … ON CONFLICT DO UPDATE (PostgreSQL/SQLite) targets unique constraint or primary key. MERGE (SQL Server, PostgreSQL 15+) standardizes upsert—complex semantics, test carefully.

Conflict target must match exactly one unique index row.`,
      ),
    ],
  },
  {
    id: 'sql-views-deep',
    category: 'SQL',
    tags: ['view', 'security', 'abstraction'],
    title: 'Views & materialized views',
    summary:
      'Views are stored queries; materialized views cache results. Updatable views, WITH CHECK OPTION, security definer patterns, and refresh strategies.',
    seeAlso: ['sql-cte-deep', 'sql-dml-deep'],
    sections: [
      s(
        'view',
        'Ordinary views',
        `Simplify reporting, encapsulate joins, enforce column subset for roles (with GRANT on view). Some views are updatable if simple enough (single-table, no aggregates)—WITH CHECK OPTION enforces WHERE on inserts/updates through view.

INSTEAD OF triggers (SQL Server) make complex views writable.`,
      ),
      s(
        'matview',
        'Materialized views',
        `Store query results physically—fast reads, stale until REFRESH. Concurrent refresh strategies (CONCURRENTLY in PostgreSQL) reduce locking.

Common in warehouses; rare in hot OLTP except heavily read denormalized slices.`,
      ),
    ],
  },
  {
    id: 'sql-alias-qualify',
    category: 'SQL',
    tags: ['alias', 'style'],
    title: 'Table aliases & qualifying columns',
    summary:
      'Naming conventions, self-joins, ANSI join syntax, and linter-friendly SQL style for teams.',
    seeAlso: ['sql-joins-deep'],
    sections: [
      s(
        'style',
        'Conventions',
        `Meaningful short aliases: ord, cust, li (line item). Avoid single letters except tiny queries. Always qualify columns in multi-table SQL.

Use AS keyword for clarity. Leading commas vs trailing—pick team standard.`,
      ),
      s(
        'self',
        'Self-joins',
        `Same table twice needs two aliases: employee e JOIN employee m ON e.manager_id = m.id. Ambiguous id without alias fails or misbinds.`,
      ),
    ],
  },
  {
    id: 'sql-join-algorithms',
    category: 'SQL',
    tags: ['join', 'nested-loop', 'hash'],
    title: 'How databases execute joins (intuition)',
    summary:
      'Nested loop, block nested loop, hash join, merge join—complexity intuition and when optimizers pick each.',
    seeAlso: ['sql-joins-deep', 'sql-indexes-deep', 'sql-explain-deep'],
    sections: [
      s(
        'nested',
        'Nested loop join',
        `For each outer row, find inner matches—often index seek on inner equi-key. O(outer × log inner) with index vs O(outer × inner) scan.

Good for small outer or highly selective inner lookup.`,
      ),
      s(
        'hash',
        'Hash join',
        `Build hash table on smaller (build) side, probe with larger stream. Memory-bound; spills to disk if work_mem exceeded.

Best for large equi-joins without selective index on inner.`,
      ),
      s(
        'merge',
        'Merge join',
        `Both inputs sorted on join keys—linear merge. Excellent when inputs come from index range scans already ordered.

Non-equi joins may limit merge/hash choices—nested loop remains fallback.`,
      ),
    ],
  },
];
