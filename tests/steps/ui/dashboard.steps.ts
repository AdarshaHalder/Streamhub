import { expect } from '@playwright/test';
import { When, Then } from '../fixtures';
import { expectedBreakdown } from '../../utils/emi';

interface Loan {
  id: string;
  type: string;
  principal: number;
  annualRate: number;
  tenureYears: number;
}

/** Source data comes from the app's API (environment-agnostic); totals are computed here. */
async function fetchPortfolio(request: import('@playwright/test').APIRequestContext): Promise<Loan[]> {
  const response = await request.get('/api/loans');
  expect(response.ok()).toBeTruthy();
  return response.json();
}

When('I filter the dashboard by loan type {string}', async ({ dashboardPage }, type: string) => {
  await dashboardPage.filterByType(type);
});

Then('only {string} loans should be listed', async ({ dashboardPage, request }, type: string) => {
  const expectedCount = (await fetchPortfolio(request)).filter((l) => l.type === type).length;
  expect(expectedCount, `seed data should contain ${type} loans`).toBeGreaterThan(0);
  await expect(dashboardPage.loanRows).toHaveCount(expectedCount);
  expect(new Set(await dashboardPage.visibleLoanTypes())).toEqual(new Set([type]));
});

Then('the summary cards should match my own calculation for {string} loans', async ({ dashboardPage, request }, type: string) => {
  const loans = (await fetchPortfolio(request)).filter((l) => type === 'All' || l.type === type);
  const breakdowns = loans.map((l) =>
    expectedBreakdown({ principal: l.principal, annualRatePct: l.annualRate, tenureYears: l.tenureYears }),
  );
  const expected = {
    count: loans.length,
    principal: loans.reduce((s, l) => s + l.principal, 0),
    emi: breakdowns.reduce((s, b) => s + b.emi, 0),
    interest: breakdowns.reduce((s, b) => s + b.totalInterest, 0),
  };

  await expect.poll(() => dashboardPage.stat('count')).toBe(expected.count);
  expect.soft(await dashboardPage.stat('principal'), 'total principal').toBe(expected.principal);
  expect.soft(await dashboardPage.stat('emi'), 'monthly EMI collections').toBe(expected.emi);
  expect.soft(await dashboardPage.stat('interest'), 'total interest receivable').toBe(expected.interest);
});

Then('the loans table should list every loan in the portfolio', async ({ dashboardPage, request }) => {
  const loans = await fetchPortfolio(request);
  await expect(dashboardPage.loanRows).toHaveCount(loans.length);
  for (const loan of loans) {
    await expect(dashboardPage.loansTable.getByRole('row', { name: new RegExp(`^${loan.id}\\b`) })).toBeVisible();
  }
});

Then('the principal-by-type pie chart should render non-zero slices that match the portfolio', async ({ dashboardPage, request, page }) => {
  const type = new URL(page.url()).searchParams.get('type');
  const loans = (await fetchPortfolio(request)).filter((l) => !type || l.type === type);
  const expectedByType = new Map<string, number>();
  loans.forEach((l) => expectedByType.set(l.type, (expectedByType.get(l.type) ?? 0) + l.principal));

  await dashboardPage.typePie.expectRendered();
  const slices = await dashboardPage.typePie.readSlices();
  expect(slices).toHaveLength(expectedByType.size);
  for (const slice of slices) {
    expect(slice.value, `${slice.label} value`).toBeGreaterThan(0);
    expect(slice.area, `${slice.label} rendered area`).toBeGreaterThan(0);
    expect(slice.value, `${slice.label} principal`).toBe(expectedByType.get(slice.label));
  }
  expect(slices.reduce((s, x) => s + x.percent, 0)).toBeCloseTo(100, 1);
});
