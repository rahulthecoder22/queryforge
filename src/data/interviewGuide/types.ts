export interface InterviewQA {
  id: string;
  question: string;
  /** Plain text; blank line = paragraph break in UI. */
  answer: string;
  tags?: string[];
}

export interface InterviewTopic {
  id: string;
  category: string;
  description?: string;
  items: InterviewQA[];
}
