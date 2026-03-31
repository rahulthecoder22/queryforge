PRAGMA foreign_keys = ON;

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

INSERT INTO categories (name) VALUES ('Electronics'), ('Home'), ('Books'), ('Sports');

CREATE TABLE sellers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_name TEXT NOT NULL,
  rating REAL NOT NULL
);

INSERT INTO sellers (shop_name, rating) VALUES
  ('North Gear', 4.7), ('Urban Loft', 4.2), ('Page Turner', 4.9);

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER NOT NULL REFERENCES sellers(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0
);

INSERT INTO products (seller_id, category_id, name, price, stock) VALUES
  (1, 1, 'USB Hub', 24.99, 40), (1, 4, 'Trail Pack', 79, 15),
  (2, 2, 'Desk Lamp', 45, 22), (2, 2, 'Throw Rug', 120, 8),
  (3, 3, 'SQL Stories', 18, 100), (1, 1, 'Webcam', 89.99, 12),
  (2, 1, 'Speaker', 59, 30), (3, 3, 'Data Lake Tales', 22, 55);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL
);

INSERT INTO customers (email, city) VALUES
  ('a@x.com', 'NYC'), ('b@x.com', 'LA'), ('c@x.com', 'NYC'), ('d@x.com', 'Chicago');

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  order_date TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL
);

INSERT INTO orders (customer_id, order_date, total, status) VALUES
  (1, '2025-01-02', 114.99, 'shipped'), (2, '2025-01-05', 79, 'pending'),
  (3, '2025-01-08', 45, 'shipped'), (1, '2025-02-01', 18, 'delivered'),
  (4, '2025-02-10', 200, 'shipped');

CREATE TABLE order_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty INTEGER NOT NULL,
  unit_price REAL NOT NULL
);

INSERT INTO order_lines (order_id, product_id, qty, unit_price) VALUES
  (1, 1, 2, 24.99), (1, 6, 1, 65.01), (2, 2, 1, 79), (3, 3, 1, 45),
  (4, 5, 1, 18), (5, 4, 1, 120), (5, 7, 1, 59), (5, 8, 1, 22);
