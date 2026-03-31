import type { World } from './types';
import { world01 } from './worlds/world01';
import { world02 } from './worlds/world02';
import { world03, world04 } from './worlds/worldsRest';
import {
  world05,
  world06,
  world07,
  world08,
  world09,
  world10,
  world11,
  world12,
} from './worlds/worlds512';
import { world13 } from './worlds/world13';
import { world14 } from './worlds/world14';
import { world31WindowLab } from './worlds/world31WindowLab';
import { worldsUniformIndustries } from './worlds/worldsUniformIndustries';

export const worlds: World[] = [
  world01,
  world02,
  world03,
  world04,
  world05,
  world06,
  world07,
  world08,
  world09,
  world10,
  world11,
  world12,
  world13,
  world14,
  world31WindowLab,
  ...worldsUniformIndustries,
];

export function getWorld(id: number): World | undefined {
  return worlds.find((w) => w.id === id);
}

export function getLevel(levelId: string): { world: World; level: import('./types').Level } | undefined {
  for (const w of worlds) {
    const level = w.levels.find((l) => l.id === levelId);
    if (level) return { world: w, level };
  }
  return undefined;
}

/** Next level in the same world, or the first level of the next world; null if none. */
export function getNextLevelId(levelId: string): string | null {
  const found = getLevel(levelId);
  if (!found) return null;
  const { world } = found;
  const idx = world.levels.findIndex((l) => l.id === levelId);
  if (idx >= 0 && idx < world.levels.length - 1) {
    return world.levels[idx + 1]!.id;
  }
  const worldIdx = worlds.findIndex((w) => w.id === world.id);
  if (worldIdx >= 0 && worldIdx < worlds.length - 1) {
    const nextWorld = worlds[worldIdx + 1]!;
    return nextWorld.levels[0]?.id ?? null;
  }
  return null;
}

export type { World, Level } from './types';
