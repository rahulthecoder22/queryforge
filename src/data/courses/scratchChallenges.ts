import type { MongoLevel, MongoWorld } from '../mongoCourse/types';
import type { World } from './types';

/** Editor seed for SQL challenges — no query structure is prefilled. */
export const SCRATCH_SQL_STARTER = '-- Write your SQL from scratch.\n';

/** Editor seed for Mongo challenges — empty filter object only. */
export const SCRATCH_MONGO_STARTER = '{\n}\n';

export function withScratchSqlStarters(world: World): World {
  return {
    ...world,
    levels: world.levels.map((l) => ({ ...l, starterCode: SCRATCH_SQL_STARTER })),
  };
}

export function withScratchMongoStarters(world: MongoWorld): MongoWorld {
  return {
    ...world,
    levels: world.levels.map((l: MongoLevel) => ({ ...l, starterFilter: SCRATCH_MONGO_STARTER })),
  };
}
