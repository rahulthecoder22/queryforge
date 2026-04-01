import type { WikiArticle, WikiSection } from './types';

type Opts = { codeExtra?: string[]; diagram?: string };

const s = (id: string, heading: string, body: string, code?: string, opts?: Opts): WikiSection => ({
  id,
  heading,
  body,
  code,
  ...opts,
});

/**
 * Extra long-form “course module” articles — semester-style depth with diagrams + many examples.
 */
export const WIKI_SQL_COURSE: WikiArticle[] = [
  {
    id: 'sql-course-module-01-relational-model',
    category: 'SQL',
    tags: ['course', 'relational-model', 'keys', 'algebra'],
    title: 'Course module 1 — Relational model & SQL mapping',
    summary:
      'A semester-style introduction tying the relational model (Codd) to practical SQL: relations vs tables, keys, integrity, relational algebra operators (σ π ⋈ ÷), and how SELECT-FROM-WHERE approximates σ and π. Includes worked examples and diagrams you can reuse in notes.',
    seeAlso: [
      'sql-select-from-deep',
      'sql-joins-deep',
      'concepts-normalization-deep',
      'acid-deep',
    ],
    sections: [
      s(
        'relations',
        'Relations, tuples, and tables',
        `A relation is a set (or multiset in SQL) of tuples with named attributes. A SQL table is a concrete relation variable: it holds a current value that changes over time.

Each attribute has a domain (type). NULL is a marker for missing/unknown—not a value in the domain, which is why logic becomes three-valued.

First normal form (1NF): each cell holds a single atomic value from its domain (no repeating groups inside a cell in the classical model).`,
        undefined,
        {
          diagram: `   Relation R(name, age)          As a table
   ┌─────────┬─────┐
   │  Ada    │  31 │     name  │ age
   ├─────────┼─────┤     ──────┼────
   │  Bob    │  27 │     Ada   │ 31
   └─────────┴─────┘     Bob   │ 27`,
        },
      ),
      s(
        'keys',
        'Superkeys, candidate keys, primary keys',
        `A superkey is a set of attributes that uniquely identifies tuples. A candidate key is a minimal superkey (remove any attribute and uniqueness fails). You pick one candidate as PRIMARY KEY for ergonomics; others become UNIQUE.

Composite keys are normal in link tables: (user_id, group_id) uniquely identifies membership.

Surrogate keys (BIGSERIAL, UUID) simplify joins and stabilize references when natural keys change—but you still model natural uniqueness with UNIQUE when the business requires it.`,
        `CREATE TABLE memberships (
  user_id   BIGINT NOT NULL REFERENCES users(id),
  group_id  BIGINT NOT NULL REFERENCES groups(id),
  role      TEXT NOT NULL,
  PRIMARY KEY (user_id, group_id)
);`,
      ),
      s(
        'integrity',
        'Integrity constraints = database guardrails',
        `PRIMARY KEY and UNIQUE enforce uniqueness. NOT NULL forbids missing values in critical columns. FOREIGN KEY ties child to parent. CHECK encodes single-row rules (balance >= 0).

Deferrable FKs (where supported) check at COMMIT so you can insert parent and child in either order inside one transaction.

Triggers and exclusion constraints handle cross-row rules standard CHECK cannot express.`,
      ),
      s(
        'algebra-select',
        'Selection σ (sigma) ↔ WHERE',
        `Relational selection σpredicate(R) keeps tuples satisfying a predicate—same spirit as WHERE after FROM/JOIN.

σage>30(Students) in algebra ≈ SELECT * FROM students WHERE age > 30 in SQL (ignoring multiset vs set details).`,
        `SELECT *
FROM students
WHERE age > 30;`,
      ),
      s(
        'algebra-project',
        'Projection π (pi) ↔ SELECT list + DISTINCT',
        `πname,age(R) keeps only listed attributes and (in pure algebra) deduplicates. SQL SELECT name, age FROM R returns a multiset; add DISTINCT to mimic set semantics—expensive on large results.

Projection interacts with GROUP BY: grouped queries project aggregates per group.`,
        `SELECT DISTINCT dept
FROM employees;`,
      ),
      s(
        'algebra-join',
        'Join ⋈ ↔ JOIN … ON',
        `Natural join matches same-named columns; SQL uses explicit INNER JOIN … ON for clarity. θ-join is join with arbitrary predicate (equijoin when predicate is conjunction of equalities).

Cartesian product R × S appears as CROSS JOIN or comma-FROM without ON—almost always accidental at scale.`,
        `SELECT e.name, d.name AS dept_name
FROM employees e
INNER JOIN departments d ON d.id = e.dept_id;`,
        {
          codeExtra: [
            `SELECT e.name, p.title
FROM employees e
CROSS JOIN projects p
WHERE e.id = p.lead_id;  -- filter after product (still costly if huge)`,
          ],
        },
      ),
      s(
        'algebra-rename',
        'Rename ρ ↔ AS aliases',
        `ρnewSchema(R) renames attributes; SQL uses AS on columns and tables to disambiguate and document.`,
        `SELECT amount * qty AS line_total
FROM order_lines ol;`,
      ),
      s(
        'pipeline-map',
        'Mapping algebra to SQL clauses (lecture diagram)',
        `Rough correspondence for single-block queries:

• FROM/JOIN ≈ Cartesian product + selection forming join pairs\n• WHERE ≈ σ on row predicate\n• GROUP BY/HAVING ≈ extended aggregation algebra\n• SELECT list ≈ π plus expressions\n• DISTINCT ≈ duplicate elimination\n• ORDER BY ≈ not in classical algebra (presentation layer)\n\nOptimizers reorder physically; the logical story is what you reason about.`,
        undefined,
        {
          diagram: `   σ, π, ⋈  (algebra)          SELECT-FROM-WHERE (SQL)
        │                                │
   σ_pred( R ⋈ S )              FROM R JOIN S
        │                         WHERE pred
        │                                │
        ▼                                ▼
   smaller relation              result multiset`,
        },
      ),
      s(
        'worked-join',
        'Worked example: orders enriched with customer + line count',
        `We want one row per order with customer name and how many lines. Fan-out from joining lines before grouping would duplicate order headers—so aggregate lines in a derived table first, then join to orders and customers.`,
        `SELECT o.id,
       c.name AS customer,
       s.line_count,
       o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN (
  SELECT order_id, COUNT(*) AS line_count
  FROM order_lines
  GROUP BY order_id
) s ON s.order_id = o.id;`,
        {
          diagram: `orders ──▶ join customers
  │
  └──▶ join (aggregated order_lines)
              one row per order_id`,
        },
      ),
      s(
        'set-ops',
        'Union, intersection, difference',
        `Algebra uses ∪ ∩ −. SQL: UNION / INTERSECT / EXCEPT (MINUS in Oracle). Remember column count/type compatibility; UNION vs UNION ALL trade dedupe cost.

Intersection can be expressed with INNER JOIN on all columns or EXISTS patterns when shapes differ.`,
        `SELECT email FROM newsletter_a
INTERSECT
SELECT email FROM newsletter_b;`,
      ),
      s(
        'study-path',
        'How to study this module',
        `• Re-read SELECT & FROM and INNER JOIN wiki articles with this algebra lens.

• In the workspace, write the same query twice: once with joins, once with EXISTS—EXPLAIN both.

• Complete QueryForge worlds on filters and joins to anchor muscle memory.`,
      ),
    ],
  },
];
