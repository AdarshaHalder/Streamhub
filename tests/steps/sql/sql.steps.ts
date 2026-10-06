import fs from 'node:fs';
import path from 'node:path';
import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { Given, When, Then } from '../fixtures';
import { readSql, SQL_ROOT, type QueryResult } from '../../utils/sqlDatabase';
import { renderQueryResultHtml } from '../../utils/sqlReport';

Given('the {string} database is loaded with its seed data', async ({ sqlDb, ctx }, name: string) => {
  sqlDb.runFile('schema', name);
  sqlDb.runFile('seed', name);
  ctx.dataset = name;
});

When('I run the {string} query', async ({ sqlDb, ctx, $testInfo }, name: string) => {
  ctx.queryName = name;
  ctx.result = sqlDb.query(name);
  await $testInfo.attach(`${name}.sql`, { body: readSql('queries', name), contentType: 'text/plain' });
});

/** Compares only the columns named in the table; numbers are compared numerically. */
Then('the query should return exactly these rows:', async ({ ctx }, table: DataTable) => {
  const result = ctx.result as QueryResult;
  const expected = table.hashes();
  const columns = Object.keys(expected[0]);
  const normalise = (v: unknown) => (v !== null && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : v);
  const project = (row: Record<string, unknown>) => Object.fromEntries(columns.map((c) => [c, normalise(row[c])]));

  for (const c of columns) expect(result.columns, `result has column ${c}`).toContain(c);
  expect(result.rows.map(project)).toEqual(expected.map(project));
});

Then(/^none of these transactions should be reported: (.+)$/, async ({ ctx }, ids: string) => {
  const reported = new Set(
    (ctx.result as QueryResult).rows.flatMap((r) => [Number(r.outbound_txn_id), Number(r.return_txn_id)]),
  );
  for (const id of ids.split(',').map((s) => Number(s.trim()))) {
    expect(reported.has(id), `transaction ${id} must not be part of a round trip`).toBe(false);
  }
});

Then(/^these players should not appear in the results: (.+)$/, async ({ ctx }, names: string) => {
  const reported = (ctx.result as QueryResult).rows.map((r) => r.player_name);
  for (const name of names.split(',').map((s) => s.trim())) expect(reported).not.toContain(name);
});

Then('I save a screenshot of the query output', async ({ page, ctx, $testInfo }) => {
  const name = ctx.queryName as string;
  await page.setViewportSize({ width: 1400, height: 400 });
  await page.setContent(renderQueryResultHtml(name, readSql('queries', name), ctx.result as QueryResult));
  const file = path.join(SQL_ROOT, 'results', `${name}.png`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const png = await page.screenshot({ path: file, fullPage: true });
  await $testInfo.attach(`${name}-output.png`, { body: png, contentType: 'image/png' });
});
