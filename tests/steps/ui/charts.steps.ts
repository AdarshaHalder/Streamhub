import { expect } from '@playwright/test';
import { When, Then } from '../fixtures';
import { expectedBreakdown, expectedCalendarYears, expectedYearlySchedule, type LoanInput } from '../../utils/emi';
import { parseCurrency } from '../../utils/format';

When('I change the schedule start month to {string}', async ({ calculatorPage, ctx }, month: string) => {
  await calculatorPage.setStartMonth(month);
  ctx.startMonth = month;
});

Then('the break-up pie chart should be visible', async ({ calculatorPage }) => {
  await calculatorPage.breakupPie.expectRendered();
  await expect(calculatorPage.breakupPie.slices).toHaveCount(2);
});

Then('both pie chart slices should have values greater than zero', async ({ calculatorPage }) => {
  for (const slice of await calculatorPage.breakupPie.readSlices()) {
    expect(slice.value, `${slice.label} value`).toBeGreaterThan(0);
    expect(slice.percent, `${slice.label} share`).toBeGreaterThan(0);
    expect(slice.area, `${slice.label} rendered area`).toBeGreaterThan(0);
  }
});

Then('the pie chart slices should equal the principal and my calculated total interest', async ({ calculatorPage, ctx }) => {
  const loan = ctx.loan as LoanInput;
  const slices = await calculatorPage.breakupPie.readSlices();
  const byLabel = Object.fromEntries(slices.map((s) => [s.label, s]));
  expect(byLabel['Principal Loan Amount'].value).toBe(loan.principal);
  expect(byLabel['Total Interest'].value).toBe(expectedBreakdown(loan).totalInterest);
  expect(slices.reduce((s, x) => s + x.percent, 0)).toBeCloseTo(100, 1);
});

Then('the pie chart legend should show the same values as the slices', async ({ calculatorPage }) => {
  for (const slice of await calculatorPage.breakupPie.readSlices()) {
    expect(parseCurrency(await calculatorPage.breakupPie.legendValueFor(slice.label))).toBe(slice.value);
  }
});

Then('the yearly bar chart should be visible', async ({ calculatorPage }) => {
  await calculatorPage.scheduleChart.expectRendered();
});

Then('the bar chart should have one bar per calendar year of the schedule', async ({ calculatorPage, ctx }) => {
  const loan = ctx.loan as LoanInput;
  const start = ctx.startMonth as string;
  const expectedCount = expectedCalendarYears(loan.tenureYears, start);
  const firstYear = Number(start.slice(0, 4));

  await expect(calculatorPage.scheduleChart.bars).toHaveCount(expectedCount);
  expect(await calculatorPage.scheduleChart.years()).toEqual(
    Array.from({ length: expectedCount }, (_, i) => firstYear + i),
  );
  await expect(calculatorPage.scheduleRows).toHaveCount(expectedCount);
});

Then('every bar should have non-zero principal and interest', async ({ calculatorPage }) => {
  const bars = await calculatorPage.scheduleChart.bars.all();
  expect(bars.length).toBeGreaterThan(0);
  for (const bar of bars) {
    const year = await bar.getAttribute('data-year');
    expect(Number(await bar.getAttribute('data-principal')), `${year} principal`).toBeGreaterThan(0);
    expect(Number(await bar.getAttribute('data-interest')), `${year} interest`).toBeGreaterThan(0);
    const box = await bar.boundingBox();
    expect(box?.height ?? 0, `${year} bar height`).toBeGreaterThan(0);
  }
});

Then("the bars' principal should add up to the loan amount", async ({ calculatorPage, ctx }) => {
  const loan = ctx.loan as LoanInput;
  const principals = await calculatorPage.scheduleChart.bars.evaluateAll((els) =>
    els.map((e) => Number(e.getAttribute('data-principal'))),
  );
  const total = principals.reduce((s, p) => s + p, 0);
  // Each year is rounded independently, so allow ±1 rupee per bar.
  expect(Math.abs(total - loan.principal)).toBeLessThanOrEqual(principals.length);
});

When('I hover over the bar for {int}', async ({ calculatorPage, ctx }, year: number) => {
  ctx.tooltip = await calculatorPage.scheduleChart.hoverYear(year);
});

Then(
  'the tooltip should show the {int} principal, interest and balance from my own schedule',
  async ({ ctx }, year: number) => {
    const expected = expectedYearlySchedule(ctx.loan as LoanInput, ctx.startMonth as string).find((r) => r.year === year);
    expect(expected, `my schedule has a row for ${year}`).toBeDefined();
    expect(ctx.tooltip).toEqual(expected);
  },
);
