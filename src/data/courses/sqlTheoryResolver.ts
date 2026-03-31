import type { LessonTheory, TheoryVisualId } from '@/data/lessonTheory/types';
import type { Level } from './types';

const T = (
  visualId: TheoryVisualId,
  sections: LessonTheory['sections'],
  checklist?: string[],
): LessonTheory => ({
  eyebrow: 'Read this first',
  sections,
  visualId,
  checklist,
});

const lib: Record<string, LessonTheory> = {
  selectStar: T(
    'sql-select',
    [
      {
        heading: 'SELECT *',
        body: 'SELECT lists columns (or * for all). FROM names the table. This is always the first shape: what to show, then where rows come from.',
        codeExample: 'SELECT * FROM residents;',
      },
    ],
    ['SELECT then FROM', '* means every column'],
  ),
  columns: T(
    'sql-select',
    [
      {
        heading: 'Projection',
        body: 'Listing columns instead of * reduces noise and matches real analytics queries. Order of columns in SELECT is the order of columns in the result.',
        codeExample: 'SELECT first_name, age FROM residents;',
      },
    ],
    ['Comma-separate columns', 'No trailing comma before FROM'],
  ),
  where: T(
    'sql-where',
    [
      {
        heading: 'WHERE filters rows',
        body: 'WHERE runs after FROM (conceptually) and keeps only rows that match the predicate. Text literals use single quotes in SQL.',
        codeExample: "WHERE first_name = 'Elena'",
      },
    ],
    ['String literals use single quotes', 'One WHERE per query level'],
  ),
  join: T(
    'sql-join',
    [
      {
        heading: 'JOIN',
        body: 'JOIN connects two tables on a key equality (usually primary key = foreign key). Every joined column must be qualified with table alias or name if ambiguous.',
      },
    ],
    ['Start FROM the fact table or the table you filter on', 'ON ties keys together'],
  ),
  group: T(
    'sql-group',
    [
      {
        heading: 'GROUP BY',
        body: 'Aggregate functions (COUNT, SUM, …) collapse rows. Every non-aggregated column in SELECT must appear in GROUP BY (standard SQL). HAVING filters groups after aggregation.',
      },
    ],
    ['WHERE before groups, HAVING after', 'COUNT(*) counts rows in each group'],
  ),
};

export function resolveSqlTheory(level: Pick<Level, 'concept' | 'theory'>): LessonTheory {
  if (level.theory) return level.theory;
  const c = level.concept.toLowerCase();

  if (c.includes('select *')) return lib.selectStar;
  if (c.includes('column')) return lib.columns;
  if (c.includes('where') || c.includes('like') || c.includes('between') || c.includes('null'))
    return lib.where;
  if (c.includes('join') || c.includes('inner') || c.includes('outer')) return lib.join;
  if (c.includes('group') || c.includes('having') || c.includes('aggregate') || c.includes('count'))
    return lib.group;
  if (c.includes('subquery') || c.includes('cte') || c.includes('with')) {
    return T('none', [
      {
        heading: 'Subqueries & CTEs',
        body: 'A subquery is a SELECT in parentheses used as a value or table. A CTE (WITH name AS (...)) names a subquery so you can read the main query top-down.',
      },
    ]);
  }

  return {
    eyebrow: 'Read this first',
    title: level.concept,
    visualId: 'none',
    sections: [
      {
        heading: 'SQL clause order',
        body: `This level highlights: ${level.concept}. Typical SELECT shape: SELECT columns → FROM tables → JOIN … → WHERE row filters → GROUP BY → HAVING → ORDER BY → LIMIT. Write the smallest query that answers the task, then run to inspect rows.`,
      },
    ],
    checklist: ['Name tables from the schema rail', 'Run often; fix syntax before chasing logic'],
  };
}
