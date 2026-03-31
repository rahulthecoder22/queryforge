import type { HintTier } from '@/data/courses/types';
import type { MongoCollectionId } from '@/data/documentSamples';
import type { LessonTheory } from '@/data/lessonTheory/types';

export interface MongoLevel {
  id: string;
  worldId: number;
  levelNumber: number;
  title: string;
  isBoss: boolean;
  story: string;
  concept: string;
  task: string;
  starterFilter: string;
  expectedFilter: string;
  collection: MongoCollectionId;
  xpReward: number;
  parTimeSeconds: number;
  hints: HintTier[];
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  constraints?: string[];
  solveGuide?: string;
  /** Optional override; otherwise theory is resolved from `concept`. */
  theory?: LessonTheory;
}

export interface MongoWorld {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  levels: MongoLevel[];
}
