PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  joined TEXT NOT NULL
);

INSERT INTO users (username, joined) VALUES ('neo_wave', '2023-01-01'), ('pixel_cat', '2023-06-15'),
  ('data_duck', '2024-02-20'), ('sql_snake', '2024-08-01');

CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT INTO posts (user_id, body, created_at) VALUES
  (1, 'Learning joins today!', '2025-03-01T09:00:00'), (2, 'Coffee and CTEs', '2025-03-01T10:00:00'),
  (1, 'Window functions rock', '2025-03-02T11:00:00'), (3, 'NULL handling tips', '2025-03-02T15:00:00'),
  (4, 'Indexing thoughts', '2025-03-03T08:00:00'), (2, 'Weekend project', '2025-03-03T18:00:00');

CREATE TABLE follows (
  follower_id INTEGER NOT NULL REFERENCES users(id),
  followee_id INTEGER NOT NULL REFERENCES users(id),
  PRIMARY KEY (follower_id, followee_id)
);

INSERT INTO follows (follower_id, followee_id) VALUES (2, 1), (3, 1), (4, 2), (1, 3), (3, 2);

CREATE TABLE likes (
  user_id INTEGER NOT NULL REFERENCES users(id),
  post_id INTEGER NOT NULL REFERENCES posts(id),
  PRIMARY KEY (user_id, post_id)
);

INSERT INTO likes (user_id, post_id) VALUES (2, 1), (3, 1), (4, 1), (1, 2), (3, 2), (4, 3), (2, 4);
