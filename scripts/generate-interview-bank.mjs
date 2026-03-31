#!/usr/bin/env node
/**
 * Builds src/data/interviewBank/generated/interviewBankPack.json
 *
 * Original analytics / interview-style SQL on sql_summit.sql — same *patterns* people practice
 * on coding platforms, but **not** scraped or copied from third-party problem statements (ToS / copyright).
 *
 *   node scripts/generate-interview-bank.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sqlPath = join(root, 'src/data/databases/sql_summit.sql');
const outDir = join(root, 'src/data/interviewBank/generated');
const outFile = join(outDir, 'interviewBankPack.json');

const WORLD_COUNT = 10;
const LEVELS_PER_WORLD = 30;
const TEMPLATE_COUNT = 20;
const VARIANTS = 15;
const TOTAL = WORLD_COUNT * LEVELS_PER_WORLD;
if (TEMPLATE_COUNT * VARIANTS !== TOTAL) {
  console.error('TEMPLATE_COUNT * VARIANTS must equal TOTAL');
  process.exit(1);
}

const SQL = await initSqlJs({
  locateFile: (f) => join(root, 'node_modules/sql.js/dist', f),
});
const db = new SQL.Database();
db.run(readFileSync(sqlPath, 'utf8'));

function runSelect(sql) {
  const stmt = db.prepare(sql);
  const cols = stmt.getColumnNames();
  const rows = [];
  while (stmt.step()) rows.push(stmt.get());
  stmt.free();
  return { cols, rows };
}

function inferValidation(sql, { cols, rows }) {
  const orderSensitive = /\bORDER\s+BY\b/i.test(sql);
  /** @type {import('../src/data/courses/types.ts').LevelValidation} */
  const v = {
    strategy: ['result_match'],
    orderSensitive,
    expectedRowCount: rows.length,
  };
  if (cols.length) v.expectedColumns = cols;
  return v;
}

const paidCust = runSelect(
  `SELECT DISTINCT customer_id FROM orders WHERE status = 'paid' ORDER BY customer_id`,
).rows.map((r) => Number(r[0]));
const lineProducts = runSelect(
  `SELECT DISTINCT product_id FROM order_lines ORDER BY product_id`,
).rows.map((r) => Number(r[0]));
const paidOrders = runSelect(`SELECT id FROM orders WHERE status = 'paid' ORDER BY id`).rows.map((r) =>
  Number(r[0]),
);
const allCustIds = runSelect(`SELECT id FROM customers ORDER BY id`).rows.map((r) => Number(r[0]));
const tiers = ['starter', 'growth', 'enterprise'];
const cats = ['hw', 'svc'];

/**
 * @param {number} v variant 0..14
 * @returns {Omit<import('../src/data/interviewBank/packTypes.ts').InterviewBankLevelJson, 'validation'>}
 */
function template(tplIndex, v) {
  const C = paidCust[v % paidCust.length];
  const P = lineProducts[v % lineProducts.length];
  const O = paidOrders[v % paidOrders.length];
  const tier = tiers[v % tiers.length];
  const cat = cats[v % cats.length];
  const cid = allCustIds[v % allCustIds.length];
  const k = 2 + (v % 3);

  switch (tplIndex) {
    case 0: {
      const q = `SELECT COUNT(*) AS n FROM orders WHERE status = 'paid' AND customer_id = ${C};`;
      return {
        title: `Paid orders for account ${C}`,
        story: 'Ops needs a quick count of paid checkouts for one customer id.',
        concept: 'COUNT + filter',
        task: 'Single column n — paid orders for this customer only.',
        expectedQuery: q,
        relevantTables: ['orders'],
        difficulty: 'Easy',
        parTimeSeconds: 90,
        xpReward: 55,
        constraints: ['Use orders only.', 'status = paid', `customer_id = ${C}`],
        solveGuide: 'Filter orders by status and customer_id, then COUNT(*).',
      };
    }
    case 1: {
      const q = `SELECT COALESCE(SUM(qty), 0) AS units FROM order_lines WHERE product_id = ${P};`;
      return {
        title: `Units moved for SKU id ${P}`,
        story: 'Inventory wants total quantity sold across all orders for one product.',
        concept: 'SUM + filter',
        task: 'One row: units = SUM(qty) for lines with this product_id.',
        expectedQuery: q,
        relevantTables: ['order_lines'],
        difficulty: 'Easy',
        parTimeSeconds: 100,
        xpReward: 60,
        constraints: ['order_lines only', `product_id = ${P}`, 'alias units'],
        solveGuide: 'SUM(qty) with WHERE on product_id; COALESCE handles no rows.',
      };
    }
    case 2: {
      const q = `SELECT COUNT(DISTINCT order_id) AS order_cnt FROM order_lines WHERE product_id = ${P};`;
      return {
        title: `Distinct orders touching product ${P}`,
        story: 'How many different orders include at least one line for this product?',
        concept: 'COUNT DISTINCT',
        task: 'Column order_cnt — COUNT(DISTINCT order_id) for lines with this product.',
        expectedQuery: q,
        relevantTables: ['order_lines'],
        difficulty: 'Easy',
        parTimeSeconds: 110,
        xpReward: 65,
        constraints: ['order_lines only', `product_id = ${P}`],
        solveGuide: 'COUNT(DISTINCT order_id) after filtering lines.',
      };
    }
    case 3: {
      const q = `SELECT name FROM customers WHERE id = ${cid};`;
      return {
        title: `Account name lookup`,
        story: `Finance pasted id ${cid} from a ticket — return the legal name.`,
        concept: 'WHERE primary key',
        task: 'Single column name for this customer id.',
        expectedQuery: q,
        relevantTables: ['customers'],
        difficulty: 'Easy',
        parTimeSeconds: 70,
        xpReward: 45,
        constraints: [`id = ${cid}`],
        solveGuide: 'Simple SELECT … FROM customers WHERE id = …',
      };
    }
    case 4: {
      const q = `SELECT ROUND(SUM(ol.qty * p.list_price * (1 - ol.discount_pct / 100.0)), 2) AS line_rev
FROM order_lines ol
JOIN products p ON ol.product_id = p.id
WHERE ol.order_id = ${O};`;
      return {
        title: `Net line revenue for order ${O}`,
        story: 'Discount-aware revenue for one order (qty × list × (1 − discount%)).',
        concept: 'JOIN + SUM',
        task: 'One row line_rev — SUM discounted line dollars for this order_id.',
        expectedQuery: q,
        relevantTables: ['order_lines', 'products'],
        difficulty: 'Easy',
        parTimeSeconds: 160,
        xpReward: 85,
        constraints: [`order_id = ${O}`, 'join products for list_price'],
        solveGuide: 'Join lines to products; SUM qty * list_price * (1 - discount_pct/100).',
      };
    }
    case 5: {
      const q = `SELECT COUNT(*) AS n FROM customers WHERE tier = '${tier}';`;
      return {
        title: `Headcount — ${tier} tier`,
        story: 'GTM segmentation: how many accounts are on this contract tier?',
        concept: 'COUNT + WHERE',
        task: `Single column n — customers where tier = '${tier}'.`,
        expectedQuery: q,
        relevantTables: ['customers'],
        difficulty: 'Easy',
        parTimeSeconds: 80,
        xpReward: 50,
        constraints: [`tier = '${tier}'`],
        solveGuide: 'COUNT(*) FROM customers with tier filter.',
      };
    }
    case 6: {
      const q = `SELECT r.code
FROM customers c
JOIN regions r ON r.id = c.region_id
WHERE c.id = ${cid};`;
      return {
        title: `Region code for customer`,
        story: 'Map a customer id to their region code for routing.',
        concept: 'JOIN lookup',
        task: 'Single column code — region code for this customer.',
        expectedQuery: q,
        relevantTables: ['customers', 'regions'],
        difficulty: 'Easy',
        parTimeSeconds: 120,
        xpReward: 70,
        constraints: [`customer id = ${cid}`],
        solveGuide: 'customers JOIN regions ON region_id = regions.id',
      };
    }
    case 7: {
      const q = `SELECT sku FROM products WHERE category = '${cat}' ORDER BY list_price DESC LIMIT 1;`;
      return {
        title: `Priciest ${cat.toUpperCase()} SKU`,
        story: `Within category '${cat}', which sku has the highest list price?`,
        concept: 'ORDER BY + LIMIT',
        task: 'One row: sku — top list_price in this category.',
        expectedQuery: q,
        relevantTables: ['products'],
        difficulty: 'Easy',
        parTimeSeconds: 100,
        xpReward: 68,
        constraints: [`category = '${cat}'`, 'highest list_price'],
        solveGuide: 'WHERE category, ORDER BY list_price DESC, LIMIT 1.',
      };
    }
    case 8: {
      const n = 1 + (v % 2);
      const q = `SELECT c.id, c.name
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid'
GROUP BY c.id, c.name
HAVING COUNT(*) = ${n}
ORDER BY c.id;`;
      return {
        title: `Exactly ${n} paid order(s)`,
        story: 'Lifecycle tag: accounts with a precise paid-order frequency.',
        concept: 'GROUP BY + HAVING',
        task: `id, name for customers with exactly ${n} paid orders; ORDER BY id.`,
        expectedQuery: q,
        relevantTables: ['customers', 'orders'],
        difficulty: 'Medium',
        parTimeSeconds: 220,
        xpReward: 110,
        constraints: ['paid orders only', `HAVING COUNT(*) = ${n}`],
        solveGuide: 'Join customers to orders, filter paid, GROUP BY customer, HAVING COUNT = n.',
      };
    }
    case 9: {
      const q = `SELECT order_id, COUNT(*) AS line_cnt
FROM order_lines
GROUP BY order_id
HAVING COUNT(*) >= ${k}
ORDER BY order_id;`;
      return {
        title: `Busy baskets (${k}+ lines)`,
        story: 'Fulfillment wants orders with at least this many line rows.',
        concept: 'GROUP BY + HAVING',
        task: `order_id and line_cnt where line_cnt >= ${k}; ORDER BY order_id.`,
        expectedQuery: q,
        relevantTables: ['order_lines'],
        difficulty: 'Medium',
        parTimeSeconds: 180,
        xpReward: 100,
        constraints: [`at least ${k} lines per order`],
        solveGuide: 'GROUP BY order_id, HAVING COUNT(*) >= k.',
      };
    }
    case 10: {
      const noPaid = v % 2 === 0;
      const q = noPaid
        ? `SELECT c.id, c.name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id AND o.status = 'paid'
)
ORDER BY c.id;`
        : `SELECT c.id, c.name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id AND o.status = 'open'
)
ORDER BY c.id;`;
      return {
        title: noPaid ? 'No paid history' : 'No open pipeline',
        story: noPaid
          ? 'Risk list: customers who have never completed a paid order.'
          : 'Accounts with nothing still sitting in open status (cleanup candidates).',
        concept: 'NOT EXISTS',
        task: noPaid
          ? 'id, name — no paid order ever; ORDER BY id.'
          : 'id, name — no open order ever; ORDER BY id.',
        expectedQuery: q,
        relevantTables: ['customers', 'orders'],
        difficulty: 'Medium',
        parTimeSeconds: 260,
        xpReward: 120,
        constraints: [noPaid ? 'zero paid orders' : 'zero open orders'],
        solveGuide: 'NOT EXISTS correlated subquery on orders with the right status filter.',
      };
    }
    case 11: {
      const q = `SELECT SUM(ol.qty) AS refunded_units
FROM order_lines ol
JOIN orders o ON o.id = ol.order_id
WHERE o.status = 'refunded' AND ol.product_id = ${P};`;
      return {
        title: `Refunded units — product ${P}`,
        story: 'Units attached to refunded orders, filtered to one product line.',
        concept: 'JOIN + SUM',
        task: `One row refunded_units — SUM(qty) for refunded orders and product_id ${P}.`,
        expectedQuery: q,
        relevantTables: ['order_lines', 'orders'],
        difficulty: 'Easy',
        parTimeSeconds: 140,
        xpReward: 78,
        constraints: ['refunded orders only', `product_id = ${P}`],
        solveGuide: 'Join lines to orders; filter refunded and product.',
      };
    }
    case 12: {
      const rid = 1 + (v % 5);
      const q = `SELECT c.id, MIN(o.id) AS first_order_id
FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
WHERE c.region_id = ${rid}
GROUP BY c.id
ORDER BY c.id;`;
      return {
        title: `First paid order — region ${rid}`,
        story: 'Within one region, earliest paid order id per customer who has paid.',
        concept: 'JOIN + GROUP BY + MIN',
        task: `id, first_order_id for customers in region_id ${rid} with paid orders; ORDER BY id.`,
        expectedQuery: q,
        relevantTables: ['customers', 'orders'],
        difficulty: 'Medium',
        parTimeSeconds: 190,
        xpReward: 102,
        constraints: [`region_id = ${rid}`, 'paid only'],
        solveGuide: 'Join customers to paid orders, filter region, GROUP BY customer, MIN(order id).',
      };
    }
    case 13: {
      const q = `SELECT p.sku
FROM products p
WHERE p.category = '${cat}'
  AND p.list_price > (SELECT AVG(list_price) FROM products WHERE category = '${cat}')
ORDER BY p.sku;`;
      return {
        title: `Above average ${cat} price`,
        story: 'Pricing review: SKUs in this category above category mean list price.',
        concept: 'Subquery AVG',
        task: `sku where category '${cat}' and list_price > subquery AVG for same category; ORDER BY sku.`,
        expectedQuery: q,
        relevantTables: ['products'],
        difficulty: 'Medium',
        parTimeSeconds: 200,
        xpReward: 105,
        constraints: [`category '${cat}'`, 'compare to AVG(list_price) for category'],
        solveGuide: 'Scalar subquery AVG(list_price) … WHERE category matches.',
      };
    }
    case 14: {
      const rid = 1 + (v % 5);
      const q = `SELECT r.name, COUNT(w.id) AS warehouse_cnt
FROM regions r
LEFT JOIN warehouses w ON w.region_id = r.id
WHERE r.id = ${rid}
GROUP BY r.id, r.name;`;
      return {
        title: `Warehouse footprint — region ${rid}`,
        story: 'How many warehouse rows are attached to this region?',
        concept: 'LEFT JOIN + COUNT',
        task: `name, warehouse_cnt for region id ${rid} (LEFT JOIN warehouses).`,
        expectedQuery: q,
        relevantTables: ['regions', 'warehouses'],
        difficulty: 'Easy',
        parTimeSeconds: 130,
        xpReward: 72,
        constraints: [`region id = ${rid}`],
        solveGuide: 'regions LEFT JOIN warehouses ON region_id; COUNT(w.id).',
      };
    }
    case 15: {
      const thresholds = [0, 100, 200, 300, 500, 50, 150, 250, 400, 600, 75, 125, 350, 450, 80];
      const th = thresholds[v % thresholds.length];
      const q = `SELECT i.product_id, SUM(i.on_hand) AS total_on_hand
FROM inventory_snapshot i
GROUP BY i.product_id
HAVING SUM(i.on_hand) > ${th}
ORDER BY i.product_id;`;
      return {
        title: `On-hand above ${th}`,
        story: 'Products whose snapshot totals exceed a stock threshold.',
        concept: 'HAVING SUM',
        task: `product_id, total_on_hand — SUM(on_hand) per product HAVING sum > ${th}; ORDER BY product_id.`,
        expectedQuery: q,
        relevantTables: ['inventory_snapshot'],
        difficulty: 'Medium',
        parTimeSeconds: 170,
        xpReward: 98,
        constraints: [`HAVING SUM(on_hand) > ${th}`],
        solveGuide: 'GROUP BY product_id, HAVING SUM(on_hand) > threshold.',
      };
    }
    case 16: {
      const off = v % 3;
      const q = `SELECT ol.order_id,
  SUM(ol.qty * p.list_price * (ol.discount_pct / 100.0)) AS discount_dollars
FROM order_lines ol
JOIN products p ON ol.product_id = p.id
JOIN orders o ON ol.order_id = o.id
WHERE o.status = 'paid'
GROUP BY ol.order_id
ORDER BY discount_dollars DESC, ol.order_id ASC
LIMIT 1 OFFSET ${off};`;
      return {
        title: `Discount burn rank #${off + 1}`,
        story: 'Nth ranked paid order by total discount dollars given away on lines.',
        concept: 'JOIN aggregate + LIMIT OFFSET',
        task: `order_id, discount_dollars — rank paid orders by discount sum DESC, order_id ASC; OFFSET ${off}.`,
        expectedQuery: q,
        relevantTables: ['order_lines', 'products', 'orders'],
        difficulty: 'Medium',
        parTimeSeconds: 290,
        xpReward: 128,
        constraints: ['paid orders', `OFFSET ${off}`],
        solveGuide: 'Per-order discount SUM, ORDER BY DESC, LIMIT 1 OFFSET n.',
      };
    }
    case 17: {
      const offset = v % 4;
      const q = `SELECT product_id FROM (
  SELECT product_id, SUM(qty) AS q
  FROM order_lines
  GROUP BY product_id
  ORDER BY q DESC, product_id ASC
  LIMIT 1 OFFSET ${offset}
);`;
      return {
        title: `Nth best seller by units`,
        story: 'Ranking drill: pick the product at this offset by total quantity (0 = top).',
        concept: 'LIMIT OFFSET',
        task: `Single column product_id — rank all products by SUM(qty) desc, product_id asc; OFFSET ${offset}.`,
        expectedQuery: q,
        relevantTables: ['order_lines'],
        difficulty: 'Medium',
        parTimeSeconds: 240,
        xpReward: 115,
        constraints: ['subquery with ORDER BY q DESC, product_id ASC', `OFFSET ${offset}`],
        solveGuide: 'Inner query GROUP BY product_id, ORDER BY sum desc, LIMIT 1 OFFSET n.',
      };
    }
    case 18: {
      const rid = 1 + (v % 5);
      const q = `WITH rc AS (
  SELECT c.id AS customer_id, COUNT(*) AS n
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
  WHERE c.region_id = ${rid}
  GROUP BY c.id
)
SELECT customer_id FROM rc
WHERE n = (SELECT MAX(n) FROM rc)
ORDER BY customer_id;`;
      return {
        title: `Tied for most paid — region ${rid}`,
        story: 'Within this region, every customer tied for the highest paid-order count.',
        concept: 'CTE + MAX',
        task: `customer_id only — ties for max paid count among customers in region ${rid}; ORDER BY customer_id.`,
        expectedQuery: q,
        relevantTables: ['customers', 'orders'],
        difficulty: 'Medium',
        parTimeSeconds: 310,
        xpReward: 132,
        constraints: [`region_id = ${rid}`, 'include all ties', 'paid only'],
        solveGuide: 'Scope CTE to region; MAX(n) within that subset.',
      };
    }
    case 19: {
      const rid = 1 + (v % 5);
      const q = `SELECT DISTINCT c.id, c.name
FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
JOIN order_lines ol ON ol.order_id = o.id
JOIN products p ON p.id = ol.product_id
WHERE c.region_id = ${rid}
  AND p.category = 'hw'
  AND EXISTS (
    SELECT 1 FROM orders o2
    JOIN order_lines ol2 ON ol2.order_id = o2.id
    JOIN products p2 ON p2.id = ol2.product_id
    WHERE o2.customer_id = c.id AND o2.status = 'paid' AND p2.category = 'svc'
  )
ORDER BY c.id;`;
      return {
        title: `HW + SVC — region ${rid}`,
        story: 'In one region, customers with paid hardware and paid service lines.',
        concept: 'EXISTS + JOIN',
        task: `DISTINCT id, name — region ${rid}, paid hw and paid svc; ORDER BY id.`,
        expectedQuery: q,
        relevantTables: ['customers', 'orders', 'order_lines', 'products'],
        difficulty: 'Hard',
        parTimeSeconds: 380,
        xpReward: 145,
        constraints: [`region_id = ${rid}`, 'paid only', 'hw and svc'],
        solveGuide: 'Filter region on outer customer; EXISTS for svc on same customer.',
      };
    }
    default:
      throw new Error(`unknown template ${tplIndex}`);
  }
}

const worldMeta = [
  { name: 'Interview bank I', subtitle: 'Filters & counts', theme: 'interview' },
  { name: 'Interview bank II', subtitle: 'Joins & revenue', theme: 'interview' },
  { name: 'Interview bank III', subtitle: 'Groups & HAVING', theme: 'interview' },
  { name: 'Interview bank IV', subtitle: 'Anti-joins & EXISTS', theme: 'interview' },
  { name: 'Interview bank V', subtitle: 'Subqueries & ranks', theme: 'interview' },
  { name: 'Interview bank VI', subtitle: 'CTEs & ties', theme: 'interview' },
  { name: 'Interview bank VII', subtitle: 'Inventory & ops', theme: 'interview' },
  { name: 'Interview bank VIII', subtitle: 'Mix easy', theme: 'interview' },
  { name: 'Interview bank IX', subtitle: 'Mix medium', theme: 'interview' },
  { name: 'Interview bank X', subtitle: 'Capstone mix', theme: 'interview' },
];

const worlds = [];
let i = 0;
for (let w = 0; w < WORLD_COUNT; w++) {
  const levels = [];
  for (let l = 0; l < LEVELS_PER_WORLD; l++) {
    const tpl = i % TEMPLATE_COUNT;
    const variant = Math.floor(i / TEMPLATE_COUNT) % VARIANTS;
    const draft = template(tpl, variant);
    const res = runSelect(draft.expectedQuery);
    const validation = inferValidation(draft.expectedQuery, res);
    const isBoss = l === LEVELS_PER_WORLD - 1;
    levels.push({
      title: isBoss ? `Boss: ${draft.title}` : draft.title,
      isBoss,
      difficulty: draft.difficulty,
      story: draft.story,
      concept: draft.concept,
      task: draft.task,
      expectedQuery: draft.expectedQuery,
      validation,
      parTimeSeconds: draft.parTimeSeconds + (isBoss ? 40 : 0),
      xpReward: draft.xpReward + (isBoss ? 50 : 0),
      relevantTables: draft.relevantTables,
      constraints: draft.constraints,
      solveGuide: draft.solveGuide,
    });
    i++;
  }

  const prereq = w === 0 ? [14] : [40 + w - 1];
  worlds.push({
    id: 40 + w,
    ...worldMeta[w],
    description: `${worldMeta[w].subtitle} — ${LEVELS_PER_WORLD} original SQL drills on the Summit commerce schema (Easy–Medium patterns common in interviews). Not affiliated with any third-party problem site.`,
    database: 'sql_summit.sql',
    icon: '📋',
    color: '#6366f1',
    prerequisites: prereq,
    levels,
  });
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify({ worlds }, null, 0), 'utf8');
console.log(`Wrote ${TOTAL} levels in ${WORLD_COUNT} worlds → ${outFile}`);
