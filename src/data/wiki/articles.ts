import type { WikiArticle } from './types';
import { WIKI_CORE } from './articlesCore';
import { WIKI_SQL } from './articlesSql';
import { WIKI_MONGO } from './articlesMongo';
import { WIKI_CONCEPTS } from './articlesConcepts';

export type { WikiArticle, WikiSection, WikiCategory } from './types';

/** All encyclopedia entries (merged, deduped by id — first wins). */
const merged: WikiArticle[] = [
  ...WIKI_SQL,
  ...WIKI_MONGO,
  ...WIKI_CONCEPTS,
  ...WIKI_CORE,
];

const seen = new Set<string>();
export const WIKI_ARTICLES: WikiArticle[] = merged.filter((a) => {
  if (seen.has(a.id)) return false;
  seen.add(a.id);
  return true;
});
