PRAGMA foreign_keys = ON;

CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  floor INTEGER NOT NULL
);

INSERT INTO departments (name, floor) VALUES
  ('Emergency', 1), ('Cardiology', 3), ('Pediatrics', 2), ('Radiology', 4), ('Oncology', 5);

CREATE TABLE doctors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialty TEXT NOT NULL
);

INSERT INTO doctors (department_id, first_name, last_name, specialty) VALUES
  (1, 'Sam', 'Rivera', 'Trauma'), (2, 'Kim', 'Nguyen', 'Heart failure'),
  (2, 'Alex', 'Petrov', 'Interventional'), (3, 'Jordan', 'Lee', 'General'),
  (4, 'Taylor', 'Brooks', 'MRI'), (5, 'Riley', 'Morgan', 'Medical oncology');

CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_year INTEGER NOT NULL,
  registration_date TEXT NOT NULL
);

INSERT INTO patients (first_name, last_name, birth_year, registration_date) VALUES
  ('Elena', 'Martinez', 1990, '2024-06-01'), ('James', 'Cook', 1965, '2024-07-12'),
  ('Sofia', 'Ibrahim', 2012, '2024-08-03'), ('Noah', 'Park', 1988, '2024-01-15'),
  ('Mia', 'Walker', 1972, '2023-11-20'), ('Lucas', 'Garcia', 2001, '2024-09-05'),
  ('Harper', 'Singh', 1958, '2024-02-28'), ('Ben', 'Okafor', 1995, '2024-10-10');

CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id),
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  appointment_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('scheduled','completed','cancelled','no_show'))
);

INSERT INTO appointments (patient_id, doctor_id, appointment_date, status) VALUES
  (1, 2, '2025-04-01', 'completed'), (2, 1, '2025-04-02', 'scheduled'),
  (3, 4, '2025-04-03', 'completed'), (4, 3, '2025-04-04', 'cancelled'),
  (5, 5, '2025-04-05', 'scheduled'), (6, 2, '2025-04-06', 'completed'),
  (7, 6, '2025-04-07', 'no_show'), (1, 4, '2025-04-08', 'scheduled'),
  (8, 1, '2025-04-09', 'completed'), (2, 5, '2025-04-10', 'scheduled');
