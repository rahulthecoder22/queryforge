/** Shared “read this first” theory blocks for SQL + Mongo lessons. */

export type TheoryVisualId =
  | 'mongo-boolean'
  | 'mongo-string-eq'
  | 'mongo-in-array'
  | 'mongo-compare'
  | 'mongo-dot'
  | 'mongo-or'
  | 'mongo-and-implicit'
  | 'mongo-elem'
  | 'mongo-exists'
  | 'mongo-ne'
  | 'mongo-nin'
  | 'mongo-compound'
  | 'sql-select'
  | 'sql-where'
  | 'sql-join'
  | 'sql-group'
  | 'none';

export interface LessonTheorySection {
  heading: string;
  body: string;
  codeExample?: string;
}

export interface LessonTheory {
  /** Short label above the title, e.g. “Before you type”. */
  eyebrow?: string;
  title?: string;
  sections: LessonTheorySection[];
  visualId?: TheoryVisualId;
  /** Quick mental checklist after reading theory. */
  checklist?: string[];
}
