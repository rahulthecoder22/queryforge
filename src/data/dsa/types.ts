import type { HintTier } from '@/data/courses/types';

/** Serializable test IO (JSON-safe). */
export interface DsaTestCase {
  args: unknown[];
  expected: unknown;
}

export interface DsaChallenge {
  id: string;
  worldId: string;
  order: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  /** Playful framing — “you’re the algorithm intern at…” */
  flavorStory: string;
  /** Textbook-style explanation of the data structure or pattern before the task. */
  conceptDeepDive: string;
  problem: string;
  constraints: string[];
  /** Optional worked mini examples (strings for display). */
  examples?: { input: string; output: string; explanation?: string }[];
  starterCode: string;
  /** User must define this function name at top level (no exports). */
  functionName: string;
  testCases: DsaTestCase[];
  hints: HintTier[];
}

export interface DsaWorld {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
  /** Pedagogical blurb for the hub card. */
  learningArc: string;
  challenges: DsaChallenge[];
}
