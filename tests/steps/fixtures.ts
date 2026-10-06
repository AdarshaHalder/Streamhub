import { test as base, createBdd } from 'playwright-bdd';
import { DashboardPage } from '../pages/DashboardPage';
import { CalculatorPage } from '../pages/CalculatorPage';
import { PostsClient } from '../api/PostsClient';
import { SqlDatabase } from '../utils/sqlDatabase';
import { env } from '../../config/environment';

/** Per-scenario scratch space for values passed between steps. */
export interface ScenarioContext {
  [key: string]: unknown;
}

type Fixtures = {
  dashboardPage: DashboardPage;
  calculatorPage: CalculatorPage;
  postsApi: PostsClient;
  sqlDb: SqlDatabase;
  ctx: ScenarioContext;
};

export const test = base.extend<Fixtures>({
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  calculatorPage: async ({ page }, use) => use(new CalculatorPage(page)),
  postsApi: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: env.apiBaseUrl,
      extraHTTPHeaders: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
    await use(new PostsClient(request));
    await request.dispose();
  },
  sqlDb: async ({}, use) => {
    const db = await SqlDatabase.create();
    await use(db);
    db.close();
  },
  ctx: async ({}, use) => use({}),
});

export const { Given, When, Then, Before, After } = createBdd(test);
