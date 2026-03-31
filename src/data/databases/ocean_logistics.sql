PRAGMA foreign_keys = ON;

CREATE TABLE ports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL
);

INSERT INTO ports (code, name, country) VALUES
  ('SFO', 'San Francisco', 'US'), ('LAX', 'Los Angeles', 'US'), ('SEA', 'Seattle', 'US'),
  ('YVR', 'Vancouver', 'CA'), ('NRT', 'Tokyo', 'JP'), ('SIN', 'Singapore', 'SG'),
  ('DXB', 'Dubai', 'AE'), ('RTM', 'Rotterdam', 'NL'), ('HAM', 'Hamburg', 'DE'),
  ('MEL', 'Melbourne', 'AU');

CREATE TABLE ships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  capacity_teu INTEGER NOT NULL,
  year_built INTEGER NOT NULL
);

INSERT INTO ships (name, capacity_teu, year_built) VALUES
  ('Pacific Star', 8500, 2012),
  ('Blue Heron', 12000, 2018),
  ('Coral Wind', 6200, 2009),
  ('Iron Reef', 15000, 2021),
  ('Neptune VII', 9800, 2015),
  ('Sea Falcon', 11200, 2019),
  ('Aurora Line', 13400, 2020),
  ('Nordic Crest', 7200, 2011);

CREATE TABLE voyages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ship_id INTEGER NOT NULL REFERENCES ships(id),
  origin_port_id INTEGER NOT NULL REFERENCES ports(id),
  dest_port_id INTEGER NOT NULL REFERENCES ports(id),
  depart_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('scheduled','underway','completed','delayed'))
);

-- 32 voyages: ship_id 2 (Blue Heron) is busiest with 8 trips
INSERT INTO voyages (ship_id, origin_port_id, dest_port_id, depart_date, status) VALUES
  (1, 1, 5, '2025-04-01', 'completed'), (2, 2, 6, '2025-04-10', 'underway'),
  (3, 3, 4, '2025-04-15', 'scheduled'), (4, 5, 8, '2025-03-20', 'completed'),
  (5, 6, 1, '2025-05-01', 'scheduled'), (1, 8, 2, '2025-04-22', 'delayed'),
  (2, 1, 7, '2025-04-05', 'completed'), (3, 7, 3, '2025-04-18', 'underway'),
  (1, 4, 6, '2025-05-20', 'scheduled'), (2, 3, 8, '2025-05-12', 'scheduled'),
  (4, 2, 5, '2025-04-25', 'completed'), (5, 7, 1, '2025-05-08', 'underway'),
  (2, 9, 4, '2025-05-14', 'completed'), (2, 6, 9, '2025-05-16', 'completed'),
  (2, 4, 1, '2025-05-18', 'underway'), (2, 8, 3, '2025-05-22', 'scheduled'),
  (2, 1, 10, '2025-05-24', 'completed'), (6, 5, 2, '2025-04-28', 'completed'),
  (7, 10, 6, '2025-04-30', 'scheduled'), (8, 3, 7, '2025-05-03', 'delayed'),
  (4, 9, 1, '2025-05-11', 'underway'), (3, 2, 8, '2025-05-13', 'completed'),
  (1, 6, 4, '2025-05-15', 'completed'), (5, 4, 9, '2025-05-17', 'scheduled'),
  (6, 7, 5, '2025-05-19', 'underway'), (7, 1, 8, '2025-05-21', 'completed'),
  (8, 5, 10, '2025-05-23', 'scheduled'), (3, 9, 2, '2025-05-25', 'delayed'),
  (4, 3, 6, '2025-05-26', 'completed'), (1, 10, 7, '2025-05-27', 'underway'),
  (7, 8, 4, '2025-05-28', 'scheduled'), (6, 1, 3, '2025-05-29', 'completed');

CREATE TABLE cargo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  voyage_id INTEGER NOT NULL REFERENCES voyages(id),
  description TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

INSERT INTO cargo (voyage_id, description, weight_kg, quantity) VALUES
  (1, 'Electronics', 12000, 40), (1, 'Furniture', 8000, 22),
  (2, 'Grain', 45000, 1), (3, 'Machinery', 22000, 8),
  (4, 'Textiles', 15000, 35), (5, 'Oil drums', 30000, 60),
  (6, 'Auto parts', 18000, 15), (7, 'Chemicals', 9500, 12),
  (8, 'Retail goods', 11000, 28), (9, 'Pharma cold', 5200, 12),
  (10, 'Steel coils', 88000, 4), (11, 'Coffee beans', 24000, 18),
  (12, 'Lithium cells', 19000, 9), (13, 'Apparel', 14000, 44),
  (14, 'Frozen fish', 28000, 6), (15, 'Paper reels', 16000, 20),
  (16, 'Glass sheets', 22000, 11), (17, 'Robotics kits', 7800, 7),
  (18, 'Aluminum ingots', 92000, 3), (19, 'Wine casks', 34000, 8),
  (20, 'Timber', 41000, 2), (21, 'Medical kits', 6500, 30),
  (22, 'Ceramics', 12500, 16), (23, 'Solar panels', 21000, 14),
  (24, 'Diesel tanks', 55000, 5), (25, 'Spices', 9800, 25),
  (26, 'Sport gear', 11200, 19), (27, 'Dairy', 17000, 10),
  (28, 'Copper wire', 76000, 2), (29, 'Toys', 8900, 40),
  (30, 'Aviation parts', 48000, 6), (31, 'Seeds', 13500, 8),
  (32, 'Beverages', 15500, 22);

CREATE TABLE crew_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ship_id INTEGER NOT NULL REFERENCES ships(id),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  hire_date TEXT NOT NULL
);

INSERT INTO crew_members (ship_id, full_name, role, hire_date) VALUES
  (1, 'Ana Morales', 'Captain', '2019-01-10'), (1, 'Kenji Sato', 'Engineer', '2020-06-01'),
  (2, 'Priya Nair', 'Captain', '2017-03-15'), (2, 'Omar Haddad', 'Navigator', '2021-09-20'),
  (3, 'Lena Vogel', 'Captain', '2016-11-05'), (4, 'Diego Cruz', 'Captain', '2022-02-28'),
  (5, 'Yuki Tan', 'Engineer', '2018-07-14'), (4, 'Samira Khan', 'First Mate', '2023-01-09'),
  (1, 'Chris Dale', 'Navigator', '2022-04-18'), (2, 'Morgan Ellis', 'Cook', '2023-08-01'),
  (3, 'Alex Vance', 'Engineer', '2021-02-22'), (6, 'Ravi Menon', 'Captain', '2015-05-12'),
  (6, 'Ingrid Berg', 'Chief Mate', '2019-09-01'), (7, 'Tomás Ruiz', 'Captain', '2014-02-20'),
  (7, 'Hannah Cho', 'Engineer', '2020-11-30'), (8, 'Elena Popov', 'Captain', '2018-04-04'),
  (8, 'Marcus Webb', 'Navigator', '2022-07-07'), (2, 'Sofia Reyes', 'Engineer', '2024-01-15');
