/**
 * Generates ~500 compact encyclopedia entries (SQL / MongoDB / Concepts).
 * Run: node scripts/generate-wiki-concepts.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '../src/data/wiki/articlesConceptDeck.generated.ts');

const sqlTopics = [
  'SELECT projections',
  'WHERE predicates',
  'GROUP BY keys',
  'HAVING filters',
  'ORDER BY sort keys',
  'LIMIT pagination',
  'OFFSET pitfalls',
  'INNER JOIN keys',
  'LEFT JOIN nulls',
  'RIGHT JOIN symmetry',
  'FULL OUTER JOIN',
  'CROSS JOIN cardinality',
  'SELF JOIN aliases',
  'NATURAL JOIN risks',
  'UNION ALL performance',
  'INTERSECT semantics',
  'EXCEPT anti-set',
  'EXISTS semi-join',
  'NOT EXISTS anti-join',
  'IN vs EXISTS',
  'scalar subqueries',
  'correlated subqueries',
  'lateral derived tables',
  'CTEs readability',
  'recursive CTEs',
  'window PARTITION BY',
  'window ORDER BY',
  'ROWS frame',
  'RANGE frame',
  'ROW_NUMBER',
  'RANK vs DENSE_RANK',
  'LAG and LEAD',
  'FIRST_VALUE',
  'LAST_VALUE frames',
  'running totals',
  'moving averages',
  'NTILE buckets',
  'CASE expressions',
  'COALESCE defaults',
  'NULLIF sentinels',
  'CAST and types',
  'date truncation',
  'interval arithmetic',
  'string concatenation',
  'LIKE patterns',
  'SIMILAR TO',
  'regex filters',
  'PRIMARY KEY design',
  'UNIQUE constraints',
  'FOREIGN KEY actions',
  'CHECK constraints',
  'deferrable constraints',
  'indexes on expressions',
  'partial indexes',
  'covering indexes',
  'composite index order',
  'statistics freshness',
  'EXPLAIN basics',
  'plan cost model',
  'hash join choice',
  'nested loop join',
  'merge join order',
  'transaction isolation',
  'read phenomena',
  'deadlock avoidance',
  'optimistic locking',
  'pessimistic locking',
  'MVCC snapshots',
  'vacuum / purge',
  'upsert patterns',
  'MERGE statement',
  'bulk insert',
  'RETURNING clause',
  'views security',
  'materialized views',
  'stored procedures',
  'triggers caveats',
  'ORM N+1 queries',
];

const mongoTopics = [
  'find filter shape',
  '$eq operator',
  '$ne matching',
  '$gt comparisons',
  '$in arrays',
  '$nin exclusion',
  '$and composition',
  '$or composition',
  '$nor negation',
  '$not wrapping',
  '$exists paths',
  '$type checks',
  '$regex options',
  '$elemMatch arrays',
  '$all membership',
  '$size length',
  '$slice projection',
  'dot notation paths',
  'array index access',
  'embedded documents',
  'ObjectId generation',
  'UUID _id strategy',
  '$match early',
  '$project shaping',
  '$addFields compute',
  '$group accumulators',
  '$sum per group',
  '$avg per group',
  '$push arrays',
  '$addToSet unique',
  '$lookup joins',
  '$unwind arrays',
  '$sort memory',
  '$limit stages',
  '$skip cost',
  '$facet fan-out',
  '$bucket boundaries',
  '$graphLookup depth',
  'read concern levels',
  'write concern majority',
  'retryable writes',
  'change streams',
  'TTL indexes',
  'text indexes',
  'geospatial 2dsphere',
  'compound index ESR',
  'shard key heat',
  'zone sharding',
  'transactions limits',
  'document growth',
  'padding factor',
  'schema validation',
  'aggregation allowDisk',
];

const conceptTopics = [
  'OLTP vs OLAP',
  'columnar storage',
  'row storage',
  'WAL durability',
  'ARIES recovery',
  'checkpoint intervals',
  'hot rows contention',
  'queueing theory',
  'Little’s law',
  'backpressure',
  'idempotency keys',
  'exactly-once illusion',
  'at-least-once delivery',
  'saga pattern',
  'outbox pattern',
  'CDC pipelines',
  'event sourcing',
  'CQRS read models',
  'lambda architecture',
  'kappa streaming',
  'data mesh pillars',
  'lakehouse tradeoffs',
  'Iceberg tables',
  'Delta Lake ACID',
  'Parquet column stats',
  'Bloom filters',
  'skip indexes',
  'zonemaps',
  'min-max pruning',
  'cost-based optimizer',
  'rule-based optimizer',
  'histogram estimates',
  'extended statistics',
  'join order search',
  'query rewriting',
  'predicate pushdown',
  'partition pruning',
  'dynamic SQL risks',
  'prepared statements',
  'bind parameters',
  'SQL injection defense',
  'least privilege DB users',
  'row-level security',
  'column masking',
  'encryption at rest',
  'TLS in transit',
  'audit logging',
  'PII classification',
  'GDPR erasure',
  'retention policies',
  'backup RPO',
  'restore RTO',
  'PITR recovery',
  'logical vs physical backup',
  'failover automation',
  'split-brain risk',
  'quorum reads',
  'leader election',
  'gossip protocols',
  'vector clocks',
  'CRDTs overview',
  'consistent hashing',
  'rendezvous hashing',
  'cache stampede',
  'dogpile mitigation',
  'materialized path trees',
  'nested sets tradeoffs',
  'adjacency list queries',
  'temporal validity',
  'bitemporal modeling',
  'SCD type 1',
  'SCD type 2',
  'slowly changing dims',
  'junk dimensions',
  'role-playing dimensions',
  'conformed dimensions',
  'bridge tables',
  'helper tables',
  'surrogate keys',
  'natural keys',
  'UUID v7 ordering',
  'clock skew',
  'monotonic IDs',
  'snowflake IDs',
  'ULID properties',
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function bodyFor(kind, title, i) {
  const n = i + 1;
  if (kind === 'SQL') {
    return `This note is part of the SQL concept deck (${n}). It connects to how engines execute declarative queries: start from a clear grain (one row means what), write selective predicates first, then joins, then grouping. Practice the idea in QueryForge Workspace with EXPLAIN when available.

Related patterns appear across the main wiki articles — use search to jump to the deep-dive page for this topic area.`;
  }
  if (kind === 'MongoDB') {
    return `This note is part of the MongoDB concept deck (${n}). Document databases reward modeling for your read path: embed bounded children, reference large shared entities, and place selective $match early in pipelines. Always profile with explain in a real cluster.

Cross-check with the operator reference and aggregation overview in the main wiki.`;
  }
  return `This note is part of the systems concept deck (${n}). Databases sit in a stack of hardware, OS, network, and application semantics — correctness, latency, and cost are joint optimizations. Use this page as a checklist term; follow See also to broader articles when you need implementation detail.

For interview prep, be ready to explain tradeoffs out loud, not just define buzzwords.`;
}

const cats = ['SQL', 'MongoDB', 'Concepts'];
const pool = [sqlTopics, mongoTopics, conceptTopics];

const articles = [];
let idx = 0;
while (articles.length < 500) {
  const cat = cats[idx % 3];
  const topics = pool[idx % 3];
  const base = pick(topics, Math.floor(idx / 3));
  const variant = Math.floor(idx / topics.length) + 1;
  const title =
    variant > 1 ? `${base} (angle ${variant})` : `${cat}: ${base}`;
  const id = `concept-deck-${String(idx + 1).padStart(4, '0')}`;
  const summary = `Compact reference: ${title}. Part of the 500-topic concept deck — pair with full wiki articles for depth.`;
  const body = bodyFor(cat, title, idx);
  articles.push({
    id,
    category: cat,
    tags: ['concept-deck', cat.toLowerCase(), 'glossary'],
    title,
    summary,
    sections: [
      {
        id: 'overview',
        heading: 'Overview',
        body,
      },
      {
        id: 'practice',
        heading: 'How to practice',
        body: `• Skim this page, then open a matching challenge or workspace query.\n• Write the smallest query that proves you understood the term.\n• Teach it aloud in one minute — gaps reveal what to re-read.`,
      },
    ],
  });
  idx += 1;
}

const header = `/* eslint-disable max-len -- generated */
/**
 * AUTO-GENERATED by scripts/generate-wiki-concepts.mjs — do not edit by hand.
 * 500 compact concept entries; deep articles live in articlesSql / articlesMongo / articlesConcepts.
 */
import type { WikiArticle } from './types';

export const WIKI_CONCEPT_DECK: WikiArticle[] = `;

writeFileSync(out, `${header}${JSON.stringify(articles, null, 2)} as WikiArticle[];\n`);
console.log('Wrote', out, 'entries:', articles.length);
