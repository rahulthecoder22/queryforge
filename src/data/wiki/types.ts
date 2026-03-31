export type WikiSection = {
  id: string;
  heading: string;
  body: string;
  code?: string;
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
