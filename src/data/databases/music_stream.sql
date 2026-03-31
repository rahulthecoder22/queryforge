PRAGMA foreign_keys = ON;

CREATE TABLE artists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  genre TEXT NOT NULL
);

INSERT INTO artists (name, genre) VALUES
  ('Nova Keys', 'Pop'), ('Deep Rail', 'Electronic'), ('Hollow Sky', 'Indie');

CREATE TABLE albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL REFERENCES artists(id),
  title TEXT NOT NULL,
  release_year INTEGER NOT NULL
);

INSERT INTO albums (artist_id, title, release_year) VALUES
  (1, 'Bright Lines', 2022), (1, 'Afterglow', 2024), (2, 'Pulse City', 2021),
  (3, 'Paper Moon', 2020), (3, 'Quiet Storm', 2023);

CREATE TABLE tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id INTEGER NOT NULL REFERENCES albums(id),
  title TEXT NOT NULL,
  duration_sec INTEGER NOT NULL,
  streams_millions REAL NOT NULL DEFAULT 0
);

INSERT INTO tracks (album_id, title, duration_sec, streams_millions) VALUES
  (1, 'Intro', 45, 1.2), (1, 'Runaway', 210, 8.4), (2, 'Glow', 198, 12.1),
  (3, 'Metro', 240, 5.5), (4, 'Echo', 185, 3.2), (5, 'Rain', 220, 6.0),
  (2, 'Satellite', 205, 9.9), (3, 'Night Bus', 255, 4.4);

CREATE TABLE listeners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handle TEXT UNIQUE NOT NULL,
  country TEXT NOT NULL
);

INSERT INTO listeners (handle, country) VALUES ('sky_fan', 'US'), ('metro_99', 'DE'),
  ('wave_rider', 'BR'), ('quiet_one', 'JP');

CREATE TABLE plays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listener_id INTEGER NOT NULL REFERENCES listeners(id),
  track_id INTEGER NOT NULL REFERENCES tracks(id),
  played_at TEXT NOT NULL
);

INSERT INTO plays (listener_id, track_id, played_at) VALUES
  (1, 2, '2025-03-01T10:00:00'), (1, 7, '2025-03-01T10:05:00'),
  (2, 4, '2025-03-02T08:00:00'), (3, 6, '2025-03-02T20:00:00'),
  (4, 5, '2025-03-03T12:00:00'), (1, 3, '2025-03-03T18:00:00');
