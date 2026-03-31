-- QueryForge sample: World 1 — The Data Village
PRAGMA foreign_keys = ON;

CREATE TABLE occupations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL
);

INSERT INTO occupations (title, category) VALUES
  ('Teacher', 'Education'),
  ('Farmer', 'Agriculture'),
  ('Nurse', 'Healthcare'),
  ('Baker', 'Food'),
  ('Mechanic', 'Trade'),
  ('Librarian', 'Education'),
  ('Chef', 'Food'),
  ('Plumber', 'Trade');

CREATE TABLE houses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT NOT NULL,
  street TEXT NOT NULL,
  built_year INTEGER NOT NULL
);

INSERT INTO houses (address, street, built_year) VALUES
  ('12', 'Main St', 1985),
  ('45', 'Oak Ave', 1992),
  ('3', 'Elm Rd', 2001),
  ('88', 'Main St', 1978),
  ('7', 'Cedar Ln', 2010),
  ('22', 'Oak Ave', 1999),
  ('101', 'River Rd', 1965),
  ('5', 'Main St', 2005);

CREATE TABLE residents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  house_id INTEGER REFERENCES houses(id),
  occupation_id INTEGER REFERENCES occupations(id)
);

INSERT INTO residents (first_name, last_name, age, house_id, occupation_id) VALUES
  ('Elena', 'Martinez', 34, 1, 1),
  ('James', 'Nguyen', 17, 2, NULL),
  ('Sofia', 'Patel', 72, 3, 3),
  ('Marcus', 'Lee', 8, 4, NULL),
  ('Ava', 'Johnson', 29, 5, 4),
  ('Noah', 'Williams', 45, 6, 5),
  ('Mia', 'Brown', 66, 7, 6),
  ('Lucas', 'Davis', 41, 8, 7),
  ('Isabella', 'Garcia', 19, 1, NULL),
  ('Ethan', 'Miller', 55, 2, 2),
  ('Charlotte', 'Wilson', 3, 3, NULL),
  ('Benjamin', 'Moore', 38, 4, 8),
  ('Amelia', 'Taylor', 24, 5, 1),
  ('Henry', 'Anderson', 50, 6, 2),
  ('Harper', 'Thomas', 77, 7, 3),
  ('Jack', 'Jackson', 12, 8, NULL),
  ('Evelyn', 'White', 31, 1, 4),
  ('Daniel', 'Harris', 62, 2, 5),
  ('Abigail', 'Martin', 9, 3, NULL),
  ('Matthew', 'Thompson', 48, 4, 7),
  ('Emily', 'Garcia', 27, 5, 6),
  ('David', 'Martinez', 59, 6, 8),
  ('Elizabeth', 'Robinson', 15, 7, NULL),
  ('Joseph', 'Clark', 33, 8, 1),
  ('Samantha', 'Lewis', 70, 1, 3),
  ('Andrew', 'Walker', 22, 2, NULL),
  ('Jessica', 'Young', 36, 3, 4),
  ('Ryan', 'King', 44, 4, 5),
  ('Lauren', 'Wright', 6, 5, NULL),
  ('Nathan', 'Lopez', 52, 6, 2),
  ('Grace', 'Hill', 40, 7, 7),
  ('Victor', 'Stone', 28, 2, 5),
  ('Priya', 'Shah', 51, 4, 2),
  ('Owen', 'Bell', 14, 6, NULL),
  ('Nina', 'Cole', 39, 8, 4),
  ('Felix', 'Grant', 61, 3, 3),
  ('Ruby', 'Adams', 7, 5, NULL),
  ('Caleb', 'Scott', 44, 1, 8),
  ('Diana', 'Price', 26, 7, 1),
  ('Marcus', 'Ward', 19, 2, NULL),
  ('Helen', 'Fox', 58, 4, 5),
  ('Isaac', 'Reed', 32, 6, 7);

CREATE TABLE pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  resident_id INTEGER NOT NULL REFERENCES residents(id)
);

INSERT INTO pets (name, species, resident_id) VALUES
  ('Mittens', 'cat', 1),
  ('Rex', 'dog', 5),
  ('Coco', 'dog', 10),
  ('Snowball', 'rabbit', 14),
  ('Blue', 'bird', 20),
  ('Shadow', 'cat', 25),
  ('Maple', 'dog', 28),
  ('Pepper', 'cat', 33),
  ('Duke', 'dog', 36),
  ('Luna', 'cat', 9);
