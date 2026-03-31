PRAGMA foreign_keys = ON;

CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lead_time_days INTEGER NOT NULL
);

INSERT INTO suppliers (name, lead_time_days) VALUES
  ('FastBolt', 2), ('SteelCo', 7), ('PolymerX', 4);

CREATE TABLE parts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
  sku TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  unit_cost REAL NOT NULL
);

INSERT INTO parts (supplier_id, sku, description, unit_cost) VALUES
  (1, 'B-100', 'Bolt M10', 0.15), (1, 'W-22', 'Washer set', 0.08),
  (2, 'S-500', 'Steel plate', 12.5), (3, 'P-88', 'Polymer bracket', 3.2),
  (2, 'S-501', 'Steel rod', 8.9), (3, 'P-90', 'Bushing', 1.1);

CREATE TABLE work_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  part_id INTEGER NOT NULL REFERENCES parts(id),
  qty INTEGER NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL
);

INSERT INTO work_orders (part_id, qty, due_date, status) VALUES
  (1, 500, '2025-04-01', 'open'), (3, 40, '2025-04-05', 'in_progress'),
  (4, 200, '2025-04-02', 'open'), (2, 1000, '2025-03-30', 'done'),
  (5, 25, '2025-04-10', 'open'), (6, 800, '2025-04-03', 'in_progress');

CREATE TABLE inventory_moves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  part_id INTEGER NOT NULL REFERENCES parts(id),
  move_date TEXT NOT NULL,
  delta_qty INTEGER NOT NULL,
  reason TEXT NOT NULL
);

INSERT INTO inventory_moves (part_id, move_date, delta_qty, reason) VALUES
  (1, '2025-03-01', 2000, 'receipt'), (1, '2025-03-02', -500, 'consume'),
  (3, '2025-03-01', 100, 'receipt'), (4, '2025-03-03', -150, 'consume'),
  (2, '2025-03-04', 5000, 'receipt');
