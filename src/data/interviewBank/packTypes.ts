import type { LevelValidation } from '@/data/courses/types';

/** JSON shape emitted by scripts/generate-interview-bank.mjs */
export interface InterviewBankLevelJson {
  title: string;
  isBoss: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  story: string;
  concept: string;
  task: string;
  expectedQuery: string;
  validation: LevelValidation;
  parTimeSeconds: number;
  xpReward: number;
  relevantTables: string[];
  constraints?: string[];
  solveGuide?: string;
}

export interface InterviewBankWorldJson {
  id: number;
  name: string;
  subtitle: string;
  theme: string;
  description: string;
  database: string;
  icon: string;
  color: string;
  prerequisites: number[];
  levels: InterviewBankLevelJson[];
}

export interface InterviewBankPackJson {
  worlds: InterviewBankWorldJson[];
}
