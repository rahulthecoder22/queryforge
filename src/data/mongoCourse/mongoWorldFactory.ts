import type { HintTier } from '@/data/courses/types';
import type { MongoLevel, MongoWorld } from './types';

function mongoHints(expectedFilter: string): HintTier[] {
  return [
    {
      tier: 1,
      cost: 0,
      headline: 'Parse the task',
      content:
        'List each condition (field, operator, value). Decide if it is root field, dot path, or inside an array (→ $elemMatch).',
    },
    {
      tier: 2,
      cost: 8,
      headline: 'JSON shape',
      content:
        'One top-level object. String keys in double quotes. Comparison ops live in sub-objects: {"tenureMonths": {"$gte": 24}}.',
    },
    {
      tier: 3,
      cost: 14,
      headline: 'Combine logic',
      content:
        'Multiple keys on one object = AND. For OR use {"$or": [{...},{...}]}. $in / $nin work for “any of these values” on scalars or arrays.',
    },
    {
      tier: 4,
      cost: 22,
      headline: 'Run filter first',
      content:
        'Use “Run filter” to see counts. If you match too many docs, add a missing predicate; if zero, loosen one clause at a time.',
    },
    {
      tier: 5,
      cost: 36,
      headline: 'Canonical filter',
      content: expectedFilter,
    },
  ];
}

type Drill = Omit<MongoLevel, 'id' | 'worldId' | 'levelNumber' | 'hints'> & { hints?: HintTier[] };

export function buildMongoWorld(
  meta: Pick<MongoWorld, 'id' | 'name' | 'subtitle' | 'description' | 'icon' | 'color'>,
  drills: Drill[],
): MongoWorld {
  return {
    ...meta,
    levels: drills.map((d, i) => {
      const n = i + 1;
      return {
        ...d,
        id: `m${meta.id}-${n}`,
        worldId: meta.id,
        levelNumber: n,
        hints: d.hints ?? mongoHints(d.expectedFilter),
      };
    }),
  };
}
