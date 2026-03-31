import type { WikiArticle, WikiSection } from './types';

const s = (id: string, heading: string, body: string, code?: string): WikiSection => ({
  id,
  heading,
  body,
  code,
});

export const WIKI_MONGO: WikiArticle[] = [
  {
    id: 'mongo-find-overview',
    category: 'MongoDB',
    tags: ['find', 'filter', 'json'],
    title: 'Find filters & document structure',
    summary: 'BSON types, field paths, and how QueryForge matches documents locally.',
    seeAlso: ['mongo-operators-reference', 'mongo-comparison-sql'],
    sections: [
      s(
        'documents',
        'Documents',
        `MongoDB stores BSON documents (JSON-like). Arrays and nested objects are first-class. _id uniquely identifies a document in a collection.`,
      ),
      s(
        'filter',
        'Filter object',
        `find({ ... }) uses the same shape as the course: keys are paths; values are literals or operator documents. Top-level keys are AND-ed.`,
        `db.users.find({ "role": "engineer", "remote": true })`,
      ),
    ],
  },
  {
    id: 'mongo-operators-reference',
    category: 'MongoDB',
    tags: ['operators', 'reference', '$in', '$gt'],
    title: 'Query operator reference (course subset)',
    summary: 'Operators supported in QueryForge’s local matcher + what they mean.',
    seeAlso: ['mongo-find-overview', 'mongo-elem-deep'],
    sections: [
      s(
        'comparison',
        'Comparisons',
        `$eq, $ne, $gt, $gte, $lt, $lte — use on numbers (and in real MongoDB, dates). In QueryForge, numeric comparisons require numeric fields.`,
      ),
      s(
        'sets',
        'Sets',
        `$in / $nin — for scalars, membership in list; for array fields in this matcher, $in tests overlap with array elements.`,
      ),
      s(
        'logic',
        'Logic',
        `$and, $or — arrays of sub-documents. $not exists in full MongoDB; combine $ne and $nor patterns when needed.`,
      ),
      s(
        'array',
        'Arrays',
        `$elemMatch — all conditions must hold on the same array element. $exists on dot paths (e.g. certs.0) tests array emptiness.`,
        `{ "lines": { "$elemMatch": { "sku": "A", "qty": { "$gte": 2 } } } }`,
      ),
    ],
  },
  {
    id: 'mongo-elem-deep',
    category: 'MongoDB',
    tags: ['elemMatch', 'array', 'line-items'],
    title: '$elemMatch in depth',
    summary: 'Why one line item must satisfy all predicates together.',
    seeAlso: ['mongo-operators-reference', 'visual-mongo-match'],
    sections: [
      s(
        'problem',
        'The problem without $elemMatch',
        `Order has lines [{sku:A,qty:1},{sku:B,qty:5}]. Filter {"lines.sku":"A","lines.qty":{"$gte":5}} can match different indices — wrong for business rules.`,
      ),
      s(
        'solution',
        'The solution',
        `$elemMatch groups predicates so a single subdocument must satisfy all of them.`,
      ),
    ],
  },
  {
    id: 'mongo-dot-deep',
    category: 'MongoDB',
    tags: ['dot-notation', 'nested'],
    title: 'Dot notation & embedded documents',
    summary: 'Traversing objects and array indices in query keys.',
    seeAlso: ['mongo-find-overview'],
    sections: [
      s(
        'embed',
        'Embedded objects',
        `meta.office queries doc.meta.office. If meta is missing, the path is undefined and comparisons fail unless you use $exists.`,
      ),
      s(
        'array-index',
        'Array indices',
        `tags.0 is first element. Useful for "non-empty array" via {"tags.0":{"$exists":true}}.`,
      ),
    ],
  },
  {
    id: 'mongo-aggregation-intro',
    category: 'MongoDB',
    tags: ['aggregation', 'pipeline', '$match'],
    title: 'Aggregation pipeline (overview)',
    summary: 'Stages, $match placement, and analogy to SQL.',
    seeAlso: ['mongo-group-stage', 'mongo-lookup-concept', 'visual-mongo-match'],
    sections: [
      s(
        'stages',
        'Stages',
        `Pipeline = array of stages. Common order: $match → $project → $group → $sort → $limit. Each stage transforms the stream.`,
      ),
      s(
        'sql-map',
        'SQL mapping',
        `$match ≈ WHERE, $group ≈ GROUP BY, $lookup ≈ LEFT JOIN, $project ≈ SELECT list, $sort ≈ ORDER BY.`,
      ),
    ],
  },
  {
    id: 'mongo-group-stage',
    category: 'MongoDB',
    tags: ['$group', 'accumulator'],
    title: 'The $group stage',
    summary: 'Grouping documents and accumulators.',
    seeAlso: ['mongo-aggregation-intro', 'sql-group-having-deep'],
    sections: [
      s(
        '_id',
        'Group key',
        `_id is the grouping expression — null groups everything. $sum, $avg, $max, $min, $push, $addToSet aggregate per group.`,
        `{ $group: { _id: "$country", total: { $sum: "$amount" } } }`,
      ),
    ],
  },
  {
    id: 'mongo-lookup-concept',
    category: 'MongoDB',
    tags: ['$lookup', 'join'],
    title: '$lookup (left outer join to a collection)',
    summary: 'Joining collections in the aggregation pipeline.',
    seeAlso: ['mongo-aggregation-intro', 'sql-joins-deep'],
    sections: [
      s(
        'shape',
        'Conceptual shape',
        `$lookup adds an array field with matched documents from another collection (like a left join). Unwind that array to flatten rows.`,
      ),
    ],
  },
  {
    id: 'mongo-indexes-concept',
    category: 'MongoDB',
    tags: ['index', 'esr', 'performance'],
    title: 'Indexes in MongoDB (concept)',
    summary: 'Compound indexes and the ESR rule.',
    seeAlso: ['mongo-find-overview', 'sql-indexes-deep'],
    sections: [
      s(
        'compound',
        'Compound indexes',
        `Prefix rule: index {a:1,b:1} supports queries on a and on a+b, not efficiently on b alone.`,
      ),
      s(
        'esr',
        'Equality, Sort, Range',
        `Order index fields: equality filters first, then sort fields, then range — for selective compound indexes.`,
      ),
    ],
  },
  {
    id: 'mongo-schema-design',
    category: 'MongoDB',
    tags: ['embedding', 'reference', 'modeling'],
    title: 'Embedding vs referencing',
    summary: 'Document modeling trade-offs.',
    seeAlso: ['concepts-normalization-deep', 'mongo-dot-deep'],
    sections: [
      s(
        'embed',
        'When to embed',
        `One-to-few, read-together data (address on user). Bounded growth.`,
      ),
      s(
        'ref',
        'When to reference',
        `Many-to-many, large unbounded arrays, shared entities updated independently.`,
      ),
    ],
  },
  {
    id: 'mongo-objectid',
    category: 'MongoDB',
    tags: ['_id', 'ObjectId'],
    title: '_id & ObjectId',
    summary: 'Default primary key type and uniqueness.',
    seeAlso: ['mongo-find-overview'],
    sections: [
      s(
        'objectid',
        'ObjectId',
        `12-byte value with timestamp + randomness. Monotonic-ish in time; don’t assume global ordering across shards for business logic.`,
      ),
    ],
  },
  {
    id: 'mongo-comparison-sql',
    category: 'MongoDB',
    tags: ['sql', 'mental-model'],
    title: 'MongoDB vs SQL mental model',
    summary: 'How to translate ideas between relational rows and documents.',
    seeAlso: ['mongo-find-overview', 'sql-select-from-deep'],
    sections: [
      s(
        'collections',
        'Collections & tables',
        `Collection ≈ table without enforced schema. Document ≈ row. Embedded array ≈ pre-joined one-to-many (denormalized).`,
      ),
      s(
        'join-cost',
        'Join cost',
        `SQL normalizes then joins. Mongo often embeds to avoid joins at read time — at cost of duplication and update complexity.`,
      ),
    ],
  },
  {
    id: 'mongo-transactions-overview',
    category: 'MongoDB',
    tags: ['transaction', 'replica'],
    title: 'Multi-document transactions (overview)',
    summary: 'When they exist and when to avoid them.',
    seeAlso: ['acid-deep', 'mongo-schema-design'],
    sections: [
      s(
        'when',
        'When available',
        `On replica sets (MongoDB 4.0+). Single-document atomicity is always there; multi-doc transactions add latency and contention.`,
      ),
      s(
        'design',
        'Design first',
        `Prefer atomic single-document updates or idempotent operations over distributed transactions when possible.`,
      ),
    ],
  },
];
