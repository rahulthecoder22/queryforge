PRAGMA foreign_keys = ON;

CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

INSERT INTO departments (code, name) VALUES ('CS', 'Computer Science'), ('MATH', 'Mathematics'),
  ('ENG', 'English');

CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dept_id INTEGER NOT NULL REFERENCES departments(id),
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  credits INTEGER NOT NULL
);

INSERT INTO courses (dept_id, code, title, credits) VALUES
  (1, 'CS101', 'Intro Data', 3), (1, 'CS220', 'Databases', 4), (2, 'MATH120', 'Calculus I', 4),
  (3, 'ENG110', 'Composition', 3), (1, 'CS330', 'Analytics', 3);

CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_no TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gpa REAL NOT NULL
);

INSERT INTO students (student_no, first_name, last_name, gpa) VALUES
  ('S1001', 'Lee', 'Kim', 3.6), ('S1002', 'Mo', 'Ali', 3.2), ('S1003', 'Jo', 'Patel', 3.9),
  ('S1004', 'Ray', 'Chen', 2.8), ('S1005', 'Sky', 'Brown', 3.5);

CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  term TEXT NOT NULL,
  grade TEXT
);

INSERT INTO enrollments (student_id, course_id, term, grade) VALUES
  (1, 1, '2024FA', 'A'), (1, 2, '2025SP', NULL), (2, 1, '2024FA', 'B'),
  (3, 2, '2025SP', NULL), (3, 5, '2025SP', NULL), (4, 3, '2024FA', 'C'),
  (5, 4, '2024FA', 'B+'), (2, 3, '2025SP', NULL);
