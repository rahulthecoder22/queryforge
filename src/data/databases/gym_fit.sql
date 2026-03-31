PRAGMA foreign_keys = ON;

CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK(tier IN ('basic','plus','elite'))
);

INSERT INTO members (name, tier) VALUES ('Avery', 'plus'), ('Blair', 'basic'), ('Cameron', 'elite'),
  ('Drew', 'plus'), ('Emery', 'basic');

CREATE TABLE classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  instructor TEXT NOT NULL,
  capacity INTEGER NOT NULL
);

INSERT INTO classes (name, instructor, capacity) VALUES
  ('Spin', 'Jordan', 20), ('Yoga', 'Riley', 15), ('HIIT', 'Casey', 12),
  ('Pilates', 'Skyler', 10);

CREATE TABLE checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL REFERENCES members(id),
  checkin_time TEXT NOT NULL,
  minutes INTEGER NOT NULL
);

INSERT INTO checkins (member_id, checkin_time, minutes) VALUES
  (1, '2025-03-01T07:00:00', 45), (2, '2025-03-01T08:00:00', 30),
  (3, '2025-03-02T06:30:00', 60), (1, '2025-03-02T07:00:00', 50),
  (4, '2025-03-03T09:00:00', 40), (5, '2025-03-03T10:00:00', 25);

CREATE TABLE class_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL REFERENCES classes(id),
  member_id INTEGER NOT NULL REFERENCES members(id),
  session_time TEXT NOT NULL
);

INSERT INTO class_bookings (class_id, member_id, session_time) VALUES
  (1, 1, '2025-04-01T18:00:00'), (1, 3, '2025-04-01T18:00:00'), (2, 2, '2025-04-02T07:00:00'),
  (3, 4, '2025-04-02T19:00:00'), (4, 5, '2025-04-03T08:00:00');
