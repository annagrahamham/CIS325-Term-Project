import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const db = new sqlite3.Database(path.join(__dirname, '../../events.db'), (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    return;
  }

  console.log('Connected to database');
  db.run('PRAGMA foreign_keys = ON;');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Users (
    UserID_PK INTEGER PRIMARY KEY,
    FirstName TEXT,
    LastName TEXT,
    Email TEXT UNIQUE,
    PhoneNumber TEXT,
    Password TEXT,
    Role TEXT,
    Major TEXT
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS Organizations (
    OrganizationID_PK INTEGER PRIMARY KEY,
    OrganizationName TEXT,
    Description TEXT,
    PrimaryOrganizerID_FK INTEGER REFERENCES Users(UserID_PK),
    ContactEmail TEXT,
    ContactPhone TEXT
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS Followers (
    FollowerID_PK INTEGER PRIMARY KEY,
    UserID_FK INTEGER REFERENCES Users(UserID_PK),
    OrganizationID_FK INTEGER REFERENCES Organizations(OrganizationID_PK)
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS Events (
    EventID_PK INTEGER PRIMARY KEY,
    OrganizationID_FK INTEGER REFERENCES Organizations(OrganizationID_PK),
    EventName TEXT,
    EventType TEXT,
    Description TEXT,
    Location TEXT,
    StartTime DATETIME,
    EndTime DATETIME
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS CheckIns (
    CheckID_PK INTEGER PRIMARY KEY,
    UserID_FK INTEGER REFERENCES Users(UserID_PK),
    EventID_FK INTEGER REFERENCES Events(EventID_PK)
  );`);
});
