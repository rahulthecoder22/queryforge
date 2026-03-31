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
    summary:
      'The Visual lab animates how two tables become one result set when join keys match. Use this page alongside the INNER JOIN wiki article and Masterclass labs that link here.',
    seeAlso: ['sql-joins-deep', 'sql-join-algorithms'],
    sections: [
      s(
        'what-you-see',
        'What the diagram shows',
        `Two stacks of rows represent two tables (for example customers and orders). Each row exposes a join key (customer id on the left, customer_id on the right). Animated edges connect rows where those keys are equal.

Rows on the right whose foreign key points to a missing left id have no edge—they disappear from an INNER JOIN result. Rows on the left with no matching right row also disappear (that behavior is LEFT JOIN territory).`,
      ),
      s(
        'sql-shape',
        'Mapping to SQL',
        `FROM left_table AS L JOIN right_table AS R ON L.id = R.fk expresses the same pairing. The engine may implement this as nested loops, hash join, or merge join, but the logical outcome is “all pairs where ON is TRUE.”

Cartesian product happens when you omit ON for INNER JOIN (invalid in strict SQL) or use comma joins without WHERE—every left row pairs with every right row.`,
        `SELECT c.name, o.item
FROM customers c
JOIN orders o ON c.id = o.cust_id;`,
      ),
      s(
        'mistakes',
        'Common mistakes',
        `• Wrong join type: INNER when you need LEFT to preserve parents without children.

• Fat-fingered keys: joining order.customer_id to product.id.

• Duplicate keys on one side: one left row matches many right rows—fan-out duplicates unless you aggregate or dedupe.

• Ambiguous SELECT * when both tables have id—always alias columns in production queries.`,
      ),
    ],
  },
  {
    id: 'visual-sql-where',
    category: 'Visual guides',
    tags: ['animation', 'filter', 'where'],
    title: 'Reading the WHERE animation',
    summary:
      'WHERE filters row-by-row after FROM/JOIN. This companion page emphasizes three-valued logic and debugging habits.',
    seeAlso: ['sql-where-deep', 'sql-null-three-valued'],
    sections: [
      s(
        'flow',
        'Row-by-row evaluation',
        `After the join produces a working row, the WHERE predicate is evaluated. TRUE keeps the row; FALSE or UNKNOWN discards it. UNKNOWN arises when NULL appears in comparisons—treated like FALSE for filtering, which surprises newcomers expecting NULL = NULL to match.`,
      ),
      s(
        'and-or',
        'AND / OR and parentheses',
        `AND requires all conjuncts TRUE. OR requires at least one TRUE. Mixing them without parentheses leads to precedence bugs: OR binds looser than AND in SQL.

Short-circuit evaluation is not guaranteed in SQL—do not rely on AND a AND (1/0) to guard division; use CASE or NULLIF instead.`,
      ),
      s(
        'practice',
        'Practice habit',
        `Develop queries incrementally: SELECT * … WHERE TRUE, add one predicate at a time, LIMIT early. When counts drop unexpectedly, bisect predicates and print intermediate counts with CTEs.

Cross-check with LEFT JOIN to see which rows fail a filter.`,
      ),
    ],
  },
  {
    id: 'visual-mongo-match',
    category: 'Visual guides',
    tags: ['animation', 'aggregation', 'match'],
    title: 'Reading the $match animation',
    summary:
      '$match is the aggregation pipeline’s filter—same boolean spirit as SQL WHERE and find(). Early $match reduces work for later stages.',
    seeAlso: ['mongo-find-overview', 'mongo-aggregation-intro'],
    sections: [
      s(
        'pipeline',
        'Ordered stages',
        `Documents enter stage 1, exit transformed, enter stage 2, etc. $match passes through documents satisfying the filter; others drop. Placing $match immediately after $lookup on huge collections is usually wrong—narrow first if possible.

Explain plans in Atlas show index usage per stage.`,
      ),
      s(
        'equiv',
        'Equivalence to find()',
        `Many filter documents in the Mongo course match what you would pass to db.col.find({ … }). QueryForge evaluates filters locally; production MongoDB adds collation, read concern, and index intersection rules.

$expr inside $match allows aggregation expressions referencing $$ROOT fields—different from simple field comparisons.`,
      ),
      s(
        'perf',
        'Performance intuition',
        `Selective equality on leading index fields first. $regex without anchor scans many documents. $where (JavaScript) disables index use—avoid in production.`,
      ),
    ],
  },
  {
    id: 'wiki-how-to-use',
    category: 'Concepts',
    tags: ['meta', 'study'],
    title: 'How to use this wiki with the courses',
    summary:
      'Suggested study loops: theory → wiki → challenge → workspace. Articles are written for depth; use search and category chips to narrow.',
    sections: [
      s(
        'path',
        'Recommended order',
        `1) Read the lesson Theory panel for vocabulary and the specific task.

2) Open the linked wiki article (from Masterclass Visual lab, See also links, or search) for full conceptual context and edge cases.

3) Attempt the challenge cold, then use hints in tiers.

4) Reproduce patterns in Workspace or masterclass datasets at higher volume.

5) For interviews, pair SQL Grind constraints with wiki pages on NULLs, joins, and GROUP BY.`,
      ),
      s(
        'depth',
        'How topics are organized',
        `SQL articles focus on the declarative language and portable patterns; engine-specific sections call out SQLite/QueryForge where relevant. MongoDB articles note where Atlas behavior may differ from the local course matcher.

Concepts articles (ACID, isolation, MVCC) explain why databases behave the way they do under concurrency and failure—essential for senior interviews.`,
      ),
    ],
  },
];
