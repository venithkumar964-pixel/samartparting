-- Smart Parking database schema.

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  phone         TEXT    NOT NULL,
  password_hash TEXT    NOT NULL,
  vehicle_number TEXT   NOT NULL,
  vehicle_type  TEXT    NOT NULL CHECK (vehicle_type IN ('car', 'bike', 'ev')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
