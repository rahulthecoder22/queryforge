import type { WikiArticle } from './types';
import { WIKI_SQL_A } from './articlesSqlA';
import { WIKI_SQL_B } from './articlesSqlB';
import { WIKI_SQL_COURSE } from './articlesSqlCourse';

export const WIKI_SQL: WikiArticle[] = [...WIKI_SQL_A, ...WIKI_SQL_B, ...WIKI_SQL_COURSE];
