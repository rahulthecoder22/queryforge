PRAGMA foreign_keys = ON;

CREATE TABLE properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL,
  nightly_rate REAL NOT NULL,
  max_guests INTEGER NOT NULL
);

INSERT INTO properties (city, nightly_rate, max_guests) VALUES
  ('Portland', 120, 4), ('Austin', 95, 6), ('Denver', 140, 2), ('Miami', 200, 8);

CREATE TABLE hosts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  superhost INTEGER NOT NULL DEFAULT 0
);

INSERT INTO hosts (name, superhost) VALUES ('Alex Row', 1), ('Blake Hill', 0), ('Cory Vale', 1);

CREATE TABLE listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host_id INTEGER NOT NULL REFERENCES hosts(id),
  property_id INTEGER NOT NULL REFERENCES properties(id),
  title TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

INSERT INTO listings (host_id, property_id, title, active) VALUES
  (1, 1, 'Loft near river', 1), (2, 2, 'Big yard house', 1),
  (3, 3, 'Ski cabin vibe', 1), (1, 4, 'Beach weekender', 0);

CREATE TABLE reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL REFERENCES listings(id),
  guest_email TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_price REAL NOT NULL
);

INSERT INTO reservations (listing_id, guest_email, start_date, end_date, total_price) VALUES
  (1, 'g1@mail.com', '2025-04-01', '2025-04-04', 360), (2, 'g2@mail.com', '2025-04-10', '2025-04-15', 475),
  (3, 'g3@mail.com', '2025-05-01', '2025-05-03', 280), (1, 'g4@mail.com', '2025-06-01', '2025-06-07', 720),
  (4, 'g5@mail.com', '2025-03-01', '2025-03-05', 800);

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL REFERENCES listings(id),
  stars INTEGER NOT NULL,
  comment TEXT
);

INSERT INTO reviews (listing_id, stars, comment) VALUES
  (1, 5, 'Great light'), (1, 4, 'A bit noisy'), (2, 5, 'Huge kitchen'),
  (3, 5, 'Cozy'), (4, 3, 'Under construction nearby');
