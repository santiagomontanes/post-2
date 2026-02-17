import Database from 'better-sqlite3';
import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { runMigrations, seedDefaultAdmin } from './migrations';

let dbInstance: Database.Database | null = null;

export const getDbPath = (): string => {
  const dir = path.join(app.getPath('userData'), 'data');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'sistetecni-pos.db');
};

export const getDb = (): Database.Database => {
  if (!dbInstance) {
    dbInstance = new Database(getDbPath());
    dbInstance.pragma('journal_mode = WAL');
    runMigrations(dbInstance);
    seedDefaultAdmin(dbInstance);
  }
  return dbInstance;
};
