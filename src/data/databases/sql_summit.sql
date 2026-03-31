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

-- Extended regions, accounts, SKUs, and open pipeline (no extra paid orders on legacy ids).
INSERT INTO regions (code, name) VALUES
  ('AP', 'Asia-Pacific'),
  ('LAT', 'Latin America');

INSERT INTO customers (id, name, region_id, tier) VALUES
  (9, 'Iota Systems', 4, 'starter'),
  (10, 'Kappa Labs', 5, 'growth'),
  (11, 'Lambda Rail', 4, 'starter'),
  (12, 'Mu Mobile', 5, 'starter');

INSERT INTO products (id, sku, category, list_price) VALUES
  (6, 'P-TAB', 'hw', 449),
  (7, 'P-CLOUD', 'svc', 1200),
  (8, 'P-NET', 'hw', 59);

INSERT INTO orders (id, customer_id, order_date, status) VALUES
  (111, 9, '2025-03-01', 'open'),
  (112, 10, '2025-03-02', 'open'),
  (113, 11, '2025-03-03', 'open');

INSERT INTO order_lines (order_id, product_id, qty, discount_pct) VALUES
  (111, 6, 1, 0),
  (112, 7, 1, 0),
  (113, 8, 2, 0);

-- Reference data for schema exploration (not used by Summit / Grind validators).
CREATE TABLE warehouses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL,
  region_id INTEGER NOT NULL REFERENCES regions(id)
);

INSERT INTO warehouses (code, region_id) VALUES
  ('SEA-01', 4),
  ('SEA-02', 4),
  ('MX-01', 5),
  ('EU-HUB', 3),
  ('W-CV', 1);

CREATE TABLE inventory_snapshot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  on_hand INTEGER NOT NULL,
  as_of TEXT NOT NULL
);

INSERT INTO inventory_snapshot (warehouse_id, product_id, on_hand, as_of) VALUES
  (1, 6, 220, '2025-03-15'),
  (1, 1, 40, '2025-03-15'),
  (2, 7, 18, '2025-03-15'),
  (3, 8, 900, '2025-03-15'),
  (4, 4, 310, '2025-03-15'),
  (5, 2, 1500, '2025-03-15');
