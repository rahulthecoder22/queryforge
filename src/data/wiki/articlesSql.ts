import type { WikiArticle } from './types';
import { WIKI_SQL_A } from './articlesSqlA';
import { WIKI_SQL_B } from './articlesSqlB';

export const WIKI_SQL: WikiArticle[] = [...WIKI_SQL_A, ...WIKI_SQL_B];
