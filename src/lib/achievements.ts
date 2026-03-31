import type { World } from '@/data/courses/types';
import type { PlayerStats } from './playerStats';

export type AchievementId =
  | 'first_clear'
  | 'sql_spark'
  | 'streak_3'
  | 'world_tour'
  | 'document_path'
  | 'xp_scholar';

export interface AchievementDef {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_clear',
    title: 'First forge',
    description: 'Complete any course level.',
    icon: '🔥',
  },
  {
    id: 'sql_spark',
    title: 'Query spark',
    description: 'Run 25 SQL queries in the workspace or challenges.',
    icon: '⚡',
  },
  {
    id: 'streak_3',
    title: 'Hot streak',
    description: 'Learn on 3 different days in a row.',
    icon: '📅',
  },
  {
    id: 'world_tour',
    title: 'World tour',
    description: 'Finish every level in any single world.',
    icon: '🌍',
  },
  {
    id: 'document_path',
    title: 'Polyglot path',
    description: 'Run a find in the Document lab.',
    icon: '🧬',
  },
  {
    id: 'xp_scholar',
    title: 'Scholar',
    description: 'Earn 2,500 total XP.',
    icon: '🎓',
  },
];

function worldFullyDone(world: World, levelsCompleted: Record<string, { completed?: boolean }>): boolean {
  return world.levels.every((l) => levelsCompleted[l.id]?.completed);
}

export function unlockedAchievementIds(input: {
  totalXP: number;
  stats: PlayerStats;
  levelsCompleted: Record<string, { completed?: boolean }>;
  worlds: World[];
}): Set<AchievementId> {
  const { totalXP, stats, levelsCompleted, worlds } = input;
  const u = new Set<AchievementId>();
  const doneCount = Object.values(levelsCompleted).filter((x) => x?.completed).length;
  if (doneCount >= 1) u.add('first_clear');
  if (stats.queryRunsTotal >= 25) u.add('sql_spark');
  if (stats.streakDays >= 3) u.add('streak_3');
  if (worlds.some((w) => worldFullyDone(w, levelsCompleted))) u.add('world_tour');
  if (stats.documentQueriesTotal >= 1) u.add('document_path');
  if (totalXP >= 2500) u.add('xp_scholar');
  return u;
}

export const XP_RANKS: { min: number; title: string; flavor: string }[] = [
  { min: 0, title: 'Initiate', flavor: 'Tables await.' },
  { min: 400, title: 'Apprentice', flavor: 'Joins feel familiar.' },
  { min: 1200, title: 'Artisan', flavor: 'Aggregates bend to you.' },
  { min: 3000, title: 'Architect', flavor: 'You model reality.' },
  { min: 8000, title: 'Oracle', flavor: 'The planner whispers your name.' },
];

export function rankForXp(xp: number): { title: string; flavor: string; nextAt: number | null; progress: number } {
  let idx = 0;
  for (let i = XP_RANKS.length - 1; i >= 0; i--) {
    if (xp >= XP_RANKS[i].min) {
      idx = i;
      break;
    }
  }
  const cur = XP_RANKS[idx];
  const next = XP_RANKS[idx + 1];
  const nextAt = next ? next.min : null;
  let progress = 1;
  if (next) {
    const span = next.min - cur.min;
    progress = span > 0 ? Math.min(1, (xp - cur.min) / span) : 0;
  }
  return { title: cur.title, flavor: cur.flavor, nextAt, progress };
}
