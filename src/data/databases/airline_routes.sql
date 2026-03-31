PRAGMA foreign_keys = ON;

CREATE TABLE airports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  iata TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL
);

INSERT INTO airports (iata, city) VALUES ('SFO', 'San Francisco'), ('JFK', 'New York'),
  ('LHR', 'London'), ('NRT', 'Tokyo'), ('CDG', 'Paris');

CREATE TABLE flights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_no TEXT NOT NULL,
  origin_id INTEGER NOT NULL REFERENCES airports(id),
  dest_id INTEGER NOT NULL REFERENCES airports(id),
  dep_time TEXT NOT NULL,
  arr_time TEXT NOT NULL
);

INSERT INTO flights (flight_no, origin_id, dest_id, dep_time, arr_time) VALUES
  ('QF101', 1, 2, '2025-04-01T08:00:00', '2025-04-01T16:30:00'),
  ('QF202', 2, 3, '2025-04-02T18:00:00', '2025-04-03T06:00:00'),
  ('QF303', 3, 4, '2025-04-04T10:00:00', '2025-04-05T06:00:00'),
  ('QF404', 4, 1, '2025-04-06T12:00:00', '2025-04-06T06:00:00'),
  ('QF505', 1, 5, '2025-04-07T09:00:00', '2025-04-08T02:00:00');

CREATE TABLE passengers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

INSERT INTO passengers (name, email) VALUES ('Ada Lovelace', 'ada@example.com'),
  ('Alan Kay', 'alan@example.com'), ('Grace Hopper', 'grace@example.com');

CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_id INTEGER NOT NULL REFERENCES flights(id),
  passenger_id INTEGER NOT NULL REFERENCES passengers(id),
  seat TEXT NOT NULL,
  fare_usd REAL NOT NULL
);

INSERT INTO bookings (flight_id, passenger_id, seat, fare_usd) VALUES
  (1, 1, '12A', 420), (1, 2, '12B', 420), (2, 3, '3C', 890),
  (3, 1, '1A', 1200), (4, 2, '5F', 980), (5, 3, '7D', 650);
