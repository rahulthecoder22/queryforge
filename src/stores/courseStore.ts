import { create } from 'zustand';
import { getQueryForge } from '@/lib/electron';
import { bumpActivity, defaultPlayerStats, type PlayerStats } from '@/lib/playerStats';

const LS_KEY = 'queryforge-progress-v2';

export interface CourseProgressFile {
  totalXP: number;
  levelsCompleted: Record<string, { completed: boolean; stars: number; completedAt?: string }>;
  stats: PlayerStats;
  /** Bump when adding fields so migrations stay obvious */
  schemaVersion?: number;
}

interface CourseState extends CourseProgressFile {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  save: () => Promise<void>;
  touchSession: () => void;
  addXP: (n: number) => void;
  completeLevel: (levelId: string, stars: number, xpReward?: number) => void;
  recordQueryRun: () => void;
  recordDocumentQuery: () => void;
}

function parseProgress(raw: unknown): Partial<CourseProgressFile> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const totalXP = typeof o.totalXP === 'number' ? o.totalXP : 0;
  const levelsCompleted =
    o.levelsCompleted && typeof o.levelsCompleted === 'object' && !Array.isArray(o.levelsCompleted)
      ? (o.levelsCompleted as CourseState['levelsCompleted'])
      : {};
  let stats = defaultPlayerStats();
  if (o.stats && typeof o.stats === 'object' && !Array.isArray(o.stats)) {
    const s = o.stats as Record<string, unknown>;
    stats = {
      queryRunsTotal: typeof s.queryRunsTotal === 'number' ? s.queryRunsTotal : 0,
      documentQueriesTotal: typeof s.documentQueriesTotal === 'number' ? s.documentQueriesTotal : 0,
      lastActiveDate: typeof s.lastActiveDate === 'string' ? s.lastActiveDate : '',
      streakDays: typeof s.streakDays === 'number' ? s.streakDays : 0,
    };
  }
  return { totalXP, levelsCompleted, stats, schemaVersion: 2 };
}

const defaultProgress = (): CourseProgressFile => ({
  totalXP: 0,
  levelsCompleted: {},
  stats: defaultPlayerStats(),
  schemaVersion: 2,
});

export const useCourseStore = create<CourseState>((set, get) => ({
  ...defaultProgress(),
  hydrated: false,
  hydrate: async () => {
    const qf = getQueryForge();
    let raw: unknown = null;
    if (qf) {
      raw = await qf.course.getProgress();
    } else {
      try {
        const s = localStorage.getItem(LS_KEY);
        raw = s ? JSON.parse(s) : null;
      } catch {
        raw = null;
      }
    }
    const parsed = parseProgress(raw);
    if (parsed) {
      set({
        totalXP: parsed.totalXP ?? 0,
        levelsCompleted: parsed.levelsCompleted ?? {},
        stats: parsed.stats ?? defaultPlayerStats(),
        hydrated: true,
      });
    } else {
      set({ ...defaultProgress(), hydrated: true });
    }
  },
  save: async () => {
    const qf = getQueryForge();
    const { totalXP, levelsCompleted, stats } = get();
    const payload: CourseProgressFile = {
      totalXP,
      levelsCompleted,
      stats,
      schemaVersion: 2,
    };
    if (qf) {
      await qf.course.saveProgress(payload);
    } else {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(payload));
      } catch {
        /* ignore quota */
      }
    }
  },
  touchSession: () => {
    const before = get().stats;
    const next = bumpActivity(before);
    if (next !== before) {
      set({ stats: next });
      void get().save();
    }
  },
  addXP: (n) => {
    set((s) => ({ totalXP: s.totalXP + n, stats: bumpActivity(s.stats) }));
    void get().save();
  },
  completeLevel: (levelId, stars, xpReward = 0) => {
    set((s) => ({
      totalXP: s.totalXP + xpReward,
      stats: bumpActivity(s.stats),
      levelsCompleted: {
        ...s.levelsCompleted,
        [levelId]: {
          completed: true,
          stars: Math.max(stars, s.levelsCompleted[levelId]?.stars ?? 0),
          completedAt: new Date().toISOString(),
        },
      },
    }));
    void get().save();
  },
  recordQueryRun: () => {
    set((s) => {
      const stats = bumpActivity(s.stats);
      return { stats: { ...stats, queryRunsTotal: stats.queryRunsTotal + 1 } };
    });
    void get().save();
  },
  recordDocumentQuery: () => {
    set((s) => {
      const stats = bumpActivity(s.stats);
      return {
        stats: { ...stats, documentQueriesTotal: stats.documentQueriesTotal + 1 },
      };
    });
    void get().save();
  },
}));
