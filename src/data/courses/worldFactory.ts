import type { Level, World } from './types';
import { solutionHints } from './levelHints';

type Drill = Omit<Level, 'id' | 'worldId' | 'levelNumber' | 'hints'> & {
  hints?: Level['hints'];
};

export function buildWorld(
  meta: Pick<
    World,
    | 'id'
    | 'name'
    | 'subtitle'
    | 'theme'
    | 'description'
    | 'database'
    | 'icon'
    | 'color'
    | 'prerequisites'
  >,
  drills: Drill[],
): World {
  return {
    ...meta,
    levels: drills.map((d, i) => {
      const n = i + 1;
      return {
        ...d,
        id: `${meta.id}-${n}`,
        worldId: meta.id,
        levelNumber: n,
        hints: d.hints ?? solutionHints(),
      };
    }),
  };
}
