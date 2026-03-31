PRAGMA foreign_keys = ON;

CREATE TABLE teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  plan TEXT NOT NULL CHECK(plan IN ('free','pro','enterprise'))
);

INSERT INTO teams (name, plan) VALUES
  ('Acme Labs', 'pro'), ('Beta Co', 'free'), ('Gamma Inc', 'enterprise'),
  ('Delta Team', 'pro');

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL REFERENCES teams(id),
  email TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL
);

INSERT INTO users (team_id, email, created_at) VALUES
  (1, 'u1@acme.com', '2024-01-01'), (1, 'u2@acme.com', '2024-02-10'),
  (2, 'solo@beta.com', '2024-03-05'), (3, 'boss@gamma.com', '2023-11-01'),
  (3, 'eng@gamma.com', '2023-11-15'), (4, 'lead@delta.com', '2024-06-20');

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  event_name TEXT NOT NULL,
  event_time TEXT NOT NULL,
  props_json TEXT
);

INSERT INTO events (user_id, event_name, event_time, props_json) VALUES
  (1, 'login', '2025-03-01T08:00:00', NULL), (1, 'export', '2025-03-01T09:00:00', '{"rows":120}'),
  (2, 'login', '2025-03-02T10:00:00', NULL), (3, 'signup', '2025-03-01T12:00:00', NULL),
  (4, 'billing_upgrade', '2025-03-03T07:00:00', NULL), (5, 'login', '2025-03-03T08:30:00', NULL),
  (6, 'query_run', '2025-03-04T11:00:00', '{"ms":42}'), (1, 'query_run', '2025-03-04T15:00:00', '{"ms":12}');

CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL REFERENCES teams(id),
  mrr REAL NOT NULL,
  started TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

INSERT INTO subscriptions (team_id, mrr, started, active) VALUES
  (1, 299, '2024-01-01', 1), (2, 0, '2024-03-05', 1), (3, 2500, '2023-11-01', 1), (4, 299, '2024-06-20', 1);
