PRAGMA foreign_keys = ON;

CREATE TABLE rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_number TEXT UNIQUE NOT NULL,
  beds INTEGER NOT NULL,
  rate_per_night REAL NOT NULL
);

INSERT INTO rooms (room_number, beds, rate_per_night) VALUES
  ('101', 2, 189), ('102', 2, 189), ('201', 4, 289), ('202', 2, 209),
  ('301', 6, 349), ('302', 2, 199);

CREATE TABLE guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

INSERT INTO guests (first_name, last_name, email) VALUES
  ('Chris', 'Bell', 'cb@example.com'), ('Dana', 'Fox', 'df@example.com'),
  ('Pat', 'Snow', 'ps@example.com'), ('Jamie', 'Lake', 'jl@example.com'),
  ('Rae', 'Peak', 'rp@example.com');

CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id INTEGER NOT NULL REFERENCES guests(id),
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  total_amount REAL NOT NULL
);

INSERT INTO bookings (guest_id, room_id, check_in, check_out, total_amount) VALUES
  (1, 1, '2025-01-05', '2025-01-08', 567), (2, 3, '2025-01-10', '2025-01-14', 1156),
  (3, 2, '2025-02-01', '2025-02-03', 378), (4, 5, '2025-02-14', '2025-02-21', 2443),
  (5, 4, '2025-03-01', '2025-03-05', 836), (1, 6, '2025-03-12', '2025-03-15', 597);

CREATE TABLE menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL
);

INSERT INTO menu_items (name, category, price) VALUES
  ('Trout', 'Entree', 28), ('Burger', 'Entree', 16), ('Salad', 'Starter', 9),
  ('Hot cocoa', 'Drink', 4), ('Fondue', 'Entree', 34);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id INTEGER NOT NULL REFERENCES guests(id),
  order_date TEXT NOT NULL
);

INSERT INTO orders (guest_id, order_date) VALUES (1, '2025-01-06'), (2, '2025-01-11'), (3, '2025-02-02');

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  qty INTEGER NOT NULL
);

INSERT INTO order_items (order_id, menu_item_id, qty) VALUES
  (1, 1, 2), (1, 4, 2), (2, 5, 1), (3, 3, 1), (3, 2, 2);
