import type { LessonTheory } from '@/data/lessonTheory/types';

export interface HintTier {
  tier: 1 | 2 | 3 | 4 | 5;
  cost: number;
  /** Short label shown above the hint body (LeetCode-style “think → approach → …”). */
  headline?: string;
  content: string;
}

export interface LevelValidation {
  strategy: ('result_match' | 'ast_check' | 'performance')[];
  orderSensitive: boolean;
  requiredClauses?: string[];
  forbiddenClauses?: string[];
  maxExecutionMs?: number;
  expectedRowCount?: number;
  expectedColumns?: string[];
}

export interface Level {
  id: string;
  worldId: number;
  levelNumber: number;
  title: string;
  isBoss: boolean;
  story: string;
  concept: string;
  task: string;
  starterCode?: string;
  expectedQuery: string;
  alternativeSolutions?: string[];
  validation: LevelValidation;
  hints: HintTier[];
  parTimeSeconds: number;
  xpReward: number;
  relevantTables: string[];
  /** Interview-style difficulty (shown in UI). */
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  /** Bullet constraints like LeetCode problem statements. */
  constraints?: string[];
  /** When stuck: problem-solving framework (not a full spoiler until late hints). */
  solveGuide?: string;
  theory?: LessonTheory;
}

export interface World {
  id: number;
  name: string;
  subtitle: string;
  theme: string;
  description: string;
  database: string;
  icon: string;
  color: string;
  levels: Level[];
  prerequisites: number[];
}
