PRAGMA foreign_keys = ON;

CREATE TABLE theaters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  screens INTEGER NOT NULL
);

INSERT INTO theaters (name, screens) VALUES ('Riverside 8', 8), ('Metro 12', 12), ('Uptown 4', 4);

CREATE TABLE movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  runtime_min INTEGER NOT NULL,
  rating TEXT NOT NULL
);

INSERT INTO movies (title, runtime_min, rating) VALUES
  ('Star Query', 118, 'PG-13'), ('Deep Water', 132, 'R'), ('Laugh Track', 96, 'PG'),
  ('Iron City', 140, 'PG-13'), ('Silent Run', 104, 'PG-13');

CREATE TABLE showtimes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theater_id INTEGER NOT NULL REFERENCES theaters(id),
  movie_id INTEGER NOT NULL REFERENCES movies(id),
  show_time TEXT NOT NULL,
  price REAL NOT NULL
);

INSERT INTO showtimes (theater_id, movie_id, show_time, price) VALUES
  (1, 1, '2025-04-01T19:00:00', 12.5), (1, 2, '2025-04-01T21:30:00', 14),
  (2, 1, '2025-04-01T18:00:00', 13), (2, 3, '2025-04-01T20:00:00', 11),
  (3, 4, '2025-04-02T17:00:00', 10), (3, 5, '2025-04-02T19:30:00', 12);

CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  showtime_id INTEGER NOT NULL REFERENCES showtimes(id),
  seat TEXT NOT NULL,
  sold_at TEXT NOT NULL
);

INSERT INTO tickets (showtime_id, seat, sold_at) VALUES
  (1, 'A1', '2025-03-28T10:00:00'), (1, 'A2', '2025-03-28T10:05:00'),
  (2, 'B5', '2025-03-29T12:00:00'), (3, 'C10', '2025-03-30T09:00:00'),
  (4, 'D2', '2025-03-30T11:00:00'), (5, 'E1', '2025-03-31T14:00:00');
