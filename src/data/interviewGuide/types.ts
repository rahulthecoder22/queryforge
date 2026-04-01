export interface InterviewCodeExample {
  title?: string;
  sql: string;
}

export interface InterviewQA {
  id: string;
  question: string;
  /** Plain text; blank line = paragraph break in UI. */
  answer: string;
  tags?: string[];
  /** ASCII diagram (monospace panel). */
  diagram?: string;
  /** Runnable-style SQL snippets with optional titles. */
  codeExamples?: InterviewCodeExample[];
}

export interface InterviewTopic {
  id: string;
  category: string;
  description?: string;
  items: InterviewQA[];
}
