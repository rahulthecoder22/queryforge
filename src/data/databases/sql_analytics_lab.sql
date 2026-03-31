PRAGMA foreign_keys = ON;

-- Product-analytics style: cohort users + ordered activity stream
CREATE TABLE lab_users (
  id INTEGER PRIMARY KEY,
  handle TEXT NOT NULL,
  plan TEXT NOT NULL CHECK(plan IN ('free', 'pro', 'team'))
);

INSERT INTO lab_users (id, handle, plan) VALUES
  (1, 'alpha', 'pro'),
  (2, 'beta', 'free'),
  (3, 'gamma', 'pro'),
  (4, 'delta', 'team'),
  (5, 'epsilon', 'free');

CREATE TABLE activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES lab_users(id),
  evt_ts TEXT NOT NULL,
  evt_type TEXT NOT NULL,
  impact_usd INTEGER NOT NULL
);

INSERT INTO activity (user_id, evt_ts, evt_type, impact_usd) VALUES
  (1, '2025-01-01T10:00:00', 'signup', 0),
  (1, '2025-01-02T11:00:00', 'purchase', 120),
  (1, '2025-01-03T09:30:00', 'purchase', 45),
  (1, '2025-01-05T16:00:00', 'refund', -20),
  (1, '2025-01-06T08:00:00', 'purchase', 30),
  (2, '2025-01-01T12:00:00', 'signup', 0),
  (2, '2025-01-04T08:00:00', 'purchase', 200),
  (2, '2025-01-04T09:00:00', 'purchase', 15),
  (3, '2025-01-02T14:00:00', 'purchase', 80),
  (3, '2025-01-02T15:00:00', 'purchase', 40),
  (3, '2025-01-07T10:00:00', 'purchase', 60),
  (3, '2025-01-08T11:00:00', 'refund', -10),
  (4, '2025-01-05T10:00:00', 'signup', 0),
  (4, '2025-01-05T11:00:00', 'purchase', 300),
  (5, '2025-01-06T09:00:00', 'signup', 0),
  (5, '2025-01-09T12:00:00', 'purchase', 55),
  (5, '2025-01-09T13:00:00', 'purchase', 55),
  (2, '2025-01-10T10:00:00', 'purchase', 90),
  (1, '2025-01-10T14:00:00', 'purchase', 10);
