export interface PlayerStats {
  queryRunsTotal: number;
  documentQueriesTotal: number;
  lastActiveDate: string;
  streakDays: number;
}

export const defaultPlayerStats = (): PlayerStats => ({
  queryRunsTotal: 0,
  documentQueriesTotal: 0,
  lastActiveDate: '',
  streakDays: 0,
});

/** Local calendar date YYYY-MM-DD */
export function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function previousLocalDate(key: string): string {
  const [y, mo, da] = key.split('-').map(Number);
  const d = new Date(y, mo - 1, da);
  d.setDate(d.getDate() - 1);
  return localDateKey(d);
}

/** Update streak when user is active today (idempotent same day). */
export function bumpActivity(stats: PlayerStats): PlayerStats {
  const today = localDateKey();
  if (stats.lastActiveDate === today) {
    return stats;
  }
  let streak = 1;
  if (stats.lastActiveDate === previousLocalDate(today)) {
    streak = Math.max(1, stats.streakDays + 1);
  }
  return {
    ...stats,
    lastActiveDate: today,
    streakDays: streak,
  };
}
