PRAGMA foreign_keys = ON;

CREATE TABLE authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country TEXT NOT NULL
);

INSERT INTO authors (name, country) VALUES
  ('Octavia Chen', 'US'), ('Marco Ruiz', 'ES'), ('Ingrid Berg', 'SE'),
  ('Amara Okafor', 'NG'), ('Leo Nakamura', 'JP');

CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER NOT NULL REFERENCES authors(id),
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  pages INTEGER NOT NULL,
  published_year INTEGER NOT NULL
);

INSERT INTO books (author_id, title, genre, pages, published_year) VALUES
  (1, 'Query Patterns', 'Technical', 312, 2021), (1, 'Data Harbor', 'Fiction', 402, 2018),
  (2, 'Salt and Stars', 'Fiction', 288, 2019), (2, 'Cooking Coastal', 'Cooking', 190, 2022),
  (3, 'Northern Lights SQL', 'Technical', 356, 2020), (4, 'Lagos Echo', 'Fiction', 310, 2017),
  (5, 'Tokyo Nights', 'Mystery', 265, 2023), (1, 'Index Cards', 'Technical', 198, 2024),
  (3, 'Winter Ledger', 'Historical', 440, 2016), (4, 'River Code', 'Technical', 275, 2022);

CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  joined_date TEXT NOT NULL,
  city TEXT NOT NULL
);

INSERT INTO members (email, joined_date, city) VALUES
  ('ada@example.com', '2023-01-05', 'Boston'), ('lin@example.com', '2022-11-20', 'Seattle'),
  ('raj@example.com', '2024-02-14', 'Austin'), ('mia@example.com', '2021-08-01', 'Denver'),
  ('zoe@example.com', '2023-06-30', 'Portland'), ('eli@example.com', '2020-03-22', 'Chicago');

CREATE TABLE loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL REFERENCES books(id),
  member_id INTEGER NOT NULL REFERENCES members(id),
  loan_date TEXT NOT NULL,
  return_date TEXT
);

INSERT INTO loans (book_id, member_id, loan_date, return_date) VALUES
  (1, 1, '2025-01-10', '2025-02-01'), (3, 2, '2025-01-15', NULL),
  (5, 3, '2025-02-01', '2025-02-20'), (2, 1, '2025-02-10', NULL),
  (7, 4, '2025-01-05', '2025-01-28'), (4, 5, '2025-03-01', NULL),
  (6, 2, '2025-02-18', '2025-03-05'), (8, 6, '2025-03-10', NULL),
  (9, 3, '2024-12-01', '2025-01-10'), (10, 1, '2025-03-12', NULL);
