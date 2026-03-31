PRAGMA foreign_keys = ON;

CREATE TABLE sectors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

INSERT INTO sectors (name) VALUES ('Tech'), ('Energy'), ('Healthcare'), ('Finance');

CREATE TABLE stocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticker TEXT UNIQUE NOT NULL,
  company TEXT NOT NULL,
  sector_id INTEGER NOT NULL REFERENCES sectors(id)
);

INSERT INTO stocks (ticker, company, sector_id) VALUES
  ('QFAI', 'QueryForge AI', 1), ('SUNO', 'SunOil', 2), ('MEDX', 'MedExpert', 3),
  ('BANK', 'River Bank', 4), ('CHIP', 'Silicon Peak', 1), ('WIND', 'WindGrid', 2);

CREATE TABLE daily_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stock_id INTEGER NOT NULL REFERENCES stocks(id),
  trade_date TEXT NOT NULL,
  open_price REAL NOT NULL,
  close_price REAL NOT NULL,
  volume INTEGER NOT NULL
);

INSERT INTO daily_prices (stock_id, trade_date, open_price, close_price, volume) VALUES
  (1, '2025-03-01', 120, 125, 900000), (1, '2025-03-02', 125, 122, 820000),
  (2, '2025-03-01', 44, 45.2, 300000), (2, '2025-03-02', 45.2, 43.9, 280000),
  (3, '2025-03-01', 210, 208, 150000), (4, '2025-03-01', 55, 56.1, 400000),
  (5, '2025-03-02', 88, 92, 1200000), (6, '2025-03-02', 33, 34.5, 500000),
  (1, '2025-03-03', 122, 130, 1100000), (3, '2025-03-03', 208, 215, 190000);

CREATE TABLE traders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

INSERT INTO traders (name) VALUES ('Casey Wu'), ('Robin Fox'), ('Sam Diaz');

CREATE TABLE trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trader_id INTEGER NOT NULL REFERENCES traders(id),
  stock_id INTEGER NOT NULL REFERENCES stocks(id),
  trade_time TEXT NOT NULL,
  side TEXT NOT NULL CHECK(side IN ('buy','sell')),
  shares INTEGER NOT NULL,
  price REAL NOT NULL
);

INSERT INTO trades (trader_id, stock_id, trade_time, side, shares, price) VALUES
  (1, 1, '2025-03-01T10:00:00', 'buy', 100, 121), (2, 2, '2025-03-01T11:30:00', 'sell', 200, 44.5),
  (3, 5, '2025-03-02T09:15:00', 'buy', 50, 90), (1, 4, '2025-03-02T14:00:00', 'buy', 300, 55.5),
  (2, 1, '2025-03-03T10:30:00', 'sell', 75, 128);
