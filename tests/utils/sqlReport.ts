import type { QueryResult } from './sqlDatabase';

const escape = (v: unknown) =>
  String(v ?? 'NULL').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** A self-contained HTML page showing the SQL and its result grid, used for screenshots. */
export function renderQueryResultHtml(name: string, sql: string, result: QueryResult): string {
  const header = result.columns.map((c) => `<th>${escape(c)}</th>`).join('');
  const body = result.rows
    .map((r) => `<tr>${result.columns.map((c) => `<td>${escape(r[c])}</td>`).join('')}</tr>`)
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; margin: 24px; color: #111827; background: #fff; }
    h1 { font-size: 18px; margin: 0 0 12px; }
    pre { background: #0f172a; color: #e2e8f0; padding: 14px 16px; border-radius: 8px; font-size: 12px; line-height: 1.45; overflow: hidden; }
    table { border-collapse: collapse; font-size: 13px; margin-top: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; white-space: nowrap; }
    th { background: #f3f4f6; }
    .meta { color: #6b7280; font-size: 12px; margin-top: 8px; }
  </style></head><body>
    <h1>${escape(name)}.sql — SQLite (sql.js)</h1>
    <pre>${escape(sql.trim())}</pre>
    <table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>
    <p class="meta">${result.rows.length} row(s)</p>
  </body></html>`;
}
