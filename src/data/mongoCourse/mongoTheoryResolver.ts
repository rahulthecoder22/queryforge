import type { LessonTheory, TheoryVisualId } from '@/data/lessonTheory/types';
import type { MongoLevel } from './types';

const T = (
  visualId: TheoryVisualId,
  sections: LessonTheory['sections'],
  checklist?: string[],
): LessonTheory => ({
  eyebrow: 'Read this first',
  sections,
  visualId,
  checklist,
});

const library: Record<string, LessonTheory> = {
  boolean: T(
    'mongo-boolean',
    [
      {
        heading: 'What a filter is',
        body: 'A MongoDB-style filter is one JSON object. Each key is a field path on the document; the value is either a literal (shorthand for equality) or an operator object like {"$gte": 10}.',
      },
      {
        heading: 'Booleans',
        body: 'true and false are lowercase JSON booleans — not strings. Matching remote workers means the field remote must be exactly true.',
        codeExample: '{ "remote": true }',
      },
    ],
    ['Name the field on the sample doc', 'Use true/false without quotes'],
  ),

  stringEq: T(
    'mongo-string-eq',
    [
      {
        heading: 'String equality',
        body: 'When the value is a string in double quotes, you are testing exact equality on that field. Case and spelling must match the document.',
        codeExample: '{ "role": "engineer" }',
      },
    ],
    ['Find the field name in the JSON', 'Match the string exactly'],
  ),

  inArray: T(
    'mongo-in-array',
    [
      {
        heading: 'Scalar vs array fields',
        body: 'If the field holds an array (e.g. skills), a plain equality only works if the whole array matches. Usually you want “array contains value” — use $in with a one-element array.',
      },
      {
        heading: '$in on arrays',
        body: 'Here $in means: “does this array field contain at least one of these values?”',
        codeExample: '{ "skills": { "$in": ["sql"] } }',
      },
    ],
    ['Is the field an array in the sample doc?', 'Wrap the value in $in: [ ... ]'],
  ),

  gte: T(
    'mongo-compare',
    [
      {
        heading: 'Comparison operators',
        body: 'Use $gt, $gte, $lt, $lte on numbers (and some drivers on dates). The field maps to an object whose keys are operators.',
        codeExample: '{ "tenureMonths": { "$gte": 36 } }',
      },
    ],
    ['Confirm the field is numeric in the data', 'Pick the right operator (≥ vs >)'],
  ),

  dotPath: T(
    'mongo-dot',
    [
      {
        heading: 'Nested fields',
        body: 'Dot paths walk into embedded objects: meta.office reads doc.meta.office. You still write one flat key string in the filter.',
        codeExample: '{ "meta.office": "NYC" }',
      },
    ],
    ['Open the meta object in the sample', 'Join parent.child with a dot in the key'],
  ),

  or: T(
    'mongo-or',
    [
      {
        heading: '$or',
        body: '$or takes an array of full filter objects. A document matches if any branch matches. Each branch should be a complete object.',
        codeExample: '{ "$or": [ { "role": "engineer" }, { "role": "data" } ] }',
      },
    ],
    ['Write one object per allowed value', 'Wrap them in "$or": [ ... ]'],
  ),

  andImplicit: T(
    'mongo-and-implicit',
    [
      {
        heading: 'Implicit AND',
        body: 'Multiple keys at the same level are AND-ed together. level and salaryBand together mean both must hold.',
        codeExample: '{ "level": "senior", "salaryBand": 5 }',
      },
    ],
    ['List every required field as its own key', 'Use one object, not multiple filters'],
  ),

  elemMatch: T(
    'mongo-elem',
    [
      {
        heading: 'Why $elemMatch',
        body: 'When conditions must apply to the same element inside an array (e.g. same line item), use $elemMatch. Otherwise Mongo may match conditions on different array elements.',
      },
      {
        heading: 'Shape',
        body: 'Pass one object describing the sub-document to find inside the array.',
        codeExample: '{ "lines": { "$elemMatch": { "sku": "X", "qty": { "$gte": 2 } } } }',
      },
    ],
    ['Identify the array field (e.g. lines)', 'Put all line conditions inside one $elemMatch'],
  ),

  exists: T(
    'mongo-exists',
    [
      {
        heading: '$exists on array indices',
        body: 'certs.0 means “first array element”. {"$exists": true} means that path is present. For “has any cert”, certs.0 existing is enough for non-empty arrays.',
        codeExample: '{ "certs.0": { "$exists": true } }',
      },
    ],
    ['Empty array has no index 0', 'Use exists true / false deliberately'],
  ),

  ne: T(
    'mongo-ne',
    [
      {
        heading: '$ne',
        body: 'Not equal. Useful for excluding one status or region while combining with other keys.',
        codeExample: '{ "status": { "$ne": "cancelled" } }',
      },
    ],
    ['Combine with other fields for AND', 'Remember strings stay quoted'],
  ),

  nin: T(
    'mongo-nin',
    [
      {
        heading: '$nin',
        body: 'None of the listed values may appear (for scalars) or overlap (for array fields, depending on engine — here: array must not contain any listed value).',
        codeExample: '{ "skills": { "$nin": ["python"] } }',
      },
    ],
    ['Pair with other predicates for AND', 'Often used with $and when the same field needs $in and $nin'],
  ),

  compound: T(
    'mongo-compound',
    [
      {
        heading: 'Layering logic',
        body: 'Combine $and and $or: build each piece as a full object, then nest. When the same field needs two different operators, $and two sub-objects for that field.',
      },
    ],
    ['Sketch truth table on paper', 'Test with Run filter after each clause'],
  ),
};

function byConcept(concept: string): LessonTheory | null {
  const c = concept.toLowerCase();

  if (c.includes('boolean')) return library.boolean;
  if (c.includes('string equality') || c.includes('string field')) return library.stringEq;
  if (c.includes('$in') || c.includes('in array')) return library.inArray;
  if (c.includes('$gte') || c.includes('$lte') || c.includes('$gt') || c.includes('$lt') || c.includes('compare'))
    return library.gte;
  if (c.includes('dot path') || c.includes('dot')) return library.dotPath;
  if (c.includes('$or')) return library.or;
  if (c.includes('$and implicit')) return library.andImplicit;
  if (c.includes('$and')) return library.compound;
  if (c.includes('implicit')) return library.andImplicit;
  if (c.includes('$elem')) return library.elemMatch;
  if (c.includes('$exists') || c.includes('exists')) return library.exists;
  if (c.includes('$ne') || c.includes('$nin')) return c.includes('nin') ? library.nin : library.ne;
  if (c.includes('triple') || c.includes('compound') || c.includes('composition') || c.includes('multi-field'))
    return library.compound;
  if (c.includes('equality')) return library.stringEq;
  if (c.includes('string on root') || c === 'equality') return library.stringEq;
  if (c.includes('$gte number')) return library.gte;

  return null;
}

export function resolveMongoTheory(level: Pick<MongoLevel, 'concept' | 'theory'>): LessonTheory {
  if (level.theory) return level.theory;
  const hit = byConcept(level.concept);
  if (hit) return hit;

  return {
    eyebrow: 'Read this first',
    title: level.concept,
    visualId: 'none',
    sections: [
      {
        heading: 'How filters compose',
        body: `This level tags the idea: “${level.concept}”. In QueryForge, one JSON object is one filter. Keys are field paths; values are literals or operator objects ($gt, $in, $or, …). Multiple top-level keys combine with AND.`,
      },
      {
        heading: 'Workflow',
        body: '1) Find the fields you need on the sample document. 2) Write the smallest filter that could work. 3) Run filter and count docs. 4) Tighten until the story matches.',
      },
    ],
    checklist: ['Match field names exactly', 'Use Run filter before Check answer'],
  };
}
