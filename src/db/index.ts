import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

const sqlite = new Database('sqlite.db');
sqlite.exec('PRAGMA journal_mode = WAL');
sqlite.exec('PRAGMA busy_timeout = 5000');
sqlite.exec('PRAGMA synchronous = OFF');
sqlite.exec('PRAGMA temp_store = MEMORY');
export const db = drizzle(sqlite, { schema });
