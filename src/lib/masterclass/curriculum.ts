/** Structured masterclass outline: SQL + MongoDB topics and practice hooks. */

export type CurriculumModule = {
  id: string;
  title: string;
  summary: string;
  lessons: { id: string; title: string; topics: string[] }[];
};

export const SQL_MASTERCLASS: CurriculumModule[] = [
  {
    id: 'sql-foundations',
    title: 'Foundations',
    summary: 'Relational model, SQLite/MySQL dialect basics, and safe querying habits.',
    lessons: [
      {
        id: 'sql-f1',
        title: 'Tables, types, and keys',
        topics: [
          'Primary keys, natural vs surrogate keys, composite keys',
          'NULL semantics: three-valued logic (TRUE / FALSE / UNKNOWN)',
          'Constraints: NOT NULL, UNIQUE, CHECK, foreign keys',
          'Transactions: ACID, isolation levels (conceptual)',
        ],
      },
      {
        id: 'sql-f2',
        title: 'SELECT essentials',
        topics: [
          'Projection, expressions, aliases',
          'DISTINCT and row duplicates',
          'ORDER BY, LIMIT / OFFSET (pagination patterns)',
          'Comments and formatting for maintainable SQL',
        ],
      },
      {
        id: 'sql-f3',
        title: 'Filtering & search',
        topics: [
          'WHERE predicates: comparison, IN, BETWEEN, LIKE',
          'AND / OR / NOT and parentheses',
          'Case sensitivity and collation (engine-specific)',
          'Full table scans vs selective filters (mental model)',
        ],
      },
    ],
  },
  {
    id: 'sql-joins',
    title: 'Joins & relational algebra',
    summary: 'Combine tables correctly: inner, outer, cross, and self-joins.',
    lessons: [
      {
        id: 'sql-j1',
        title: 'Inner join',
        topics: [
          'Key equality joins (FK = PK)',
          'Composite join keys',
          'Join vs filter: ON vs WHERE (outer join pitfalls)',
        ],
      },
      {
        id: 'sql-j2',
        title: 'Outer joins',
        topics: [
          'LEFT / RIGHT / FULL (where supported)',
          'Preserving rows when no match',
          'NULLs in joined columns and downstream filters',
        ],
      },
      {
        id: 'sql-j3',
        title: 'Advanced combinations',
        topics: [
          'CROSS JOIN (cartesian product) and when it is appropriate',
          'Self-joins for hierarchies and graphs',
          'Semi-joins / anti-joins via EXISTS / NOT EXISTS',
        ],
      },
    ],
  },
  {
    id: 'sql-aggregation',
    title: 'Aggregation & windows',
    summary: 'Summarize data and compare rows within partitions.',
    lessons: [
      {
        id: 'sql-a1',
        title: 'GROUP BY',
        topics: [
          'Aggregate functions: COUNT, SUM, AVG, MIN, MAX',
          'GROUP BY columns vs SELECT list rules',
          'HAVING vs WHERE',
        ],
      },
      {
        id: 'sql-a2',
        title: 'Window functions',
        topics: [
          'OVER(), PARTITION BY, ORDER BY in windows',
          'ROW_NUMBER, RANK, DENSE_RANK',
          'Running totals and moving averages',
        ],
      },
    ],
  },
  {
    id: 'sql-subqueries',
    title: 'Subqueries & CTEs',
    summary: 'Structure complex logic with readable, composable queries.',
    lessons: [
      {
        id: 'sql-s1',
        title: 'Subqueries in WHERE & SELECT',
        topics: [
          'Scalar vs row vs table subqueries',
          'IN / ANY / ALL patterns',
          'Correlated subqueries and performance intuition',
        ],
      },
      {
        id: 'sql-s2',
        title: 'CTEs & recursion',
        topics: [
          'WITH clauses for readability',
          'Chaining CTEs',
          'Recursive CTEs for trees and graphs (concept + examples)',
        ],
      },
    ],
  },
  {
    id: 'sql-dml-ddl',
    title: 'Mutations & schema design',
    summary: 'Change data safely; model schemas for integrity and performance.',
    lessons: [
      {
        id: 'sql-d1',
        title: 'INSERT / UPDATE / DELETE',
        topics: [
          'Upsert patterns (INSERT … ON CONFLICT where available)',
          'Multi-row INSERT, RETURNING (dialect-specific)',
          'Safe deletes: cascades and orphan prevention',
        ],
      },
      {
        id: 'sql-d2',
        title: 'Indexes & plans',
        topics: [
          'B-tree indexes, covering indexes',
          'EXPLAIN / query plans (high level)',
          'Selectivity, cardinality, and join order intuition',
        ],
      },
      {
        id: 'sql-d3',
        title: 'Normalization',
        topics: [
          '1NF–3NF and when to denormalize',
          'Star / snowflake schemas for analytics',
        ],
      },
    ],
  },
  {
    id: 'sql-advanced',
    title: 'Advanced SQL',
    summary: 'Set ops, JSON, dates, and analytical patterns.',
    lessons: [
      {
        id: 'sql-x1',
        title: 'Sets & pivots',
        topics: ['UNION / UNION ALL / INTERSECT / EXCEPT', 'Conditional aggregation', 'PIVOT-style reports'],
      },
      {
        id: 'sql-x2',
        title: 'Dates & strings',
        topics: [
          'Date/time types, time zones',
          'strftime / date_trunc patterns (dialect differences)',
          'String functions and pattern matching',
        ],
      },
      {
        id: 'sql-x3',
        title: 'JSON in SQL (where supported)',
        topics: ['JSON extraction operators', 'JSON arrays and unnesting concepts'],
      },
    ],
  },
];

export const MONGO_MASTERCLASS: CurriculumModule[] = [
  {
    id: 'mongo-foundations',
    title: 'MongoDB foundations',
    summary: 'Documents, BSON types, and the mental shift from rows to embedded structures.',
    lessons: [
      {
        id: 'm-f1',
        title: 'Documents & collections',
        topics: [
          '_id, ObjectId, and uniqueness',
          'Embedding vs referencing (1:1, 1:N, N:M)',
          'Schema flexibility vs application-level contracts',
        ],
      },
      {
        id: 'm-f2',
        title: 'CRUD with mongosh / drivers',
        topics: ['insertOne / insertMany', 'find, findOne', 'replace vs update operators'],
      },
    ],
  },
  {
    id: 'mongo-query',
    title: 'Querying & operators',
    summary: 'Filters, ranges, arrays, and logical composition.',
    lessons: [
      {
        id: 'm-q1',
        title: 'Query operators',
        topics: [
          '$eq, $ne, $gt, $gte, $lt, $lte',
          '$in, $nin',
          '$exists, $type',
          '$regex and collation',
        ],
      },
      {
        id: 'm-q2',
        title: 'Arrays & documents',
        topics: [
          '$elemMatch, $size, positional operators',
          'Querying nested objects and dot paths',
          '$and, $or, $not, $nor',
        ],
      },
    ],
  },
  {
    id: 'mongo-aggregation',
    title: 'Aggregation pipeline',
    summary: 'Multi-stage data processing: match, group, project, sort, and beyond.',
    lessons: [
      {
        id: 'm-a1',
        title: 'Core stages',
        topics: [
          '$match (early filtering)',
          '$project / $set / $unset',
          '$group and accumulators',
          '$sort, $limit, $skip',
        ],
      },
      {
        id: 'm-a2',
        title: 'Joins & reshaping',
        topics: [
          '$lookup (left outer join to another collection)',
          '$unwind for arrays',
          '$facet for multiple analytical branches',
          '$bucket / $bucketAuto for histograms',
        ],
      },
    ],
  },
  {
    id: 'mongo-indexes',
    title: 'Indexes & performance',
    summary: 'Make queries predictable at scale.',
    lessons: [
      {
        id: 'm-i1',
        title: 'Index types & ESR rule',
        topics: [
          'Single-field and compound indexes',
          'Equality, Sort, Range (ESR) guideline',
          'Covered queries and projections',
          'explain("executionStats") basics',
        ],
      },
      {
        id: 'm-i2',
        title: 'Special indexes',
        topics: ['Multikey indexes on arrays', 'Text indexes', 'Geospatial overview (2d / 2dsphere)'],
      },
    ],
  },
  {
    id: 'mongo-ops',
    title: 'Operations & data modeling',
    summary: 'Production concerns: consistency, scaling concepts, and patterns.',
    lessons: [
      {
        id: 'm-o1',
        title: 'Transactions & consistency',
        topics: [
          'Multi-document ACID transactions',
          'Replica sets (high level)',
          'Read / write concerns (conceptual)',
        ],
      },
      {
        id: 'm-o2',
        title: 'Patterns',
        topics: [
          'Bucket pattern for time series',
          'Subset pattern, computed / materialized patterns',
          'Schema versioning in documents',
        ],
      },
    ],
  },
];
