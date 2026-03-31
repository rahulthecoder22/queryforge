/** Long-form copy for Masterclass Visual lab — pairs with animations + wiki deep dives. */

export type VisualLabItem = {
  id: string;
  wikiArticleId: string;
  title: string;
  subtitle: string;
  /** Paragraphs shown above the animation. */
  narrative: string[];
  /** Bullets below animation. */
  takeaways: string[];
  /** Which component to mount: join | where | mongoMatch | groupBy */
  visual: 'join' | 'where' | 'mongoMatch' | 'groupBy';
};

export const VISUAL_LAB_ITEMS: VisualLabItem[] = [
  {
    id: 'lab-join',
    wikiArticleId: 'visual-sql-join',
    title: 'INNER JOIN — pairing rows on keys',
    subtitle: 'Relational algebra you use in every analytics query',
    visual: 'join',
    narrative: [
      `An inner join answers: “Give me combinations of rows from table A and table B where a key relationship holds.” Think of it as drawing lines between matching keys. Any row on one side without a partner on the other disappears from the result — that is what makes it “inner”.`,
      `In SQL you rarely materialize two stacks mentally as separate forever: you write FROM a JOIN b ON … and let the engine optimize. Still, the animation is the truth model: only matched pairs survive.`,
      `When debugging zero rows, check three things: (1) key types match (string vs int), (2) you used the correct foreign key column, (3) you didn’t accidentally filter out matches in WHERE when you meant LEFT JOIN behavior.`,
    ],
    takeaways: [
      'Qualify columns (c.id vs o.id) whenever both tables share names.',
      'INNER vs LEFT differs only when orphan rows must appear with NULLs on the far side.',
      'Deep dive: wiki articles “sql-joins-deep”, “sql-left-join-deep”, “sql-join-algorithms”.',
    ],
  },
  {
    id: 'lab-where',
    wikiArticleId: 'visual-sql-where',
    title: 'WHERE — the row sieve',
    subtitle: 'Predicates, AND/OR, and NULL as UNKNOWN',
    visual: 'where',
    narrative: [
      `WHERE is evaluated per row after FROM/JOIN. The predicate must resolve to TRUE for the row to continue. FALSE drops the row; UNKNOWN (from NULL comparisons) behaves like FALSE in filters — that is why WHERE col = NULL returns nothing.`,
      `The animation fades rows that fail the predicate so you can see the sieve. In real queries, build predicates incrementally: start with FROM + JOIN, add one WHERE clause, run, inspect row count, then add the next constraint.`,
      `Complex boolean logic needs parentheses. AND binds tighter than OR in SQL, but readers (and future you) benefit from explicit grouping.`,
    ],
    takeaways: [
      'Use IS NULL / IS NOT NULL instead of = NULL.',
      'For pattern matching, remember LIKE is not equality — wildcards and collation matter.',
      'Deep dive: “sql-where-deep”, “sql-null-three-valued”.',
    ],
  },
  {
    id: 'lab-group',
    wikiArticleId: 'sql-group-having-deep',
    title: 'GROUP BY — buckets and aggregates',
    subtitle: 'From many rows to one summary row per key',
    visual: 'groupBy',
    narrative: [
      `GROUP BY partitions the row stream: all rows sharing the same grouping key land in the same bucket. Aggregate functions (SUM, COUNT, AVG, …) run inside each bucket and emit a single value per group.`,
      `HAVING filters buckets after aggregation — use it for conditions on COUNT(*) or SUM(...). WHERE still applies to raw rows before grouping, which is cheaper when possible.`,
      `If your SELECT lists a non-aggregated column, it must be part of the GROUP BY (in standard SQL). Some engines relax this — don’t rely on extensions while learning.`,
    ],
    takeaways: [
      'COUNT(*) counts rows in the group; COUNT(col) ignores NULLs in col.',
      'Always add deterministic ORDER BY when presenting ranked groups.',
      'Deep dive: “sql-group-having-deep”, “sql-window-intro”.',
    ],
  },
  {
    id: 'lab-mongo-match',
    wikiArticleId: 'visual-mongo-match',
    title: '$match — pipeline filtering',
    subtitle: 'Same logic as find(), staged for aggregation',
    visual: 'mongoMatch',
    narrative: [
      `$match is the aggregation stage that shrinks the document stream early. It uses the same filter document shape as find(). Putting $match first is usually best: fewer documents flow through expensive stages later.`,
      `The animation uses a simplified AND of conditions on fields and arrays. In production MongoDB you combine operators ($gte, $in, $elemMatch, …) exactly as in the Mongo course JSON filters.`,
      `Mental bridge to SQL: $match ≈ WHERE on a row-oriented equivalent; $group ≈ GROUP BY; $lookup ≈ LEFT JOIN (conceptually).`,
    ],
    takeaways: [
      'Early $match saves CPU — design pipelines top-down.',
      'For array line items, prefer $elemMatch when multiple fields must align on one element.',
      'Deep dive: “mongo-aggregation-intro”, “mongo-operators-reference”.',
    ],
  },
];
