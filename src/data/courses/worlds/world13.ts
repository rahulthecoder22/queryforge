import { buildWorld } from '../worldFactory';

export const world13 = buildWorld(
  {
    id: 13,
    name: 'SQL Summit',
    subtitle: 'CTEs & revenue math',
    theme: 'summit',
    description:
      'Customers, products, orders, lines — paid revenue, CTEs, and subqueries for analytics-style SQL.',
    database: 'sql_summit.sql',
    icon: '⛰️',
    color: '#f97316',
    prerequisites: [12],
  },
  [
    {
      title: 'Paid volume',
      isBoss: false,
      story: 'How many orders are paid?',
      concept: 'COUNT + WHERE',
      task: 'COUNT(*) AS n FROM orders WHERE status = paid.',
      starterCode: "SELECT COUNT(*) AS n FROM orders WHERE status = 'paid';",
      expectedQuery: "SELECT COUNT(*) AS n FROM orders WHERE status = 'paid';",
      validation: {
        strategy: ['result_match'],
        orderSensitive: false,
        expectedColumns: ['n'],
      },
      parTimeSeconds: 90,
      xpReward: 70,
      relevantTables: ['orders'],
    },
    {
      title: 'Enterprise accounts',
      isBoss: false,
      story: 'Names of enterprise-tier customers, A–Z.',
      concept: 'WHERE + ORDER BY',
      task: 'name FROM customers WHERE tier = enterprise ORDER BY name.',
      starterCode:
        "SELECT name FROM customers WHERE tier = 'enterprise' ORDER BY name;",
      expectedQuery:
        "SELECT name FROM customers WHERE tier = 'enterprise' ORDER BY name;",
      validation: { strategy: ['result_match'], orderSensitive: true, expectedRowCount: 2 },
      parTimeSeconds: 120,
      xpReward: 80,
      relevantTables: ['customers'],
    },
    {
      title: 'Repeat buyers',
      isBoss: false,
      story: 'Customers with more than one paid order.',
      concept: 'GROUP BY + HAVING',
      task: 'customer_id, COUNT(*) AS c — paid only, HAVING c > 1, ORDER BY customer_id.',
      starterCode:
        "SELECT customer_id, COUNT(*) AS c\nFROM orders\nWHERE status = 'paid'\nGROUP BY customer_id\nHAVING ",
      expectedQuery: `SELECT customer_id, COUNT(*) AS c
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING COUNT(*) > 1
ORDER BY customer_id;`,
      validation: { strategy: ['result_match'], orderSensitive: true, expectedRowCount: 2 },
      parTimeSeconds: 220,
      xpReward: 120,
      relevantTables: ['orders'],
    },
    {
      title: 'Order 109 manifest',
      isBoss: false,
      story: 'SKU and quantity for every line on order 109.',
      concept: 'JOIN',
      task: 'JOIN order_lines to products; filter order_id 109; sku, qty ORDER BY sku.',
      starterCode:
        'SELECT p.sku, ol.qty\nFROM order_lines ol\nJOIN products p ON ol.product_id = p.id\nWHERE ol.order_id = 109\nORDER BY p.sku;',
      expectedQuery: `SELECT p.sku, ol.qty
FROM order_lines ol
JOIN products p ON ol.product_id = p.id
WHERE ol.order_id = 109
ORDER BY p.sku;`,
      validation: { strategy: ['result_match'], orderSensitive: true, expectedRowCount: 2 },
      parTimeSeconds: 200,
      xpReward: 110,
      relevantTables: ['order_lines', 'products'],
    },
    {
      title: 'January paid revenue',
      isBoss: false,
      story: 'Per paid order in Jan 2025: order id and sum of discounted line revenue.',
      concept: 'CTE + JOIN',
      task: 'CTE rv sums qty * price * (1-discount_pct/100) per order_id; join orders paid Jan.',
      starterCode:
        'WITH rv AS (\n  SELECT ol.order_id,\n    SUM(ol.qty * p.list_price * (1 - ol.discount_pct / 100.0)) AS line_rev\n  FROM order_lines ol\n  JOIN products p ON ol.product_id = p.id\n  GROUP BY ol.order_id\n)\nSELECT o.id, rv.line_rev\nFROM orders o\nJOIN rv ON o.id = rv.order_id\nWHERE o.status = \'paid\' AND o.order_date LIKE \'2025-01%\'\nORDER BY o.id;',
      expectedQuery: `WITH rv AS (
  SELECT ol.order_id,
    SUM(ol.qty * p.list_price * (1 - ol.discount_pct / 100.0)) AS line_rev
  FROM order_lines ol
  JOIN products p ON ol.product_id = p.id
  GROUP BY ol.order_id
)
SELECT o.id, rv.line_rev
FROM orders o
JOIN rv ON o.id = rv.order_id
WHERE o.status = 'paid' AND o.order_date LIKE '2025-01%'
ORDER BY o.id;`,
      validation: { strategy: ['result_match'], orderSensitive: true, expectedRowCount: 5 },
      parTimeSeconds: 360,
      xpReward: 160,
      relevantTables: ['orders', 'order_lines', 'products'],
    },
    {
      title: 'Above-average hardware',
      isBoss: false,
      story: 'Hardware SKUs priced above the average list_price of all hw products.',
      concept: 'Subquery',
      task: 'sku FROM products WHERE category = hw AND list_price > subquery AVG for hw.',
      starterCode:
        "SELECT sku FROM products\nWHERE category = 'hw'\nAND list_price > (SELECT AVG(list_price) FROM products WHERE category = 'hw')\nORDER BY sku;",
      expectedQuery: `SELECT sku FROM products
WHERE category = 'hw'
AND list_price > (SELECT AVG(list_price) FROM products WHERE category = 'hw')
ORDER BY sku;`,
      validation: { strategy: ['result_match'], orderSensitive: true, expectedRowCount: 1 },
      parTimeSeconds: 240,
      xpReward: 130,
      relevantTables: ['products'],
    },
    {
      title: 'Heavy lines',
      isBoss: false,
      story: 'Distinct order IDs that have at least one line with qty >= 5.',
      concept: 'DISTINCT',
      task: 'SELECT DISTINCT order_id FROM order_lines WHERE qty >= 5 ORDER BY order_id.',
      starterCode:
        'SELECT DISTINCT order_id FROM order_lines WHERE qty >= 5 ORDER BY order_id;',
      expectedQuery:
        'SELECT DISTINCT order_id FROM order_lines WHERE qty >= 5 ORDER BY order_id;',
      validation: { strategy: ['result_match'], orderSensitive: true, expectedRowCount: 3 },
      parTimeSeconds: 150,
      xpReward: 95,
      relevantTables: ['order_lines'],
    },
    {
      title: 'Top mover SKU',
      isBoss: false,
      story: 'product_id with the highest total qty sold across all lines; tie-break lowest id.',
      concept: 'SUM + GROUP BY',
      task: 'SUM(qty) GROUP BY product_id ORDER BY sum desc, product_id asc LIMIT 1.',
      starterCode:
        'SELECT product_id, SUM(qty) AS q\nFROM order_lines\nGROUP BY product_id\nORDER BY q DESC, product_id ASC\nLIMIT 1;',
      expectedQuery: `SELECT product_id, SUM(qty) AS q
FROM order_lines
GROUP BY product_id
ORDER BY q DESC, product_id ASC
LIMIT 1;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 1,
        expectedColumns: ['product_id', 'q'],
      },
      parTimeSeconds: 200,
      xpReward: 140,
      relevantTables: ['order_lines'],
    },
    {
      title: 'Summit Boss: revenue champion',
      isBoss: true,
      story: 'customer_id with highest total paid line revenue (discount-aware); tie-break lowest id.',
      concept: 'JOIN aggregate',
      task: 'Join lines→products→orders (paid only), SUM discounted line $, GROUP BY customer.',
      starterCode:
        'SELECT c.id, SUM(ol.qty * p.list_price * (1 - ol.discount_pct / 100.0)) AS rev\nFROM order_lines ol\nJOIN products p ON ol.product_id = p.id\nJOIN orders o ON ol.order_id = o.id\nJOIN customers c ON o.customer_id = c.id\nWHERE o.status = \'paid\'\nGROUP BY c.id\nORDER BY ',
      expectedQuery: `SELECT c.id, SUM(ol.qty * p.list_price * (1 - ol.discount_pct / 100.0)) AS rev
FROM order_lines ol
JOIN products p ON ol.product_id = p.id
JOIN orders o ON ol.order_id = o.id
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'paid'
GROUP BY c.id
ORDER BY rev DESC, c.id ASC
LIMIT 1;`,
      validation: {
        strategy: ['result_match'],
        orderSensitive: true,
        expectedRowCount: 1,
        expectedColumns: ['id', 'rev'],
      },
      parTimeSeconds: 400,
      xpReward: 350,
      relevantTables: ['order_lines', 'products', 'orders', 'customers'],
    },
  ],
);
