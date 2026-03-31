import type { World } from '@/data/courses/types';

export type SqlLearnTrackId = 'foundation' | 'grind' | 'bank' | 'windows' | 'industry';

export interface SqlLearnTrack {
  id: SqlLearnTrackId;
  label: string;
  /** Short label for narrow screens */
  labelShort: string;
  eyebrow: string;
  headline: string;
  body: string;
  highlights: readonly string[];
  filter: (w: World) => boolean;
  /** Tailwind gradient for active tab / hero accents */
  tabGradient: string;
  /** Hex for decorative orbs */
  glowHex: string;
  icon: string;
}

export const SQL_LEARN_TRACKS: readonly SqlLearnTrack[] = [
  {
    id: 'foundation',
    label: 'Foundation',
    labelShort: 'Core',
    eyebrow: 'Your on-ramp',
    headline: 'From first SELECT to real queries',
    body: 'Thirteen worlds walk you through filters, joins, GROUP BY, subqueries, and set ops — each level is a tiny puzzle with hints that nudge, not spoil.',
    highlights: [
      'Boss levels lock in each arc',
      'Solve guides + tiered hints',
      'Same engine as the workspace',
    ],
    filter: (w) => w.id >= 1 && w.id <= 13,
    tabGradient: 'from-violet-500 to-fuchsia-600',
    glowHex: '#a855f7',
    icon: '◇',
  },
  {
    id: 'grind',
    label: 'SQL Grind',
    labelShort: 'Grind',
    eyebrow: 'Interview tempo',
    headline: 'Timed, constraint-heavy reps',
    body: 'One focused world of interview-shaped problems: bullet constraints, difficulty tags, and the same verify-and-run loop you will use in a live screen.',
    highlights: [
      'Easy → Hard pacing',
      'Non-spoiler hint ladder',
      'Builds speed and accuracy',
    ],
    filter: (w) => w.id === 14,
    tabGradient: 'from-amber-500 to-orange-600',
    glowHex: '#f59e0b',
    icon: '⚡',
  },
  {
    id: 'bank',
    label: 'Interview bank',
    labelShort: 'Bank',
    eyebrow: '300 drills',
    headline: 'Analytics patterns on one schema',
    body: 'Ten worlds of original Easy–Medium drills on the Summit commerce database — filters, windows-style thinking, and aggregates without leaving the app.',
    highlights: [
      'Original scenarios (not scraped)',
      'Same patterns as coding interviews',
      'Perfect after SQL Grind',
    ],
    filter: (w) => w.id >= 40 && w.id <= 49,
    tabGradient: 'from-indigo-500 to-violet-600',
    glowHex: '#6366f1',
    icon: '📋',
  },
  {
    id: 'windows',
    label: 'Window lab',
    labelShort: 'Windows',
    eyebrow: 'Advanced SQL',
    headline: 'FIRST_VALUE, LAG, frames',
    body: 'A dedicated lab for window functions — partitions, ordering, and moving frames — so analytics interviews feel familiar instead of frantic.',
    highlights: [
      'Focused world, deep coverage',
      'Pairs with Interview bank',
      'Pane breaker achievement path',
    ],
    filter: (w) => w.id === 31,
    tabGradient: 'from-sky-500 to-cyan-600',
    glowHex: '#0ea5e9',
    icon: '▤',
  },
  {
    id: 'industry',
    label: 'Industry labs',
    labelShort: 'Industry',
    eyebrow: 'Scenario play',
    headline: 'Same skills, different stories',
    body: 'Banking, healthcare, hospitality, and more — identical relational patterns dressed in domain narratives so you can practice explaining queries out loud.',
    highlights: [
      'Realistic stakeholder framing',
      'Great for portfolio talking points',
      'Mix with Foundation anytime',
    ],
    filter: (w) => w.id >= 15 && w.id <= 30,
    tabGradient: 'from-emerald-500 to-teal-600',
    glowHex: '#10b981',
    icon: '🏢',
  },
] as const;

const TRACK_IDS = new Set<string>(SQL_LEARN_TRACKS.map((t) => t.id));

export function parseSqlLearnTrackParam(raw: string | null): SqlLearnTrackId {
  if (raw && TRACK_IDS.has(raw)) return raw as SqlLearnTrackId;
  return 'foundation';
}

export function worldsForSqlLearnTrack(trackId: SqlLearnTrackId, allWorlds: World[]): World[] {
  const t = SQL_LEARN_TRACKS.find((x) => x.id === trackId);
  if (!t) return allWorlds;
  return allWorlds.filter(t.filter);
}

export function firstLevelPathInTrack(trackId: SqlLearnTrackId, allWorlds: World[]): string | null {
  const list = worldsForSqlLearnTrack(trackId, allWorlds);
  const first = list[0]?.levels[0];
  return first ? `/learn/${first.id}` : null;
}

/** Hash-router path back to the SQL hub tab that contains this world. */
export function learnHubPathForWorldId(worldId: number): string {
  let track: SqlLearnTrackId = 'foundation';
  if (worldId >= 1 && worldId <= 13) track = 'foundation';
  else if (worldId === 14) track = 'grind';
  else if (worldId >= 40 && worldId <= 49) track = 'bank';
  else if (worldId === 31) track = 'windows';
  else if (worldId >= 15 && worldId <= 30) track = 'industry';
  if (track === 'foundation') return '/learn';
  return `/learn?t=${track}`;
}
