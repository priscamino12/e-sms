import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'e-sms.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Local structured store standing in for the future REST API — same shape a server-backed
// `messages` resource would have, so swapping in a real backend later only touches this file.
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY NOT NULL,
          sender TEXT NOT NULL,
          body TEXT NOT NULL,
          received_at INTEGER NOT NULL,
          created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT
        );
      `);
      return db;
    });
  }
  return dbPromise;
}
