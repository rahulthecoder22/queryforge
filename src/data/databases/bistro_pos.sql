PRAGMA foreign_keys = ON;

CREATE TABLE tables_rest (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  seats INTEGER NOT NULL
);

INSERT INTO tables_rest (code, seats) VALUES ('T1', 2), ('T2', 4), ('T3', 6), ('T4', 2);

CREATE TABLE menu (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL
);

INSERT INTO menu (name, category, price) VALUES
  ('Soup', 'starter', 6), ('Steak', 'main', 28), ('Pasta', 'main', 18),
  ('Salad', 'starter', 7), ('Cake', 'dessert', 8), ('Wine', 'drink', 9);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_id INTEGER NOT NULL REFERENCES tables_rest(id),
  opened_at TEXT NOT NULL,
  closed_at TEXT,
  status TEXT NOT NULL
);

INSERT INTO orders (table_id, opened_at, closed_at, status) VALUES
  (1, '2025-03-01T18:00:00', '2025-03-01T19:30:00', 'paid'),
  (2, '2025-03-01T18:15:00', NULL, 'open'),
  (3, '2025-03-01T19:00:00', '2025-03-01T20:10:00', 'paid'),
  (4, '2025-03-02T12:00:00', '2025-03-02T12:45:00', 'paid');

CREATE TABLE order_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  menu_id INTEGER NOT NULL REFERENCES menu(id),
  qty INTEGER NOT NULL
);

INSERT INTO order_lines (order_id, menu_id, qty) VALUES
  (1, 1, 2), (1, 2, 1), (2, 3, 2), (2, 6, 2), (3, 4, 1), (3, 2, 2), (4, 3, 1), (4, 5, 1);
