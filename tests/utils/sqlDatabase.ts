import fs from 'node:fs';
import path from 'node:path';
import initSqlJs, { type Database } from 'sql.js';

export const SQL_ROOT = path.resolve(__dirname, '../../sql');

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
}

/**
 * In-memory SQLite (sql.js / WebAssembly) — no native install needed, so the SQL
 * scenarios run identically on macOS, Linux, Windows and CI.
 */
export class SqlDatabase {
  private constructor(private readonly db: Database) {}

  static async create(): Promise<SqlDatabase> {
    const SQL = await initSqlJs();
    return new SqlDatabase(new SQL.Database());
  }

  /** Runs a .sql file from sql/<dir>/<name>.sql (schema / seed). */
  runFile(dir: string, name: string): void {
    this.db.run(readSql(dir, name));
  }

  /** Executes sql/queries/<name>.sql and returns the last statement's rows. */
  query(name: string): QueryResult {
    return this.select(readSql('queries', name));
  }

  select(sql: string): QueryResult {
    const results = this.db.exec(sql);
    const last = results.at(-1);
    if (!last) return { columns: [], rows: [] };
    return {
      columns: last.columns,
      rows: last.values.map((values) => Object.fromEntries(last.columns.map((c, i) => [c, values[i]]))),
    };
  }

  close(): void {
    this.db.close();
  }
}

export function readSql(dir: string, name: string): string {
  return fs.readFileSync(path.join(SQL_ROOT, dir, `${name}.sql`), 'utf8');
}
