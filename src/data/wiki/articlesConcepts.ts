import type { WikiArticle, WikiSection } from './types';

type SectionOpts = { codeExtra?: string[]; diagram?: string };

const s = (id: string, heading: string, body: string, code?: string, opts?: SectionOpts): WikiSection => ({
  id,
  heading,
  body,
  code,
  ...opts,
});

export const WIKI_CONCEPTS: WikiArticle[] = [
  {
    id: 'acid-deep',
    category: 'Concepts',
    tags: ['acid', 'transaction'],
    title: 'ACID properties',
    summary:
      'Atomicity, Consistency, Isolation, and Durability are the classical guarantees people mean when they say a database is “transactional.” This article explains each letter in implementation terms: what the engine does under failure and concurrency, not just textbook one-liners.',
    seeAlso: ['isolation-levels', 'mongo-transactions-overview', 'mvcc-overview'],
    sections: [
      s(
        'why',
        'Why ACID exists',
        `Business rules almost always span more than one row or more than one write. Transferring money debits one account and credits another; placing an order inserts a header and line items; canceling a booking updates availability and inserts an audit row. If the process stops halfway—crash, power loss, bug, or duplicate submit—you can end up with money vanished, inventory wrong, or orders without lines.

A transaction is the database’s answer: a bounded sequence of operations that the system tries to treat as one logical unit. ACID names four properties that together describe what “one unit” should mean in a shared, crash-prone environment. Different products interpret the edges differently (especially isolation), but the vocabulary is universal.`,
      ),
      s(
        'transactions',
        'Transactions: BEGIN, COMMIT, ROLLBACK',
        `You open a transaction (explicitly with BEGIN / START TRANSACTION, or implicitly in some APIs), issue reads and writes, then either COMMIT (make all changes permanent) or ROLLBACK (discard all changes from that transaction).

Until commit, other sessions may or may not see your writes depending on isolation level. After commit, the system promises that either every statement’s effects are visible (atomicity + durability) or none are.

Savepoints let you partially roll back nested work inside one transaction: ROLLBACK TO SAVEPOINT keeps earlier statements but undoes work after the savepoint. That preserves atomicity of the outer transaction while allowing controlled recovery from a sub-step failure.`,
      ),
      s(
        'atomicity',
        'Atomicity (the “A”)',
        `Atomicity means all-or-nothing at the transaction boundary: either every data change in the transaction is applied, or none are. There is no durable state where “half the transfer” exists.

Engines implement this with undo information (rollback segments, undo logs) and a two-phase commit story at the storage layer: during execution, new versions may be written but marked uncommitted; on commit, they flip to committed; on abort or crash recovery, uncommitted versions are discarded or rolled back.

Atomicity is not the same as locking. You can be atomic while still allowing other transactions to read old row versions (MVCC). It is also not the same as “one statement only”: a single UPDATE that touches many rows is usually atomic with respect to those rows, but a multi-statement business rule still needs an explicit transaction wrapper if you want all statements to succeed or fail together.`,
        `BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;`,
        {
          diagram: `Transfer without atomicity (BAD)          With atomicity (GOOD)
┌─────────────────────────────┐          ┌─────────────────────────────┐
│ Crash after debit, no credit│          │ Crash mid-flight            │
│  Account 1: -100 ✓            │          │  Recovery: UNDO both writes │
│  Account 2: unchanged ✗       │          │  OR replay COMMIT record    │
│  Money vanished               │          │  Never half-applied durable │
└─────────────────────────────┘          └─────────────────────────────┘`,
        },
      ),
      s(
        'consistency',
        'Consistency (the “C”) — two meanings',
        `“Consistency” is overloaded. In ACID, it classically means the database’s own rules: PRIMARY KEY uniqueness, FOREIGN KEY referential integrity, NOT NULL, CHECK constraints, triggers that enforce invariants, and any declarative rules the engine checks on commit. After a successful commit, those rules hold; a transaction that would violate them must fail (or the engine rejects the offending statement).

There is a second, informal meaning: “the real world is consistent” (e.g. total debits equal total credits). The database cannot fully enforce arbitrary business logic—that is application consistency. Good schema design maps as much as possible into constraints so the engine shares the burden.

Triggers and deferred constraints blur the line: a transaction might temporarily violate a rule mid-flight if the DB allows deferring checks until COMMIT, as long as the final state is valid.`,
      ),
      s(
        'isolation',
        'Isolation (the “I”)',
        `Isolation describes how much one in-flight transaction can observe or interfere with another’s uncommitted or concurrent work. Perfect isolation would be serializable execution: every outcome as if transactions ran one at a time in some order. That is expensive, so SQL defines weaker isolation levels that allow specific anomalies (dirty reads, non-repeatable reads, phantoms) in exchange for throughput.

Isolation interacts with locking (pessimistic: block or fail conflicting operations) and MVCC (optimistic: keep multiple row versions; reads see a snapshot). The same level name (e.g. REPEATABLE READ) does not behave identically in PostgreSQL vs MySQL vs SQL Server—always read vendor docs for anomaly guarantees.

See the companion article “Isolation levels” for the full anomaly catalog and how READ COMMITTED, REPEATABLE READ, and SERIALIZABLE differ.`,
      ),
      s(
        'durability',
        'Durability (the “D”)',
        `Durability means that once COMMIT returns successfully, committed data survives process crash and typical power loss, subject to the storage and replication model. Implementations use write-ahead logging (WAL): log records describing changes are flushed to stable storage before or with commit, so recovery can replay or confirm committed work after restart.

Durability is not infinite: disk firmware can lie about fsync, single-node disks can fail, datacenters can burn. Replication adds “durability across nodes” at the cost of consensus latency (majority ack before commit). RPO/RTO (how much data loss and downtime you accept) are business parameters layered on top of engine durability.

Asynchronous replication means a commit can return before a standby has the log—you trade durability for speed until the replica catches up.`,
      ),
      s(
        'cross',
        'How the letters interact',
        `Atomicity and durability are the crash-recovery pair: logging makes commits durable; undo makes partial transactions disappear. Isolation plus consistency govern concurrent correctness: you want schedules that preserve invariants despite overlap. Weak isolation is where most production bugs appear (double spends, lost updates, phantom inventory) when application code assumes serializable behavior without requesting it.

MongoDB offers multi-document transactions on replica sets (4.0+) with ACID semantics within limits; single-document updates were always atomic. Document design that keeps related facts in one document reduces the need for cross-document transactions—see “Embedding vs referencing.”`,
      ),
    ],
  },
  {
    id: 'isolation-levels',
    category: 'Concepts',
    tags: ['isolation', 'mvcc', 'locking'],
    title: 'Isolation levels (READ COMMITTED, REPEATABLE READ, SERIALIZABLE)',
    summary:
      'SQL standard isolation levels describe which concurrent anomalies a database may allow. This article defines each anomaly precisely, maps common levels to those anomalies, and explains why the same level name can behave differently across PostgreSQL, MySQL/InnoDB, SQL Server, and SQLite.',
    seeAlso: ['acid-deep', 'mvcc-overview'],
    sections: [
      s(
        'anomalies',
        'The anomalies (precisely)',
        `• Dirty read: Transaction T1 reads a row version that T2 wrote but has not committed. If T2 rolls back, T1 acted on data that “never existed” in the database.

• Non-repeatable read: T1 reads a row. T2 updates or deletes that row and commits. T1 reads the same row again and sees a different value or finds it missing.

• Phantom read: T1 runs a query constrained by a predicate (e.g. WHERE status = open). T2 inserts or updates rows so they now match that predicate and commits. T1 runs the same query again and sees extra rows (“phantoms”).

• Lost update: T1 and T2 both read a value, compute new values in application memory, and write back. Last writer wins; one update disappears unless you use optimistic locking (version column), SELECT FOR UPDATE, or an atomic single-statement update.

• Read skew: T1 reads two related rows (e.g. two account balances) while T2 transfers money between them and commits; T1 sees a state that never existed together (related to snapshot timing).

• Write skew: Two transactions each read overlapping data and make disjoint writes that are individually valid but globally violate an invariant (classic example: two clinicians both seeing “one doctor on duty” and both going off duty). Preventing write skew typically needs true SERIALIZABLE or explicit constraint/locking patterns, not REPEATABLE READ alone in every engine.`,
        undefined,
        {
          diagram: `Isolation “slider” (conceptual — check your engine’s exact guarantees)

  READ UNCOMMITTED ──▶ READ COMMITTED ──▶ REPEATABLE READ ──▶ SERIALIZABLE
        │                      │                    │                 │
   may see uncommitted    no dirty reads      stable snapshot    like serial exec
        │                      │                    │                 │
   strongest throughput ◀──────────────────────────────────────▶ fewest anomalies`,
        },
      ),
      s(
        'sql-levels',
        'SQL standard levels (idealized)',
        `READ UNCOMMITTED: allows dirty reads (and everything else). Rarely used in SQL databases with MVCC; sometimes exposed as an alias for READ COMMITTED.

READ COMMITTED: each statement sees only committed data as of statement start (or latest committed for current statement, depending on engine). Prevents dirty reads; allows non-repeatable reads and phantoms.

REPEATABLE READ: a transaction sees a consistent snapshot for all reads in the transaction (in snapshot-based engines). May still allow phantoms in lock-based implementations if only row locks exist, not predicate/gap locks.

SERIALIZABLE: strongest standard level—execution should be equivalent to some serial order. Implemented via strict locking, serializable snapshot validation (SSI), or optimistic detection of conflicts.`,
      ),
      s(
        'engines',
        'Engine-specific reality (read the manual)',
        `PostgreSQL: READ COMMITTED uses per-statement snapshot; REPEATABLE READ and SERIALIZABLE use transaction snapshot; true serialization anomalies can be detected and one transaction aborted (serialization failure).

MySQL InnoDB: default REPEATABLE READ uses MVCC and next-key locking to reduce phantoms for many workloads; still not full serializable without SERIALIZABLE.

SQL Server: READ COMMITTED (default) can be row-versioned (snapshot) or locking-based depending on settings; SNAPSHOT isolation is a separate explicit mode.

SQLite: SERIALIZABLE by default for writers; readers do not block writers in WAL mode; still single-writer limits concurrency.

Always test your exact anomaly tolerance under load; naming alone is not enough.`,
      ),
      s(
        'pick',
        'Choosing a level in practice',
        `OLTP systems often default to READ COMMITTED for fewer conflicts and shorter locks. Financial reporting, inventory reservation, and “read then decide then write” workflows may need REPEATABLE READ or SERIALIZABLE, or application-side locks/idempotency keys.

Higher isolation increases abort rates and lock waits. Many teams stay on READ COMMITTED and use targeted SELECT FOR UPDATE, unique constraints, and idempotent APIs to patch specific races—cheaper when hot spots are few.`,
      ),
    ],
  },
  {
    id: 'concepts-normalization-deep',
    category: 'Concepts',
    tags: ['normalization', '1nf', '3nf'],
    title: 'Normalization (1NF–3NF and beyond)',
    summary:
      'Normalization removes redundancy and certain classes of update anomalies by decomposing tables so each fact lives in one place. This article walks from 1NF through 3NF with examples, mentions Boyce–Codd and higher normal forms, and notes when denormalization is intentional.',
    seeAlso: ['denormalization-when', 'sql-constraints-fk', 'mongo-schema-design'],
    sections: [
      s(
        'goals',
        'Goals of normalization',
        `Without normalization, the same fact stored in multiple rows creates risk: update one copy and miss another (inconsistency), delete a row and lose unrelated facts (deletion anomaly), or need NULL placeholders to add optional data (insertion anomaly). Normal forms are rules that, when satisfied, eliminate specific redundancy patterns.

Normalization is not “more tables = better.” Each join at query time has a cost. Data warehouses and document stores often denormalize for read latency. The relational model’s sweet spot is OLTP where correctness of writes dominates.`,
      ),
      s(
        '1nf',
        'First normal form (1NF)',
        `1NF requires atomic, scalar values in each column at the intersection of row and column: no repeating groups hidden inside one column, no lists of values that should be rows, no unstructured blobs that actually encode multiple attributes.

Example violation: orders.line_items as a comma-separated string of SKUs. Fix: line_items table (order_id, line_no, sku, qty) or an allowed structured type if your DB models arrays relationally.

Practical note: “atomic” is logical, not physical—a VARCHAR can be atomic if it represents one attribute (a legal name), non-atomic if it encodes several (concatenated codes).`,
      ),
      s(
        '2nf',
        'Second normal form (2NF)',
        `2NF assumes 1NF and removes partial dependency: every non-key attribute must depend on the entire primary key, not on a proper subset of a composite key.

Example: (order_id, product_id) → quantity depends on the pair, but product_name depends only on product_id. Move product_name to a products table keyed by product_id; keep quantity in order_lines keyed by (order_id, product_id).`,
      ),
      s(
        '3nf',
        'Third normal form (3NF)',
        `3NF assumes 2NF and removes transitive dependency: non-key attributes must depend only on the key, not on other non-key attributes.

Example: employee_id → department_id is fine; employee_id → department_name where department_name depends on department_id is transitive. Store department_name in departments keyed by department_id; reference department_id from employees.`,
      ),
      s(
        'bcnf',
        'Boyce–Codd normal form (BCNF)',
        `BCNF tightens 3NF: every determinant of a functional dependency must be a superkey. Rare cases exist where a table is in 3NF but not BCNF because of overlapping candidate keys and overlapping dependencies—textbooks use classroom/teacher/course examples. In practice designers aim for BCNF when anomalies persist after 3NF.`,
      ),
      s(
        'higher',
        '4NF, 5NF, DKNF',
        `Fourth and fifth normal forms address multi-valued facts and join dependencies (when a table encodes independent many-to-many facts that should be decomposed). Domain-key normal form is the theoretical “fully normalized” goal. Most operational schemas stop at 3NF/BCNF unless anomalies are proven.`,
      ),
    ],
  },
  {
    id: 'denormalization-when',
    category: 'Concepts',
    tags: ['denormalization', 'read-path'],
    title: 'When to denormalize',
    summary:
      'Denormalization duplicates data or merges entities to speed reads or simplify hot paths. This article catalogs common patterns (counters, snapshots, star schemas), the consistency cost, and mitigation tactics.',
    seeAlso: ['concepts-normalization-deep', 'star-schema-warehouse', 'mongo-schema-design'],
    sections: [
      s(
        'why',
        'Why denormalize',
        `Joins, aggregations, and subqueries cost CPU and I/O. Caching derived values—like order_count on a customer, last_login on a profile, or a denormalized “display name” copied from a user table—can cut read latency and query complexity. Document databases often embed one-to-few children to avoid a second lookup entirely.

Read-heavy dashboards and recommendation feeds routinely trade write simplicity for predictable GET performance.`,
      ),
      s(
        'patterns',
        'Common patterns',
        `• Materialized counters updated by triggers or application code (risk: drift if one code path forgets to increment).

• Snapshot columns: store price_at_purchase on line items so historical reports stay correct if catalog prices change.

• Wide fact tables in warehouses: degenerate dimensions and junk dimensions reduce joins at query time.

• Event sourcing / CQRS: one normalized write model, one denormalized read model rebuilt from events.`,
      ),
      s(
        'cost',
        'Costs and mitigations',
        `Update anomalies: every write path must update all copies or accept staleness. Mitigate with transactions, database triggers, change-data capture, or periodic reconciliation jobs.

Operational complexity: more code paths, harder debugging when copies disagree. Document invariants (“counter must equal COUNT(*)”) and add tests or DB constraints where possible.`,
      ),
    ],
  },
  {
    id: 'star-schema-warehouse',
    category: 'Concepts',
    tags: ['warehouse', 'star-schema', 'fact'],
    title: 'Star schema & analytics modeling',
    summary:
      'Star and snowflake schemas organize analytical data into fact tables (measurable events) and dimension tables (context). This article explains grains, conformed dimensions, slowly changing dimensions, and how this relates to SQL GROUP BY and window workloads.',
    seeAlso: ['sql-group-having-deep', 'denormalization-when'],
    sections: [
      s(
        'grain',
        'Fact table grain',
        `The grain declares one row means: one line item, one page view, one sensor reading per minute, etc. Every measure on that row must be true at that grain. Mixing grains (some rows per order, some per line) in one fact table corrupts aggregates.

Foreign keys to dimensions encode who, what, where, when. Degenerate dimensions (order_id stored on a line-level fact) are normal when the key has no attributes table.`,
      ),
      s(
        'dimensions',
        'Dimensions and conformed dimensions',
        `Dimensions describe context: customer, product, date, geography. Conformed dimensions use identical keys and attributes across multiple fact tables so you can drill across subject areas (sales + returns + support) without incompatible hierarchies.

Snowflake schema normalizes dimensions (e.g. brand → category hierarchies in separate tables). Star schema keeps dimensions wide and denormalized for simpler joins at query time.`,
      ),
      s(
        'scd',
        'Slowly changing dimensions (overview)',
        `When a customer moves or a product is renamed, analytics history may need old vs new truth. Type 1 overwrites, Type 2 adds a new row with validity dates, Type 3 keeps limited “previous value” columns. Choice affects GROUP BY and filter logic in every report.`,
      ),
      s(
        'sql',
        'SQL you will write',
        `Typical pattern: filter fact on date dimension, join to product and customer, GROUP BY dimension attributes, SUM/AVG measures. Window functions add running shares and period-over-period without collapsing to cube servers.`,
      ),
    ],
  },
  {
    id: 'cap-theorem',
    category: 'Concepts',
    tags: ['cap', 'distributed'],
    title: 'CAP theorem (practical framing)',
    summary:
      'CAP states that during a network partition, a distributed data store cannot simultaneously provide both linearizable consistency and total availability for reads and writes. This article unpacks the definitions, why CAP is often misunderstood, and how PACELC extends the tradeoff to normal operation.',
    seeAlso: ['replication-sharding', 'mongo-transactions-overview'],
    sections: [
      s(
        'defs',
        'Definitions (tightly)',
        `Consistency in CAP means linearizability: every operation appears to happen at a single instant in a global order; reads see the latest successful write. Availability means every request to a non-failing node eventually receives a non-error response (not “always fast”). Partition tolerance means the system continues despite arbitrary messages dropped between nodes—real networks partition, so practically you must tolerate partitions and choose between C and A under that scenario.`,
      ),
      s(
        'pick',
        'Pick two (during partition)',
        `If you refuse to fail writes during a partition, replicas may diverge—sacrificing linearizable C. If you refuse to serve stale reads, you may reject requests when a quorum is unreachable—sacrificing A in the CAP sense. Many systems offer tunable knobs (R/W quorum, consistency levels) so applications choose per operation.`,
      ),
      s(
        'pacelc',
        'PACELC and real products',
        `PACELC adds: else (when there is no partition), choose between latency (L) and consistency (C). Dynamo-style stores expose ONE, QUORUM, ALL; Google Spanner targets strong consistency with TrueTime; MongoDB replica sets default to primary reads with optional read concerns.

CAP is a teaching model, not a complete procurement checklist—latency, operational burden, and transactional scope matter as much.`,
      ),
    ],
  },
  {
    id: 'replication-sharding',
    category: 'Concepts',
    tags: ['replication', 'sharding', 'scale'],
    title: 'Replication vs sharding',
    summary:
      'Replication copies the same data to multiple nodes for availability and read scaling. Sharding splits data by key across nodes so no single machine holds the whole dataset. This article compares goals, failure modes, and query implications.',
    seeAlso: ['cap-theorem', 'connection-pooling'],
    sections: [
      s(
        'replication',
        'Replication',
        `Primary-secondary (leader-follower): writes go to the primary; replicas apply a log. Synchronous replicas wait for ack before commit (stronger durability, higher latency). Asynchronous replicas may lag (eventual consistency for readers).

Multi-primary replication exists but conflicts (same row edited on two primaries) need resolution rules. Read replicas offload analytics if the app tolerates lag.`,
      ),
      s(
        'shard',
        'Sharding (horizontal partitioning)',
        `Data is split by a shard key (user_id, tenant_id, geographic region). Queries that include the shard key hit one shard; scatter-gather queries (aggregates without shard key) fan out to all shards and are expensive.

Choosing the shard key is architectural: hot shards (celebrity users) and cross-shard transactions are ongoing engineering problems. Some systems offer auto-balancing; others require manual splits.`,
      ),
      s(
        'together',
        'Using both',
        `Large systems shard for size, then replicate each shard for HA. Application routers or proxy layers direct queries. SQL JOIN across shards usually happens in the app or a federated query layer, not as a single efficient database join.`,
      ),
    ],
  },
  {
    id: 'mvcc-overview',
    category: 'Concepts',
    tags: ['mvcc', 'postgres', 'sqlite'],
    title: 'MVCC (multi-version concurrency control)',
    summary:
      'MVCC lets readers see a consistent snapshot while writers create new row versions, reducing lock contention versus pure two-phase locking. This article explains versions, visibility rules, vacuum/retention, and how MVCC backs common isolation levels.',
    seeAlso: ['isolation-levels', 'acid-deep'],
    sections: [
      s(
        'idea',
        'Core idea',
        `Instead of overwriting a row in place while blocking all readers, the engine keeps multiple versions chained by transaction ids or timestamps. A read picks the newest version visible to its snapshot; an UPDATE inserts a new version and marks the old one superseded.

Readers do not take row locks for pure snapshot reads; writers may still conflict on the same logical row when two transactions try to update concurrently—resolved by first-commit-wins, serialization failure, or lock upgrade depending on engine.`,
      ),
      s(
        'visibility',
        'Visibility and garbage collection',
        `Old versions must be retained until no active transaction can see them, then vacuumed (PostgreSQL VACUUM, InnoDB purge thread). Long-running transactions or orphaned prepared transactions block cleanup and can bloat storage.

Snapshot isolation defines which committed transactions’ writes are visible: typically all commits completed before snapshot start, plus the transaction’s own writes.`,
      ),
      s(
        'tradeoffs',
        'Tradeoffs vs locking',
        `MVCC improves read concurrency and avoids many deadlocks from read/write overlap. Costs: storage for versions, vacuum CPU, and sometimes HOT update limitations. Some workloads (contended counters) still benefit from explicit row locks or atomic SQL updates.`,
      ),
    ],
  },
  {
    id: 'connection-pooling',
    category: 'Concepts',
    tags: ['pooling', 'latency'],
    title: 'Connection pooling',
    summary:
      'Opening a database connection involves TCP/TLS, authentication, session state, and memory. Pools reuse connections to cap concurrency and cut latency. This article covers sizing, pooler placement (PgBouncer, RDS Proxy), and pitfalls with prepared statements and transactions.',
    seeAlso: ['acid-deep', 'replication-sharding'],
    sections: [
      s(
        'why',
        'Why pool',
        `Each new connection consumes RAM on the server (buffers, catalog caches) and file descriptors. Thousands of microservices each opening a connection per request can exhaust max_connections. A pool on the app side or a middleware pooler multiplexes many clients onto fewer server sessions.

Rule of thumb: pool size roughly matches concurrent workers that truly need DB access simultaneously—not total user count.`,
      ),
      s(
        'sizing',
        'Sizing and queueing',
        `Too small a pool: requests wait on checkout, latency spikes. Too large: database context switching and lock contention. Measure wait time for connections, active queries, and CPU. Serverless adds burst patterns—use poolers that scale or proxy-supported IAM auth.

Transaction mode vs session mode poolers: session mode keeps temp tables and GUCs; transaction mode returns connection after each transaction—breaks session-scoped features unless pinned.`,
      ),
      s(
        'pitfalls',
        'Pitfalls',
        `Long transactions held across external API calls pin a connection and defeat pooling. LISTEN/NOTIFY, advisory locks, and some prepared statement modes need compatible pool settings. After errors, reset connection state or use pool validation queries.`,
      ),
    ],
  },
  {
    id: 'schema-migrations',
    category: 'Concepts',
    tags: ['migration', 'ddl'],
    title: 'Schema migrations in production',
    summary:
      'Changing live schemas without downtime requires expand/contract patterns, backfills, and compatibility layers. This article outlines safe DDL ordering, locking behavior, and feature flags for application rollouts.',
    seeAlso: ['sql-constraints-fk', 'denormalization-when'],
    sections: [
      s(
        'expand',
        'Expand / contract pattern',
        `Expand: add new nullable columns, new tables, new indexes CONCURRENTLY (where supported), dual-write or backfill in the background. Migrate reads to new shape behind a flag. Contract: remove old columns and code paths once traffic is clean.

Avoid destructive changes in one deploy: dropping a column before all writers stop using it causes outages. Renames are often “add new, copy, switch, drop old.”`,
      ),
      s(
        'locks',
        'Locks and table rewrites',
        `Some DDL takes ACCESS EXCLUSIVE locks (PostgreSQL) or rewrites the whole table (adding a column with default in older MySQL). Read vendor docs for online DDL. Large backfills should batch with sleep to avoid replica lag.

Foreign keys: validate in separate phases (create NOT VALID, then VALIDATE) on PostgreSQL to reduce lock time.`,
      ),
      s(
        'tools',
        'Tooling culture',
        `Versioned migration files (Flyway, Liquibase, Rails, Prisma migrate) give auditability. Pair every migration with application code that tolerates both old and new schema during rollout.`,
      ),
    ],
  },
];
