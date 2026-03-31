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
    summary:
      'MongoDB stores BSON documents: ordered fields, nested objects, arrays, and typed values. find() and aggregation $match use the same filter document shape: top-level keys are ANDed together, operators live in inner documents. This article explains paths, types, equality matching, and how QueryForge’s local matcher relates to a real server.',
    seeAlso: ['mongo-operators-reference', 'mongo-comparison-sql', 'mongo-dot-deep'],
    sections: [
      s(
        'documents',
        'Documents, collections, and _id',
        `A document is a set of field/value pairs. Unlike relational rows, documents in one collection can have different fields (schema-on-read). _id is immutable, unique within a collection, and indexed by default; if omitted on insert, the server generates an ObjectId.

BSON types matter: NumberInt vs NumberLong, Date, Decimal128, ObjectId, BinData, regex. Comparisons use BSON type ordering when types differ (e.g. null vs missing vs empty string are distinct states in strict mode). In application code, always store one canonical type per field to avoid “same value, different type” bugs.`,
      ),
      s(
        'filter',
        'Filter document semantics',
        `A query filter is a document. { status: "open", qty: { $gt: 0 } } means status must equal "open" AND qty must be greater than 0. There is implicit AND at the top level; explicit $and is for combining operator documents on the same path or repeating keys.

Field paths use dot notation for nesting (profile.city) and numeric indexes for arrays (tags.0). Missing fields evaluate false for equality to a literal unless you use $exists or $type to distinguish “field absent” from “field null.”`,
      ),
      s(
        'qf',
        'QueryForge local matching',
        `The Mongo course runs filters against in-memory JSON arrays without a MongoDB server. Supported operators are a documented subset; behavior is designed to mirror common interview and tutorial patterns. When you move to Atlas or mongosh, enable Compass explain plans and read concern/write concern docs for production semantics.`,
        `db.orders.find({ status: "paid", "customer.tier": "gold" })`,
      ),
    ],
  },
  {
    id: 'mongo-operators-reference',
    category: 'MongoDB',
    tags: ['operators', 'reference', '$in', '$gt'],
    title: 'Query operators (deep reference)',
    summary:
      'Field operators ($gt, $in, $regex, …), element operators ($exists, $type), logical operators ($and, $or, $nor, $not), array operators ($all, $elemMatch, $size), and evaluation operators ($mod, $regex, $where caution). Includes MongoDB vs SQL mental map and NULL/missing edge cases.',
    seeAlso: ['mongo-find-overview', 'mongo-elem-deep', 'sql-where-deep'],
    sections: [
      s(
        'comparison',
        'Comparison and element',
        `• $eq / $ne — equality and inequality; $ne matches documents where field is missing or different.

• $gt, $gte, $lt, $lte — lexicographic for strings, numeric for numbers, chronological for dates.

• $in / $nin — membership in an array of values; $in on array fields matches if any element matches (unless combined with operators that change semantics).

• $exists: true requires the field present; false matches missing or null depending on version and index—test explicitly.

• $type matches BSON type number or alias string ("string", "double", …).`,
      ),
      s(
        'logical',
        'Logical operators',
        `$and, $or, $nor take arrays of subdocuments. $not negates an operator expression on a single path. Precedence: implicit AND binds tighter than explicit $or unless you nest.

Deep nesting hurts readability—prefer aggregation $match with $expr for complex boolean logic, or build filters in code with clear structure.`,
      ),
      s(
        'array',
        'Array operators',
        `$all requires the array field contain all listed elements (unordered). $size matches exact array length (cannot combine with range directly—use $expr + $size). $elemMatch requires a single array element satisfy all sub-predicates (critical for line-item matching).

$regex matches string fields; index usage requires case-insensitive and anchored patterns to be compatible with text indexes or collations.`,
      ),
      s(
        'expr',
        '$expr and aggregation context',
        `In find(), $expr allows aggregation expressions (field references with $, comparisons across fields). It cannot use indexes as flexibly as simple range predicates—profile with explain.

In aggregation, $match stages before heavy $lookup/$group reduce working set size—same performance instinct as selective WHERE in SQL.`,
      ),
    ],
  },
  {
    id: 'mongo-elem-deep',
    category: 'MongoDB',
    tags: ['elemMatch', 'array', 'line-items'],
    title: '$elemMatch in depth',
    summary:
      'Without $elemMatch, multiple predicates on different array indices can combine incorrectly. This article walks through the failure mode, the fix, negation patterns, and aggregation equivalents.',
    seeAlso: ['mongo-operators-reference', 'visual-mongo-match', 'mongo-dot-deep'],
    sections: [
      s(
        'problem',
        'The cross-product mistake',
        `Document: { lines: [ { sku: "A", qty: 1 }, { sku: "B", qty: 5 } ] }.

Filter: { "lines.sku": "A", "lines.qty": { $gte: 5 } }. The server matches if there exists any array index with sku A and any (possibly different) index with qty ≥ 5. That is true here (A at index 0, B’s qty at index 1), even though no single line has sku A and qty ≥ 5.

This is logically an existential quantifier over array elements; plain dot notation does not bind predicates to the same element.`,
      ),
      s(
        'solution',
        'The $elemMatch fix',
        `$elemMatch takes one object that must all hold for a single array element:

{ lines: { $elemMatch: { sku: "A", qty: { $gte: 5 } } } }

Now only a line that is both A and high-qty satisfies the business rule.`,
        `{ "lines": { "$elemMatch": { "sku": "A", "qty": { "$gte": 5 } } } }`,
      ),
      s(
        'negation',
        'Negation and “no line matches”',
        `“No line item with sku A” is not simply NOT $elemMatch in all cases—consider documents with no lines array. Combine $exists, $size, and $not carefully. For complex rules, aggregation with $filter + $size may read clearer than dense $nor trees.`,
      ),
    ],
  },
  {
    id: 'mongo-dot-deep',
    category: 'MongoDB',
    tags: ['dot-notation', 'nested'],
    title: 'Dot notation & embedded documents',
    summary:
      'Field paths traverse objects and arrays. This article covers array indexing, optional chaining semantics in queries, $ positional updates, and when to model nested data vs separate collections.',
    seeAlso: ['mongo-find-overview', 'mongo-schema-design'],
    sections: [
      s(
        'embed',
        'Embedded objects',
        `address.street matches { address: { street: "Main", zip: "94102" } }. If address is missing, the path is undefined; comparisons typically fail to match unless operator explicitly handles absence.

For optional deeply nested fields, $exists on the parent may be cheaper than repeating long paths.`,
      ),
      s(
        'array-index',
        'Array indices and ordering',
        `tags.0 is the first element; tags.1 the second. Useful for “non-empty array” as { "tags.0": { $exists: true } }. Order-dependent logic is fragile if the app reorders arrays—prefer semantic queries ($size, $elemMatch) when possible.

Multi-key updates use positional $ operator or filtered positional $[identifier] with arrayFilters in updates—read server docs for your version.`,
      ),
      s(
        'arrays',
        'Arrays of subdocuments vs ids',
        `Embedding full subdocuments duplicates data but avoids joins. Storing only ObjectId references normalizes like SQL foreign keys but requires $lookup or second queries. Choose based on read/write ratio and document size limits (16MB max BSON).`,
      ),
    ],
  },
  {
    id: 'mongo-aggregation-intro',
    category: 'MongoDB',
    tags: ['aggregation', 'pipeline', '$match'],
    title: 'Aggregation pipeline (comprehensive overview)',
    summary:
      'A pipeline is an ordered sequence of stages transforming a stream of documents. This article maps stages to SQL, discusses optimization (match/project early), variables ($$ROOT, $$NOW), and when to use find vs aggregate.',
    seeAlso: ['mongo-group-stage', 'mongo-lookup-concept', 'sql-group-having-deep'],
    sections: [
      s(
        'stages',
        'Core stages',
        `• $match — filter (use indexes like find; place early).

• $project / $set / $addFields — shape documents, compute fields.

• $group — aggregate; _id is group key; accumulators $sum, $avg, $first, $push, etc.

• $sort — ordering; memory limit applies unless index supports sort.

• $limit / $skip — pagination; $skip large values is expensive like SQL OFFSET.

• $lookup — left outer join to another collection.

• $unwind — deconstruct arrays into one doc per element.

• $facet — run multiple sub-pipelines (dashboards).

• $merge / $out — write results to collection (ETL).`,
      ),
      s(
        'sql-map',
        'SQL analogy (imperfect but useful)',
        `$match ≈ WHERE. $group ≈ GROUP BY. $lookup + $unwind ≈ JOIN. $project ≈ SELECT list. $sort ≈ ORDER BY. $limit ≈ LIMIT. $skip ≈ OFFSET.

There is no universal HAVING—use $match after $group. Window-like operations use $setWindowFields (MongoDB 5+).`,
      ),
      s(
        'optimize',
        'Performance habits',
        `Narrow with $match and indexed fields first. Avoid unnecessary $project before $group if you need many fields for grouping. AllowDiskUse for large sorts when required. Explain plans in Compass or .explain("executionStats").`,
      ),
    ],
  },
  {
    id: 'mongo-group-stage',
    category: 'MongoDB',
    tags: ['$group', 'accumulator'],
    title: 'The $group stage (deep dive)',
    summary:
      'Grouping keys, compound _id objects, accumulators, grouping everything ($$ROOT), and pitfalls with missing fields and memory limits.',
    seeAlso: ['mongo-aggregation-intro', 'sql-group-having-deep'],
    sections: [
      s(
        '_id',
        'The _id field as group key',
        `_id can be a field path string ("$country"), null (single global group), or an object for compound keys: { y: { $year: "$orderDate" }, cat: "$category" }.

Every incoming document must produce a BSON-comparable group key; nulls and missing fields bucket together per aggregation rules.`,
      ),
      s(
        'accum',
        'Accumulators',
        `$sum, $avg, $max, $min ignore non-numeric or null depending on expression—wrap with $ifNull for explicit zero behavior. $push builds arrays (watch memory). $addToSet deduplicates. $first / $last depend on prior $sort for deterministic results.

Counting documents: { n: { $sum: 1 } } is idiomatic.`,
        `{ $group: { _id: "$country", revenue: { $sum: "$amount" }, orders: { $sum: 1 } } }`,
      ),
      s(
        'after',
        'Post-group filtering',
        `Use $match after $group to emulate HAVING. For ratios, chain $project to divide sums. For top-N per group, use $sort + $group with $first or window functions in modern MongoDB.`,
      ),
    ],
  },
  {
    id: 'mongo-lookup-concept',
    category: 'MongoDB',
    tags: ['$lookup', 'join'],
    title: '$lookup: joins in the pipeline',
    summary:
      'Syntax variants (equality join, correlated subquery pipeline), join order, index requirements on the foreign collection, and unwinding vs preserving arrays.',
    seeAlso: ['mongo-aggregation-intro', 'sql-joins-deep', 'sql-left-join-deep'],
    sections: [
      s(
        'shape',
        'What $lookup returns',
        `Classic form adds a field whose value is an array of all matching documents from the foreign collection (like a left outer join where the right side is bundled as an array). If no matches, field is empty array.

$unwind with preserveNullAndEmptyArrays: false drops non-matches; true keeps outer rows with empty arrays (often after $addFields default).`,
      ),
      s(
        'pipeline',
        'Pipeline form (correlated)',
        `Newer $lookup lets you run a sub-pipeline on the foreign collection with variables from the local document—expresses selective joins and pre-filtering foreign rows before join. This is powerful but easier to mis-index; always explain.

Match foreign keys to indexed fields on the joined collection for scale.`,
      ),
      s(
        'denorm',
        'When not to $lookup',
        `If you always fetch parent + children together read-heavy, embedding may outperform join-heavy pipelines. If data is huge and access patterns are selective, referencing + $lookup wins.`,
      ),
    ],
  },
  {
    id: 'mongo-indexes-concept',
    category: 'MongoDB',
    tags: ['index', 'esr', 'performance'],
    title: 'Indexes in MongoDB (design guide)',
    summary:
      'Single-field, compound, multikey (array), text, geospatial, and partial indexes. Prefix rules, covered queries, ESR ordering, and collation/index intersection caveats.',
    seeAlso: ['mongo-find-overview', 'sql-indexes-deep'],
    sections: [
      s(
        'compound',
        'Compound indexes and prefix rule',
        `Index { a: 1, b: 1, c: 1 } supports queries filtering on a; on a+b; on a+b+c efficiently. It does not support filtering on b alone or c alone with the same index order.

Multikey indexes (array fields) cannot cover certain compound orderings with multiple array fields—server limits apply.`,
      ),
      s(
        'esr',
        'Equality, Sort, Range (ESR)',
        `Order compound index keys: equality predicates first, then sort keys, then range predicates. Example: find({ status: "open", region: "EU" }) sort({ created: -1 }) with range on created might use { status:1, region:1, created:-1 } depending on selectivity.

Profile with explain; cardinality of equality fields matters.`,
      ),
      s(
        'partial',
        'Partial and sparse indexes',
        `Index only documents matching a filter (e.g. active: true) to save space and speed hot queries. Sparse indexes skip documents missing the field—different from partial which uses a predicate document.`,
      ),
    ],
  },
  {
    id: 'mongo-schema-design',
    category: 'MongoDB',
    tags: ['embedding', 'reference', 'modeling'],
    title: 'Embedding vs referencing (schema design)',
    summary:
      'Modeling one-to-one, one-to-many, many-to-many in documents: bounded vs unbounded growth, write atomicity, fan-out on read vs write, and anti-patterns (unbounded arrays, mega-documents).',
    seeAlso: ['concepts-normalization-deep', 'mongo-dot-deep', 'mongo-transactions-overview'],
    sections: [
      s(
        'embed',
        'When embedding wins',
        `Data is read together, updated together, bounded in size (dozens not millions of subdocuments), and benefits from single-document atomic updates. Examples: user preferences object, shipment address snapshot on an order.

MongoDB 16MB document limit is a hard ceiling—model unbounded collections as separate documents with references.`,
      ),
      s(
        'ref',
        'When referencing wins',
        `Shared entities updated independently (author profile referenced by many posts). Many-to-many with large cardinality. Need partial updates without rewriting parent document. Need consistent reporting across aggregates without loading parents.

Pattern: store ObjectId + denormalize display fields you need for lists; accept eventual consistency or use transactions to update both sides.`,
      ),
      s(
        'hybrid',
        'Hybrid and bucketing',
        `Time-series bucketing: one document per hour with embedded measurements array. Parent with first N embedded + “overflow” collection for archival. These patterns optimize hot paths while controlling document growth.`,
      ),
    ],
  },
  {
    id: 'mongo-objectid',
    category: 'MongoDB',
    tags: ['_id', 'ObjectId'],
    title: '_id, ObjectId, and UUID strategies',
    summary:
      'Default ObjectId structure (timestamp, random, counter), monotonic insert hotspots, ULID/UUID v4/v7 tradeoffs, shard key considerations, and application-generated ids.',
    seeAlso: ['mongo-find-overview', 'mongo-schema-design'],
    sections: [
      s(
        'objectid',
        'ObjectId structure',
        `12 bytes: 4-byte unix seconds (big-endian), 5-byte random, 3-byte counter starting random per process. Roughly increasing sort by creation time but not a guaranteed global sequence across shards.

Do not embed business meaning in ObjectId. Use separate fields for tenant_id, order_number, etc.`,
      ),
      s(
        'hotspot',
        'Insert hotspots',
        `Monotonic _id on a single shard key can bottleneck one chunk in a sharded cluster—consider hashed shard keys or UUIDs with good entropy distribution (v4) or time-ordered UUIDs (v7) per MongoDB guidance.`,
      ),
      s(
        'uuid',
        'UUIDs and custom _id',
        `You may set _id to string UUID. Storage is larger than ObjectId; index B-trees grow. Ensure uniqueness generation in the app (collision-resistant).`,
      ),
    ],
  },
  {
    id: 'mongo-comparison-sql',
    category: 'MongoDB',
    tags: ['sql', 'mental-model'],
    title: 'MongoDB vs SQL mental model',
    summary:
      'Collections vs tables, flexible schema vs constraints, joins vs embeds, transactions, consistency levels, and how to interview in either stack.',
    seeAlso: ['mongo-find-overview', 'sql-select-from-deep', 'acid-deep'],
    sections: [
      s(
        'collections',
        'Collections & tables',
        `A collection is a bag of documents; SQL table is a bag of rows conforming to a schema. Indexes exist in both; uniqueness via unique indexes mirrors UNIQUE constraints.

SQL JOIN is explicit per query; Mongo often pre-joins via embedding or pays $lookup cost per aggregation.`,
      ),
      s(
        'schema',
        'Schema enforcement',
        `MongoDB Atlas and recent server versions support JSON Schema validation on collections—optional but valuable for production. Without it, application validation is mandatory.

SQL NOT NULL / FK / CHECK enforce at write time in the engine—different operational culture.`,
      ),
      s(
        'query',
        'Query style',
        `SQL declarative single statement; Mongo find simple, aggregation programmatic with stages. Both need explain plans, index discipline, and pagination discipline (cursor-based preferred at scale).`,
      ),
    ],
  },
  {
    id: 'mongo-transactions-overview',
    category: 'MongoDB',
    tags: ['transaction', 'replica'],
    title: 'Multi-document transactions (deep overview)',
    summary:
      'Replica-set transactions, snapshot read concern, write concern majority, timeouts, oplog growth, interaction with retryable writes, and design patterns that avoid transactions.',
    seeAlso: ['acid-deep', 'mongo-schema-design', 'isolation-levels'],
    sections: [
      s(
        'when',
        'When they exist',
        `Multi-document ACID transactions require replica set deployment (even single-node RS for dev). Sharded cluster transactions involve two-phase commit across shards—higher latency and operational limits (document count, time).

Single-document updates are always atomic for embedded arrays and subdocuments—prefer this boundary when possible.`,
      ),
      s(
        'concern',
        'Read and write concern',
        `Transactions pair with read concern snapshot and write concern majority for typical ACID expectations. Local read concern may read uncommitted outside snapshot rules—understand defaults in your driver.

TransientTransactionError labels retryable conflicts; UnknownTransactionCommitResult requires idempotent retry logic.`,
      ),
      s(
        'design',
        'Design to minimize transactions',
        `Idempotent commands with request IDs, compensating sagas, single-document state machines, and embedding related counters reduce cross-document coordination. Use transactions for invariants that truly span documents (account debit/credit pairs).`,
      ),
    ],
  },
];
