import { describe, expect, it } from 'vitest';
import { filterDocuments, matchesMongoFilter } from './mongoLite';

const docs = [
  { name: 'A', age: 30, tags: ['sql'], meta: { z: 1 } },
  { name: 'B', age: 22, tags: ['nosql'], meta: { z: 2 } },
] as Record<string, unknown>[];

describe('mongoLite', () => {
  it('matches equality and operators', () => {
    expect(matchesMongoFilter(docs[0]!, { age: { $gte: 25 } })).toBe(true);
    expect(matchesMongoFilter(docs[1]!, { age: { $gte: 25 } })).toBe(false);
    expect(matchesMongoFilter(docs[0]!, { tags: { $in: ['sql'] } })).toBe(true);
  });

  it('matches dot paths and $and', () => {
    expect(matchesMongoFilter(docs[0]!, { 'meta.z': 1 })).toBe(true);
    expect(
      matchesMongoFilter(docs[1]!, {
        $and: [{ age: { $lt: 25 } }, { name: 'B' }],
      }),
    ).toBe(true);
  });

  it('filterDocuments empty query returns all', () => {
    expect(filterDocuments(docs, {}).length).toBe(2);
  });

  it('$elemMatch on array of objects', () => {
    const order = {
      _id: 'x',
      lines: [
        { sku: 'A', qty: 1 },
        { sku: 'B', qty: 5 },
      ],
    } as Record<string, unknown>;
    expect(
      matchesMongoFilter(order, {
        lines: { $elemMatch: { sku: 'B', qty: { $gte: 3 } } },
      }),
    ).toBe(true);
  });
});
