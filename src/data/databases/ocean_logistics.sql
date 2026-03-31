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
  ('DXB', 'Dubai', 'AE'), ('RTM', 'Rotterdam', 'NL');

CREATE TABLE ships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  capacity_teu INTEGER NOT NULL,
  year_built INTEGER NOT NULL
);

INSERT INTO ships (name, capacity_teu, year_built) VALUES
  ('Pacific Star', 8500, 2012), ('Blue Heron', 12000, 2018), ('Coral Wind', 6200, 2009),
  ('Iron Reef', 15000, 2021), ('Neptune VII', 9800, 2015);

CREATE TABLE voyages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ship_id INTEGER NOT NULL REFERENCES ships(id),
  origin_port_id INTEGER NOT NULL REFERENCES ports(id),
  dest_port_id INTEGER NOT NULL REFERENCES ports(id),
  depart_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('scheduled','underway','completed','delayed'))
);

INSERT INTO voyages (ship_id, origin_port_id, dest_port_id, depart_date, status) VALUES
  (1, 1, 5, '2025-04-01', 'completed'), (2, 2, 6, '2025-04-10', 'underway'),
  (3, 3, 4, '2025-04-15', 'scheduled'), (4, 5, 8, '2025-03-20', 'completed'),
  (5, 6, 1, '2025-05-01', 'scheduled'), (1, 8, 2, '2025-04-22', 'delayed'),
  (2, 1, 7, '2025-04-05', 'completed'),   (3, 7, 3, '2025-04-18', 'underway'),
  (1, 4, 6, '2025-05-20', 'scheduled'),
  (2, 3, 8, '2025-05-12', 'scheduled'),
  (4, 2, 5, '2025-04-25', 'completed'),
  (5, 7, 1, '2025-05-08', 'underway');

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
  (8, 'Retail goods', 11000, 28),
  (9, 'Pharma cold', 5200, 12),
  (10, 'Steel coils', 88000, 4),
  (11, 'Coffee beans', 24000, 18);

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
  (3, 'Alex Vance', 'Engineer', '2021-02-22');
