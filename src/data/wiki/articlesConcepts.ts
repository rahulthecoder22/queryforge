import type { WikiArticle, WikiSection } from './types';

const s = (id: string, heading: string, body: string, code?: string): WikiSection => ({
  id,
  heading,
  body,
  code,
});

export const WIKI_CONCEPTS: WikiArticle[] = [
  {
    id: 'acid-deep',
    category: 'Concepts',
    tags: ['acid', 'transaction'],
    title: 'ACID properties',
    summary: 'Atomicity, Consistency, Isolation, Durability — what each means in practice.',
    seeAlso: ['isolation-levels', 'mongo-transactions-overview'],
    sections: [
      s(
        'atomicity',
        'Atomicity',
        `All operations in a transaction commit together or none do. Partial writes roll back.`,
      ),
      s(
        'consistency',
        'Consistency',
        `Database moves between valid states: constraints, triggers, and rules hold before and after.`,
      ),
      s(
        'isolation',
        'Isolation',
        `Concurrent transactions don’t see each other’s uncommitted work — degree depends on isolation level.`,
      ),
      s(
        'durability',
        'Durability',
        `Committed data survives crash after commit ack (assuming storage doesn’t lie).`,
      ),
    ],
  },
  {
    id: 'isolation-levels',
    category: 'Concepts',
    tags: ['isolation', 'mvcc', 'locking'],
    title: 'Isolation levels (READ COMMITTED, REPEATABLE READ, SERIALIZABLE)',
    summary: 'Anomalies each level prevents.',
    seeAlso: ['acid-deep'],
    sections: [
      s(
        'anomalies',
        'Anomalies',
        `Dirty read: see uncommitted data. Non-repeatable read: same query twice, row changed. Phantom: new rows appear in range. Serialization: as if transactions ran one-by-one.`,
      ),
      s(
        'pick',
        'Choosing',
        `OLTP often READ COMMITTED; financial reporting may need REPEATABLE READ or SERIALIZABLE. Higher isolation = more locking or MVCC overhead.`,
      ),
    ],
  },
  {
    id: 'concepts-normalization-deep',
    category: 'Concepts',
    tags: ['normalization', '1nf', '3nf'],
    title: 'Normalization (1NF–3NF)',
    summary: 'Reducing redundancy and update anomalies.',
    seeAlso: ['denormalization-when', 'sql-constraints-fk'],
    sections: [
      s(
        '1nf',
        'First normal form',
        `Atomic columns — no repeating groups in a single column; use child tables or arrays depending on model.`,
      ),
      s(
        '2nf',
        'Second normal form',
        `No partial dependency: non-key attributes depend on the whole composite key.`,
      ),
      s(
        '3nf',
        'Third normal form',
        `No transitive dependency: non-key attributes depend only on the key, not on other non-key attributes.`,
      ),
    ],
  },
  {
    id: 'denormalization-when',
    category: 'Concepts',
    tags: ['denormalization', 'read-path'],
    title: 'When to denormalize',
    summary: 'Trading write simplicity for read speed.',
    seeAlso: ['concepts-normalization-deep', 'star-schema-warehouse'],
    sections: [
      s(
        'why',
        'Why',
        `Caches, materialized counts, embedded documents — duplicate data to avoid joins or aggregations on hot paths.`,
      ),
      s(
        'cost',
        'Cost',
        `Update anomalies: changing source data must update all copies or accept staleness.`,
      ),
    ],
  },
  {
    id: 'star-schema-warehouse',
    category: 'Concepts',
    tags: ['warehouse', 'star-schema', 'fact'],
    title: 'Star schema & analytics',
    summary: 'Fact and dimension tables for BI workloads.',
    seeAlso: ['sql-group-having-deep'],
    sections: [
      s(
        'fact',
        'Fact table',
        `Rows are events: sales, clicks. Numeric measures + foreign keys to dimensions.`,
      ),
      s(
        'dimension',
        'Dimensions',
        `Who, what, where, when — conformed dimensions shared across facts.`,
      ),
    ],
  },
  {
    id: 'cap-theorem',
    category: 'Concepts',
    tags: ['cap', 'distributed'],
    title: 'CAP theorem (practical framing)',
    summary: 'Consistency, Availability, Partition tolerance — pick two during a partition.',
    seeAlso: ['replication-sharding'],
    sections: [
      s(
        'note',
        'Reality',
        `CAP is a narrow formal model; real systems tune consistency vs latency continuously (PACELC). Still useful vocabulary.`,
      ),
    ],
  },
  {
    id: 'replication-sharding',
    category: 'Concepts',
    tags: ['replication', 'sharding', 'scale'],
    title: 'Replication vs sharding',
    summary: 'Scaling reads vs scaling data size.',
    seeAlso: ['cap-theorem'],
    sections: [
      s(
        'replication',
        'Replication',
        `Copies of data on multiple nodes — higher read availability, failover. Writes still hit primaries (typical).`,
      ),
      s(
        'shard',
        'Sharding',
        `Horizontal partition by shard key — each node holds a subset. Cross-shard queries are expensive.`,
      ),
    ],
  },
  {
    id: 'mvcc-overview',
    category: 'Concepts',
    tags: ['mvcc', 'postgres', 'sqlite'],
    title: 'MVCC (multi-version concurrency control)',
    summary: 'How readers don’t block writers in many databases.',
    seeAlso: ['isolation-levels'],
    sections: [
      s(
        'idea',
        'Idea',
        `Old row versions kept until no transaction needs them. Reads snapshot a consistent state without locks on rows (simplified).`,
      ),
    ],
  },
  {
    id: 'connection-pooling',
    category: 'Concepts',
    tags: ['pooling', 'latency'],
    title: 'Connection pooling',
    summary: 'Reusing TCP/auth to the database.',
    seeAlso: ['acid-deep'],
    sections: [
      s(
        'why',
        'Why pool',
        `Opening DB connections is slow. Pools cap concurrency and reuse sockets. Size pool to DB max_connections and app threads.`,
      ),
    ],
  },
  {
    id: 'schema-migrations',
    category: 'Concepts',
    tags: ['migration', 'ddl'],
    title: 'Schema migrations',
    summary: 'Evolving production schemas safely.',
    seeAlso: ['sql-constraints-fk'],
    sections: [
      s(
        'expand-contract',
        'Expand/contract',
        `Additive changes first (new nullable column), backfill, switch reads, then enforce — reduces downtime.`,
      ),
    ],
  },
];
