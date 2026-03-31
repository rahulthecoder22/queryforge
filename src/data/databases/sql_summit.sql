PRAGMA foreign_keys = ON;

CREATE TABLE regions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

INSERT INTO regions (code, name) VALUES
  ('W', 'West'), ('E', 'East'), ('EU', 'Europe');

CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  region_id INTEGER NOT NULL REFERENCES regions(id),
  tier TEXT NOT NULL CHECK(tier IN ('starter','growth','enterprise'))
);

INSERT INTO customers (name, region_id, tier) VALUES
  ('Acme', 1, 'enterprise'),
  ('Beta', 2, 'starter'),
  ('Gamma', 3, 'growth'),
  ('Delta', 1, 'growth'),
  ('Epsilon', 2, 'enterprise'),
  ('Zeta', 3, 'starter'),
  ('Eta', 1, 'starter'),
  ('Theta', 2, 'growth');

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  list_price REAL NOT NULL
);

INSERT INTO products (sku, category, list_price) VALUES
  ('P-CPU', 'hw', 899),
  ('P-RAM', 'hw', 120),
  ('P-SVC', 'svc', 400),
  ('P-DISK', 'hw', 199),
  ('P-LIC', 'svc', 250);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  order_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('open','paid','refunded'))
);

INSERT INTO orders (id, customer_id, order_date, status) VALUES
  (101, 1, '2025-01-02', 'paid'),
  (102, 2, '2025-01-03', 'open'),
  (103, 3, '2025-01-04', 'paid'),
  (104, 4, '2025-01-05', 'paid'),
  (105, 5, '2025-01-06', 'paid'),
  (106, 6, '2025-01-07', 'open'),
  (107, 7, '2025-01-08', 'paid'),
  (108, 8, '2025-01-09', 'refunded'),
  (109, 1, '2025-02-01', 'paid'),
  (110, 5, '2025-02-10', 'paid');

CREATE TABLE order_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty INTEGER NOT NULL,
  discount_pct REAL NOT NULL DEFAULT 0
);

INSERT INTO order_lines (order_id, product_id, qty, discount_pct) VALUES
  (101, 1, 2, 0),
  (101, 2, 4, 10),
  (102, 3, 1, 0),
  (103, 4, 5, 0),
  (104, 1, 1, 5),
  (104, 5, 2, 0),
  (105, 1, 3, 0),
  (106, 2, 8, 0),
  (107, 3, 2, 20),
  (108, 4, 1, 0),
  (109, 5, 6, 0),
  (109, 2, 2, 0),
  (110, 1, 1, 0),
  (110, 3, 1, 0);
