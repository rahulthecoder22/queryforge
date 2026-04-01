import type { InterviewTopic } from './types';

/** Curated SQL / data interview prep. Ship updates by editing this file or merging a remote JSON bundle. */
export const INTERVIEW_GUIDE_TOPICS: InterviewTopic[] = [
  {
    id: 'fundamentals',
    category: 'SQL fundamentals',
    description: 'Core language mechanics recruiters still lead with.',
    items: [
      {
        id: 'where-vs-having',
        question: 'What is the difference between WHERE and HAVING?',
        answer:
          'WHERE filters rows before aggregation. It runs in the logical pipeline before GROUP BY, so it cannot reference aggregate expressions like COUNT(*) or SUM(amount)—the aggregate does not exist yet.\n\nHAVING filters groups after GROUP BY. It can reference aggregates and grouped columns. Think: WHERE trims input rows; HAVING trims output groups.\n\nInterview pattern: “customers with more than five paid orders” usually means WHERE status = \'paid\' then GROUP BY customer_id HAVING COUNT(*) >= 5. Putting COUNT(*) in WHERE is a syntax error in standard SQL.',
        tags: ['basics', 'aggregation'],
        diagram: `   rows ──▶ WHERE ──▶ GROUP BY ──▶ HAVING ──▶ SELECT
              │           │              │
         raw table    fewer rows    one row / group   only big groups`,
        codeExamples: [
          {
            title: 'Classic pattern',
            sql: `SELECT customer_id, COUNT(*) AS n
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING COUNT(*) >= 5;`,
          },
        ],
      },
      {
        id: 'null-behavior',
        question: 'How does NULL behave in comparisons and aggregates?',
        answer:
          'NULL means “unknown,” not zero or empty string. Comparisons with =, <>, <, > involving NULL yield UNKNOWN (three-valued logic). WHERE keeps only TRUE, so UNKNOWN rows disappear—use IS NULL / IS NOT NULL.\n\nAggregates: SUM/AVG ignore NULL inputs. COUNT(*) counts rows; COUNT(col) counts rows where col IS NOT NULL.\n\nNOT IN (subquery) is dangerous when the subquery can return NULL: outer row compares to UNKNOWN for that NULL, and the whole predicate can become UNKNOWN (treated like false in WHERE). Prefer NOT EXISTS.',
        tags: ['null', 'basics'],
        diagram: `  NULL = NULL  →  UNKNOWN (not TRUE)
  WHERE treats UNKNOWN like FALSE → row dropped

  COUNT(*)        counts all rows in group
  COUNT(email)    ignores rows where email IS NULL`,
        codeExamples: [
          {
            title: 'Safe “not in list”',
            sql: `SELECT c.id
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM blocked_emails b WHERE b.email = c.email
);`,
          },
        ],
      },
      {
        id: 'primary-foreign',
        question: 'Explain primary keys vs foreign keys and why both matter.',
        answer:
          'A primary key uniquely identifies a row in a table (often surrogate BIGINT or UUID). It is indexed, usually NOT NULL, and gives other tables a stable pointer.\n\nA foreign key column references a parent key (usually the parent’s primary key). Declaring FK constraints tells the database to reject inserts/updates that would point nowhere, and to optionally cascade deletes/updates.\n\nWithout FKs, joins still run, but orphaned rows silently break reports and ORM assumptions. With FKs, the schema documents the relational model and catches bugs at write time.',
        tags: ['modeling', 'integrity'],
        diagram: `   customers                 orders
 ┌──────────────┐          ┌─────────────────┐
 │ id (PK)      │◀─────────│ customer_id (FK)│
 │ name         │   1:N    │ order_id (PK)   │
 └──────────────┘          └─────────────────┘`,
        codeExamples: [
          {
            title: 'SQLite-style declaration (illustrative)',
            sql: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  total_cents INTEGER NOT NULL
);`,
          },
        ],
      },
      {
        id: 'select-star',
        question: 'Why do people avoid SELECT * in production queries?',
        answer:
          'SELECT * expands to all columns in catalog order. New columns change API contracts, ORM mappings, and CSV exports without a code change. You also pay for wider rows over the network and prevent some covering-index-only plans.\n\nExplicit columns document intent, shrink payloads, and avoid leaking sensitive columns added later. Ad-hoc analytics and quick COUNT(*) FROM t are fine; application queries should list columns.',
        tags: ['performance', 'style'],
        codeExamples: [
          {
            title: 'Prefer',
            sql: `SELECT id, email, created_at
FROM users
WHERE active = 1;`,
          },
          {
            title: 'Scoped star in joins (still be careful)',
            sql: `SELECT u.id, u.email, p.display_name
FROM users u
JOIN profiles p ON p.user_id = u.id;`,
          },
        ],
      },
    ],
  },
  {
    id: 'joins',
    category: 'Joins & sets',
    description: 'How relational pieces connect.',
    items: [
      {
        id: 'join-types',
        question: 'Compare INNER, LEFT, RIGHT, and FULL OUTER JOIN.',
        answer:
          'INNER JOIN: only rows where the ON predicate matches on both sides.\n\nLEFT JOIN: every row from the left preserved; matching right rows attached, else right-side columns are NULL. RIGHT is mirror image (often rewritten as LEFT for style).\n\nFULL OUTER: all rows from both sides; non-matches NULL-pad the other side. Rare in OLTP, occasional in ETL when reconciling two feeds.\n\nChoose join type from “which table drives cardinality” and whether orphan rows must appear.',
        tags: ['joins'],
        diagram: `INNER:     A ∩ B          LEFT:  all A  +  matching B (else NULLs)
   A ●────● B                A ●────● B
       \__/                    ●──── ○
`,
        codeExamples: [
          {
            title: 'INNER',
            sql: `SELECT c.name, o.id
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id;`,
          },
          {
            title: 'LEFT + anti-join idiom',
            sql: `SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;`,
          },
        ],
      },
      {
        id: 'join-vs-subquery',
        question: 'When would you prefer a JOIN over a subquery (or vice versa)?',
        answer:
          'Optimizers often flatten joins and subqueries to the same plan—clarity matters. Use JOIN when you need columns from both tables in the result. Use EXISTS for existence checks (often clearer than DISTINCT join dedupe). Correlated subqueries can be fine on modern engines but profile on your data.\n\nNOT IN with nullable subquery columns is a foot-gun; NOT EXISTS is the safe pattern.',
        tags: ['joins', 'subqueries'],
        codeExamples: [
          {
            title: 'EXISTS instead of join + DISTINCT',
            sql: `SELECT p.id
FROM products p
WHERE EXISTS (
  SELECT 1 FROM order_lines ol
  WHERE ol.product_id = p.id
);`,
          },
        ],
      },
      {
        id: 'union-vs-union-all',
        question: 'What is the difference between UNION and UNION ALL?',
        answer:
          'UNION combines two same-shaped queries and removes duplicate rows (typically sort/hash deduplication)—extra CPU and memory.\n\nUNION ALL concatenates results and keeps duplicates—preferred when sets are disjoint by construction or duplicates are acceptable.\n\nColumn count and types must align; names come from the first branch.',
        tags: ['sets'],
        codeExamples: [
          {
            title: 'UNION ALL append',
            sql: `SELECT '2025-01' AS month, revenue FROM jan_sales
UNION ALL
SELECT '2025-02', revenue FROM feb_sales;`,
          },
        ],
      },
    ],
  },
  {
    id: 'aggregates',
    category: 'Aggregates & GROUP BY',
    description: 'Summaries, pitfalls, and interview favorites.',
    items: [
      {
        id: 'group-by-rules',
        question: 'What columns can appear in SELECT when you use GROUP BY?',
        answer:
          'Standard SQL: every non-aggregated column in SELECT must appear in GROUP BY (or be functionally determined by the grouped columns—e.g. grouping by primary key of a table lets you select other columns of that table).\n\nOtherwise the engine does not know which row inside the group to display. PostgreSQL errors; legacy MySQL might pick an arbitrary row—never rely on that.\n\nAggregates (SUM, MAX, COUNT, ARRAY_AGG, etc.) summarize the whole group and are always allowed.',
        tags: ['group-by', 'sql-standard'],
        codeExamples: [
          {
            title: 'Valid: group by PK of driving table',
            sql: `SELECT u.id, u.email, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.email;`,
          },
        ],
      },
      {
        id: 'running-total',
        question: 'How would you compute a running total of revenue by day?',
        answer:
          'Window functions: partition if needed (e.g. per store), order by day, and SUM over a frame that grows with each row. Default frame for aggregates with ORDER BY varies by engine—be explicit with ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a cumulative sum.\n\nWithout windows, correlated subqueries or self-joins on dates work but are usually slower and uglier.',
        tags: ['windows', 'analytics'],
        codeExamples: [
          {
            title: 'Cumulative revenue by day (global)',
            sql: `SELECT day,
  revenue,
  SUM(revenue) OVER (
    ORDER BY day
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total
FROM daily_sales;`,
          },
        ],
      },
      {
        id: 'dedupe',
        question: 'How do you deduplicate rows keeping the latest row per user?',
        answer:
          'ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) assigns 1 to the newest row per user; filter WHERE rn = 1 in an outer query or CTE. DISTINCT ON (PostgreSQL) is a compact alternative. A join to MAX(updated_at) per user also works but watch ties—decide whether to keep one or all max timestamps.',
        tags: ['windows', 'dedup'],
        codeExamples: [
          {
            title: 'ROW_NUMBER pattern',
            sql: `WITH ranked AS (
  SELECT id, user_id, body, updated_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id ORDER BY updated_at DESC
    ) AS rn
  FROM posts
)
SELECT id, user_id, body, updated_at
FROM ranked
WHERE rn = 1;`,
          },
        ],
      },
    ],
  },
  {
    id: 'transactions',
    category: 'Transactions & isolation',
    description: 'ACID and what can go wrong under concurrency.',
    items: [
      {
        id: 'acid',
        question: 'What does ACID mean?',
        answer:
          'Atomicity: commit applies all writes or none (rollback on failure).\n\nConsistency: committed state satisfies declared constraints (PK, FK, CHECK)—plus application-level invariants you enforce in code.\n\nIsolation: concurrent transactions see each other’s work only according to the isolation level (trade throughput vs anomalies).\n\nDurability: after successful commit, data survives process crash via WAL and replication policies.',
        tags: ['acid', 'theory'],
        diagram: `  BEGIN ──▶ writes (uncommitted in MVCC)
                │
         COMMIT ──▶ durable + visible to others (per isolation rules)
         ROLLBACK ──▶ undo`,
        codeExamples: [
          {
            title: 'Explicit transaction',
            sql: `BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 1;
UPDATE accounts SET balance = balance + 50 WHERE id = 2;
COMMIT;`,
          },
        ],
      },
      {
        id: 'isolation-levels',
        question: 'Name common isolation anomalies and which levels prevent them.',
        answer:
          'Dirty read: read another transaction’s uncommitted write. Non-repeatable read: same row read twice gets different committed values. Phantom read: repeated range query returns different row set because of inserts/updates by others.\n\nREAD COMMITTED: no dirty reads; still allows non-repeatable and phantom in many engines. REPEATABLE READ (snapshot): stable reads in one transaction in PostgreSQL; still watch serialization anomalies. SERIALIZABLE: strongest—often implemented with SSI or strict locking; may abort transactions on conflict.',
        tags: ['isolation', 'concurrency'],
        codeExamples: [
          {
            title: 'Serializable snippet (PostgreSQL)',
            sql: `BEGIN ISOLATION LEVEL SERIALIZABLE;
SELECT * FROM seats WHERE flight_id = 42 FOR UPDATE;
-- book seat ...
COMMIT;`,
          },
        ],
      },
      {
        id: 'optimistic-locking',
        question: 'What is optimistic vs pessimistic locking?',
        answer:
          'Pessimistic: lock rows up front (SELECT … FOR UPDATE) so concurrent writers block—good under high contention when conflicts are frequent.\n\nOptimistic: read version column, attempt update with WHERE id = ? AND version = ?; if zero rows affected, someone else won the race—retry. Good when conflicts are rare and you want to avoid long-held locks during user think-time.',
        tags: ['locking', 'patterns'],
        codeExamples: [
          {
            title: 'Optimistic update',
            sql: `UPDATE inventory
SET qty = qty - 1, version = version + 1
WHERE sku = 'ABC' AND version = 7;`,
          },
        ],
      },
    ],
  },
  {
    id: 'design',
    category: 'Modeling & system design',
    description: 'Higher-level database and data-pipeline talking points.',
    items: [
      {
        id: 'normalization',
        question: 'What is normalization and when might you denormalize?',
        answer:
          'Normalization (1NF–BCNF) removes redundancy and update anomalies by splitting facts into tables linked by keys. Each non-key column should depend on the key, the whole key, and nothing but the key.\n\nDenormalization copies or aggregates data for read performance—common in warehouses and read-heavy OLTP slices. You trade simpler/faster reads for harder writes and consistency risk; document invariants and use triggers or batch jobs to keep copies fresh.',
        tags: ['modeling', 'tradeoffs'],
        diagram: `  Normalized                 Denormalized (example)
  orders ─┬─ order_lines          order_report_row
          │   products               (wide flat table)
          └─ customers`,
      },
      {
        id: 'index-tradeoff',
        question: 'What are the tradeoffs of adding indexes?',
        answer:
          'Pros: faster point lookups, selective WHERE, join keys, ORDER BY that matches index order. Covering indexes (INCLUDE columns) can avoid heap access.\n\nCons: more storage; every INSERT/UPDATE/DELETE must maintain each index; too many similar indexes confuse optimizers. Leading column rule: composite (a,b) helps filters on a and on (a,b), not usually on b alone.',
        tags: ['indexing', 'performance'],
        codeExamples: [
          {
            title: 'Composite index',
            sql: `CREATE INDEX idx_orders_cust_date
ON orders (customer_id, order_date DESC);`,
          },
        ],
      },
      {
        id: 'oltp-vs-olap',
        question: 'How do OLTP and OLAP workloads differ?',
        answer:
          'OLTP: short transactions, row-oriented storage, many small reads/writes, strong consistency on hot keys—payments, inventory, sessions.\n\nOLAP: large scans, aggregations, columnar layouts, batch or interactive BI—metrics, experiments, finance close. Do not run huge reports on a busy primary without replicas, queues, or a warehouse.',
        tags: ['architecture', 'warehousing'],
        diagram: ` OLTP                    OLAP
 ┌────┐ many small txs     ┌─────────────┐
 │ ⚡ │ low latency        │ 📊 big scans │
 └────┘                    └─────────────┘`,
      },
    ],
  },
];
