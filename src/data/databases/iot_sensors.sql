PRAGMA foreign_keys = ON;

CREATE TABLE sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL
);

INSERT INTO sites (name, lat, lon) VALUES ('Warehouse A', 45.52, -122.68), ('Greenhouse B', 37.77, -122.42),
  ('Cold Store C', 40.71, -74.01);

CREATE TABLE devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id),
  device_type TEXT NOT NULL,
  installed TEXT NOT NULL
);

INSERT INTO devices (site_id, device_type, installed) VALUES
  (1, 'temp', '2024-01-01'), (1, 'humidity', '2024-01-01'), (2, 'temp', '2024-02-10'),
  (2, 'light', '2024-02-10'), (3, 'temp', '2023-11-05'), (3, 'door', '2023-11-05');

CREATE TABLE readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER NOT NULL REFERENCES devices(id),
  ts TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL
);

INSERT INTO readings (device_id, ts, value, unit) VALUES
  (1, '2025-03-01T00:00:00', 18.2, 'C'), (1, '2025-03-01T06:00:00', 17.9, 'C'),
  (2, '2025-03-01T00:00:00', 55, 'pct'), (3, '2025-03-01T08:00:00', 22.1, 'C'),
  (4, '2025-03-01T08:00:00', 420, 'lux'), (5, '2025-03-01T12:00:00', 4.0, 'C'),
  (6, '2025-03-01T12:00:00', 1, 'open'), (1, '2025-03-02T00:00:00', 18.5, 'C');

CREATE TABLE alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER NOT NULL REFERENCES devices(id),
  alert_time TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL
);

INSERT INTO alerts (device_id, alert_time, severity, message) VALUES
  (5, '2025-03-01T14:00:00', 'high', 'Temp spike'), (6, '2025-03-01T15:00:00', 'med', 'Door open long');
