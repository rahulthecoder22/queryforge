PRAGMA foreign_keys = ON;

CREATE TABLE teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  region TEXT NOT NULL
);

INSERT INTO teams (name, region) VALUES ('Nova Fox', 'NA'), ('Tiger Byte', 'APAC'),
  ('Frost Line', 'EU'), ('Pixel Storm', 'NA');

CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL REFERENCES teams(id),
  handle TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  mmr INTEGER NOT NULL
);

INSERT INTO players (team_id, handle, role, mmr) VALUES
  (1, 'blink', 'carry', 4200), (1, 'shade', 'support', 3900),
  (2, 'volt', 'mid', 4500), (2, 'nano', 'carry', 4100),
  (3, 'ice9', 'support', 4000), (4, 'flux', 'carry', 4300);

CREATE TABLE matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_a_id INTEGER NOT NULL REFERENCES teams(id),
  team_b_id INTEGER NOT NULL REFERENCES teams(id),
  played_at TEXT NOT NULL,
  winner_team_id INTEGER NOT NULL REFERENCES teams(id)
);

INSERT INTO matches (team_a_id, team_b_id, played_at, winner_team_id) VALUES
  (1, 2, '2025-03-01T20:00:00', 2), (3, 4, '2025-03-02T20:00:00', 3),
  (1, 4, '2025-03-03T20:00:00', 1), (2, 3, '2025-03-04T20:00:00', 2),
  (1, 3, '2025-03-05T20:00:00', 3);

CREATE TABLE player_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL REFERENCES matches(id),
  player_id INTEGER NOT NULL REFERENCES players(id),
  kills INTEGER NOT NULL,
  deaths INTEGER NOT NULL,
  assists INTEGER NOT NULL
);

INSERT INTO player_stats (match_id, player_id, kills, deaths, assists) VALUES
  (1, 1, 8, 3, 10), (1, 2, 2, 5, 16), (1, 3, 12, 2, 8), (1, 4, 6, 6, 9),
  (2, 5, 4, 4, 20), (2, 6, 15, 4, 6), (3, 1, 10, 2, 7), (3, 6, 5, 7, 12);
