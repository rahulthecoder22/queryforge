export type WikiSection = {
  id: string;
  heading: string;
  body: string;
  /** Primary SQL / code sample for this section. */
  code?: string;
  /** Additional fenced-style examples shown below `code`. */
  codeExtra?: string[];
  /** ASCII / box diagram (rendered monospace, distinct from SQL). */
  diagram?: string;
};

export type WikiCategory = 'SQL' | 'MongoDB' | 'Concepts' | 'Visual guides';

export type WikiArticle = {
  id: string;
  title: string;
  category: WikiCategory;
  tags: string[];
  summary: string;
  sections: WikiSection[];
  seeAlso?: string[];
};
