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
          'WHERE filters rows before aggregation. It runs in the query pipeline before GROUP BY, so it cannot reference aggregate expressions like COUNT(*) or SUM(amount).\n\nHAVING filters groups after GROUP BY. Use it when the condition involves an aggregate or when you need to filter on the result of grouping.\n\nExample: “customers with more than 5 orders” needs GROUP BY customer_id HAVING COUNT(*) > 5. A predicate only on raw rows belongs in WHERE.',
        tags: ['basics', 'aggregation'],
      },
      {
        id: 'null-behavior',
        question: 'How does NULL behave in comparisons and aggregates?',
        answer:
          'NULL means “unknown,” not zero or empty string. Any comparison with NULL using =, <>, <, > yields UNKNOWN (treated as false in WHERE), so you need IS NULL / IS NOT NULL.\n\nFor aggregates, SUM/AVG ignore NULL inputs. COUNT(*) counts rows; COUNT(column) counts non-NULL values in that column.\n\nBoolean logic: AND/OR with UNKNOWN follow three-valued logic; be careful with NOT IN when the subquery can return NULL.',
        tags: ['null', 'basics'],
      },
      {
        id: 'primary-foreign',
        question: 'Explain primary keys vs foreign keys and why both matter.',
        answer:
          'A primary key uniquely identifies a row in a table. It should be stable, non-NULL (in practice), and indexed for fast lookups. One primary key per table (possibly composite).\n\nA foreign key enforces that a column’s values exist in the referenced table’s key column(s), preserving referential integrity. It documents relationships and lets the database reject inconsistent inserts/updates/deletes (depending on ON DELETE/UPDATE rules).\n\nTogether they model relations and keep joins trustworthy in production schemas.',
        tags: ['modeling', 'integrity'],
      },
      {
        id: 'select-star',
        question: 'Why do people avoid SELECT * in production queries?',
        answer:
          'SELECT * returns every column, which couples application code to the physical schema: adding a column changes row shape, payload size, and sometimes index-only plan choices.\n\nExplicit columns make intent clear, reduce network and memory, help covering indexes, and avoid leaking sensitive columns added later.\n\nIn ad-hoc analytics SELECT * is fine; in application SQL, list columns deliberately.',
        tags: ['performance', 'style'],
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
          'INNER JOIN keeps only rows where the join condition matches in both tables.\n\nLEFT JOIN keeps every row from the left table; matching right rows are attached, else right columns are NULL. RIGHT is the mirror image (less common; often rewritten as LEFT).\n\nFULL OUTER JOIN keeps all rows from both sides, NULL-filling the non-matching side.\n\nChoose based on which table drives the result set and whether you need orphan rows from one side.',
        tags: ['joins'],
      },
      {
        id: 'join-vs-subquery',
        question: 'When would you prefer a JOIN over a subquery (or vice versa)?',
        answer:
          'Modern optimizers often rewrite semantically equivalent JOINs and subqueries to the same plan. Prefer whichever reads clearest to your team.\n\nJOINs shine when you need columns from multiple tables in the result. Correlated subqueries can express “per-row” logic clearly but historically risked N+1-style plans; today depends on the engine.\n\nEXISTS subqueries are idiomatic for existence checks and often optimize well. For large IN lists, JOIN or EXISTS may beat IN (…) depending on the database.',
        tags: ['joins', 'subqueries'],
      },
      {
        id: 'union-vs-union-all',
        question: 'What is the difference between UNION and UNION ALL?',
        answer:
          'UNION combines two result sets and removes duplicate rows (often via sort/hash deduplication), which costs extra work.\n\nUNION ALL concatenates results and keeps duplicates—faster when you know rows are already distinct or duplicates are acceptable.\n\nUse UNION when you need distinct combined rows; default to UNION ALL when semantics allow.',
        tags: ['sets'],
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
          'In standard SQL, SELECT non-aggregated columns must appear in GROUP BY (or be functionally dependent on the grouped columns in engines that support it, e.g. MySQL with ONLY_FULL_GROUP_BY off is looser).\n\nOtherwise the engine does not know which row’s value to show for a group. Aggregates like MAX(order_date) are fine.\n\nInterview tip: state the standard rule first, then note dialect differences.',
        tags: ['group-by', 'sql-standard'],
      },
      {
        id: 'running-total',
        question: 'How would you compute a running total of revenue by day?',
        answer:
          'Use a window function: SUM(revenue) OVER (ORDER BY day ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).\n\nOn databases without windows, a self-join or correlated subquery on dates can work but is usually slower and harder to read.\n\nMention that frame clauses (ROWS vs RANGE) matter when there are ties on ORDER BY keys.',
        tags: ['windows', 'analytics'],
      },
      {
        id: 'dedupe',
        question: 'How do you deduplicate rows keeping the latest row per user?',
        answer:
          'Common patterns: (1) ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) = 1 in a CTE, then filter rn = 1.\n\n(2) DISTINCT ON (user_id) in PostgreSQL with a matching ORDER BY.\n\n(3) Grouped subquery joining back to MAX(updated_at). Prefer window functions for clarity and usually good plans on modern engines.',
        tags: ['windows', 'dedup'],
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
          'Atomicity: a transaction’s effects are all applied or none (rollback on failure).\n\nConsistency: the database moves from one valid state to another given declared constraints and rules.\n\nIsolation: concurrent transactions don’t observe each other’s partial work beyond what the isolation level allows.\n\nDurability: committed data survives crashes (WAL, replication, etc.).\n\nInterviewers often follow up with isolation levels and anomalies.',
        tags: ['acid', 'theory'],
      },
      {
        id: 'isolation-levels',
        question: 'Name common isolation anomalies and which levels prevent them.',
        answer:
          'Dirty read: seeing uncommitted data from another transaction. Non-repeatable read: the same row read twice returns different values. Phantom read: a second scan sees new rows that match a predicate.\n\nREAD UNCOMMITTED allows dirty reads (often avoided). READ COMMITTED prevents dirty reads. REPEATABLE READ prevents non-repeatable reads in many engines (MySQL/InnoDB semantics differ slightly). SERIALIZABLE prevents phantoms in the strict sense.\n\nExact behavior varies by database—name the standard story, then note engine-specific details if asked.',
        tags: ['isolation', 'concurrency'],
      },
      {
        id: 'optimistic-locking',
        question: 'What is optimistic vs pessimistic locking?',
        answer:
          'Pessimistic locking takes locks up front (SELECT … FOR UPDATE) so other writers wait—good when contention is high and conflicts are likely.\n\nOptimistic concurrency checks a version column or row hash at commit; if changed, retry. Good when conflicts are rare and you want higher throughput without holding locks during user think-time.\n\nORMs often expose both patterns; choose based on contention and UX.',
        tags: ['locking', 'patterns'],
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
          'Normalization reduces redundancy and update anomalies by splitting facts into tables linked by keys (1NF, 2NF, 3NF, BCNF).\n\nDenormalization duplicates data on purpose—often for read-heavy paths, precomputed aggregates, or to avoid joins at scale. It trades write complexity and consistency risk for read latency and simplicity.\n\nMention you measure with workload, SLAs, and maintenance cost.',
        tags: ['modeling', 'tradeoffs'],
      },
      {
        id: 'index-tradeoff',
        question: 'What are the tradeoffs of adding indexes?',
        answer:
          'Indexes speed up selective reads and some joins/orderings by avoiding full scans. They cost extra storage and slow down writes (insert/update/delete must maintain the index).\n\nToo many overlapping indexes confuse the optimizer and waste resources. Composite index column order matters for equality vs range predicates.\n\nMention covering indexes and that the best index depends on actual query patterns.',
        tags: ['indexing', 'performance'],
      },
      {
        id: 'oltp-vs-olap',
        question: 'How do OLTP and OLAP workloads differ?',
        answer:
          'OLTP: many short transactions, row-level reads/writes, strong consistency, low latency—think orders, payments, user sessions.\n\nOLAP: analytical scans, aggregations over large history, often columnar stores, batch or interactive BI—think warehouses and metrics.\n\nDesign choices (schema, indexes, hardware, batching) diverge; don’t run heavy reporting directly on a hot OLTP primary without safeguards.',
        tags: ['architecture', 'warehousing'],
      },
    ],
  },
];
