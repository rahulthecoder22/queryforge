import { getLevel, worlds } from './index';

/** All worlds are open — learners can jump to any level. */
export function isWorldUnlocked(
  _prerequisites: number[],
  _levelsCompleted: Record<string, { completed?: boolean } | undefined>,
): boolean {
  return true;
}

/** All levels are open when the level exists in the SQL course. */
export function isLevelUnlocked(
  levelId: string,
  _levelsCompleted: Record<string, { completed?: boolean } | undefined>,
): boolean {
  return getLevel(levelId) !== undefined;
}

export function worldFullyComplete(
  worldId: number,
  levelsCompleted: Record<string, { completed?: boolean } | undefined>,
): boolean {
  const w = worlds.find((x) => x.id === worldId);
  if (!w) return false;
  return w.levels.every((l) => levelsCompleted[l.id]?.completed);
}
