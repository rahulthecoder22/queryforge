import type { WikiArticle, WikiSection } from './types';

const s = (id: string, heading: string, body: string, code?: string): WikiSection => ({
  id,
  heading,
  body,
  code,
});

/** Foundational articles + visual-lab companion pages. */
export const WIKI_CORE: WikiArticle[] = [
  {
    id: 'visual-sql-join',
    category: 'Visual guides',
    tags: ['animation', 'join', 'inner'],
    title: 'Reading the INNER JOIN animation',
    summary: 'Step-by-step: how two tables become one result set when keys match.',
    seeAlso: ['sql-joins-deep', 'sql-join-algorithms'],
    sections: [
      s(
        'what-you-see',
        'What the diagram shows',
        `Two stacks of rows represent two tables (for example customers and orders). Each row has a key column (customer id and cust_id). Lines connect rows where those keys are equal. Rows on the right that point to a missing id on the left never get a line — they are dropped from an INNER JOIN.`,
      ),
      s(
        'sql-shape',
        'The SQL pattern',
        `You write FROM left_table alias_l JOIN right_table alias_r ON alias_l.id = alias_r.foreign_key. The database engine compares every pair of rows (conceptually) and keeps pairs where the ON predicate is true. In practice it uses indexes and hash/nested loops — but mentally, it is "match keys".`,
        `SELECT c.name, o.item
FROM customers c
JOIN orders o ON c.id = o.cust_id;`,
      ),
      s(
        'mistakes',
        'Common mistakes',
        `Cartesian product: JOIN without ON (or invalid ON) can explode row counts. Wrong join type: using INNER when you need LEFT to keep customers with zero orders. Ambiguous columns: always qualify id if both tables have id.`,
      ),
    ],
  },
  {
    id: 'visual-sql-where',
    category: 'Visual guides',
    tags: ['animation', 'filter', 'where'],
    title: 'Reading the WHERE animation',
    summary: 'Why some rows fade: three-valued logic and predicate evaluation.',
    seeAlso: ['sql-where-deep', 'sql-null-three-valued'],
    sections: [
      s(
        'flow',
        'Row-by-row evaluation',
        `Conceptually, after FROM (and JOIN), each row is tested against the WHERE predicate. If the result is TRUE, the row proceeds to SELECT/GROUP BY. If FALSE or UNKNOWN, the row disappears from the result.`,
      ),
      s(
        'and-or',
        'AND / OR',
        `AND requires every conjunct to be TRUE. OR requires at least one disjunct TRUE. Mix them with parentheses: WHERE (a OR b) AND c is not the same as WHERE a OR (b AND c).`,
      ),
      s(
        'practice',
        'Practice habit',
        `Run SELECT * … WHERE … LIMIT 20 often while authoring. When counts surprise you, strip predicates one at a time to see which filter removed the rows.`,
      ),
    ],
  },
  {
    id: 'visual-mongo-match',
    category: 'Visual guides',
    tags: ['animation', 'aggregation', 'match'],
    title: 'Reading the $match animation',
    summary: 'How a pipeline stage shrinks the document stream — same idea as WHERE.',
    seeAlso: ['mongo-find-overview', 'mongo-aggregation-intro'],
    sections: [
      s(
        'pipeline',
        'Pipelines process in order',
        `$match is an aggregation stage. Documents flow stage to stage. $match early reduces work for later stages — just like selective WHERE before heavy JOINs in SQL.`,
      ),
      s(
        'equiv',
        'Equivalence to find()',
        `Many filters you write in the Mongo course as JSON are the same shape you would pass to find({ ... }). QueryForge runs them locally against sample arrays without a server.`,
      ),
    ],
  },
  {
    id: 'wiki-how-to-use',
    category: 'Concepts',
    tags: ['meta', 'study'],
    title: 'How to use this wiki with the courses',
    summary: 'Study path: theory column → wiki deep dive → challenge → workspace.',
    sections: [
      s(
        'path',
        'Recommended order',
        `1) Open a lesson and read the Theory panel end-to-end. 2) Open the matching wiki article (links appear in Masterclass Visual lab and in See also). 3) Attempt the challenge without hints. 4) Use Workspace or masterclass datasets for repetition at scale.`,
      ),
      s(
        'depth',
        'Depth vs breadth',
        `Each article is written to stand alone. Operators reference pages list syntax; concept pages explain why designs exist. If a term is new, search the sidebar or use category filters.`,
      ),
    ],
  },
];
