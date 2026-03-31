PRAGMA foreign_keys = ON;

CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  budget REAL NOT NULL
);

INSERT INTO departments (name, budget) VALUES ('Engineering', 2500000), ('Sales', 900000),
  ('HR', 400000), ('Finance', 600000);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  salary REAL NOT NULL,
  hire_date TEXT NOT NULL
);

INSERT INTO employees (department_id, first_name, last_name, salary, hire_date) VALUES
  (1, 'Nina', 'Park', 142000, '2019-04-01'), (1, 'Owen', 'Clark', 118000, '2021-08-15'),
  (2, 'Paula', 'Reed', 88000, '2020-01-10'), (2, 'Quinn', 'Stone', 92000, '2018-11-20'),
  (3, 'Rita', 'Ng', 76000, '2022-03-01'), (4, 'Steve', 'Ivy', 105000, '2017-06-01'),
  (1, 'Tara', 'Bloom', 135000, '2016-09-12'), (4, 'Uma', 'Klein', 99000, '2019-02-28');

CREATE TABLE time_off (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  start_date TEXT NOT NULL,
  days INTEGER NOT NULL,
  status TEXT NOT NULL
);

INSERT INTO time_off (employee_id, start_date, days, status) VALUES
  (1, '2025-04-01', 3, 'approved'), (2, '2025-04-10', 1, 'pending'),
  (3, '2025-03-15', 5, 'approved'), (5, '2025-05-01', 2, 'approved'),
  (7, '2025-06-01', 10, 'pending');
