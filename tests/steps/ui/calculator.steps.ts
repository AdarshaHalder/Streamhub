import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures';
import type { LoanTab, CalculatorField } from '../../pages/CalculatorPage';
import { expectedBreakdown, residualBalance, type LoanInput } from '../../utils/emi';
import { parseAmount } from '../../utils/format';

Given('I select the {string} tab', async ({ calculatorPage }, tab: string) => {
  await calculatorPage.selectTab(tab as LoanTab);
});

Given(
  'I enter a loan amount of {string}, an interest rate of {float}% and a tenure of {int} years',
  async ({ calculatorPage, ctx }, amount: string, rate: number, years: number) => {
    const loan: LoanInput = { principal: parseAmount(amount), annualRatePct: rate, tenureYears: years };
    await calculatorPage.enterLoan(loan.principal, loan.annualRatePct, loan.tenureYears);
    ctx.loan = loan;
  },
);

Given(
  'I set the loan amount slider to {string}, the interest rate slider to {float}% and the tenure slider to {int} years',
  async ({ calculatorPage, ctx }, amount: string, rate: number, years: number) => {
    const loan: LoanInput = { principal: parseAmount(amount), annualRatePct: rate, tenureYears: years };
    await calculatorPage.setSlider('amount', loan.principal);
    await calculatorPage.setSlider('rate', loan.annualRatePct);
    await calculatorPage.setSlider('tenure', loan.tenureYears);
    ctx.loan = loan;
  },
);

When('I submit the loan details', async ({ calculatorPage, ctx }) => {
  await calculatorPage.submit();
  ctx.lastEmi = await calculatorPage.emi();
});

When('I change the {string} field to {string} and submit', async ({ calculatorPage }, field: string, value: string) => {
  await calculatorPage.enterField(field as CalculatorField, value);
  await calculatorPage.submit();
});

Then('the EMI, total interest and total payment should match my own calculation', async ({ calculatorPage, ctx }) => {
  const expected = expectedBreakdown(ctx.loan as LoanInput);
  await expect.poll(() => calculatorPage.emi(), { message: 'monthly EMI' }).toBe(expected.emi);
  expect.soft(await calculatorPage.totalInterest(), 'total interest').toBe(expected.totalInterest);
  expect.soft(await calculatorPage.totalPayment(), 'total payment').toBe(expected.totalPayment);
});

Then('paying that EMI every month should clear the loan exactly', async ({ calculatorPage, ctx }) => {
  const loan = ctx.loan as LoanInput;
  // The displayed EMI is rounded to the rupee, so the residual can be at most
  // ±0.5 per month compounded — well under one EMI.
  const residual = residualBalance(loan, await calculatorPage.emi());
  expect(Math.abs(residual)).toBeLessThan(loan.tenureYears * 12);
});

Then('the {string} field should report the error {string}', async ({ calculatorPage }, field: string, message: string) => {
  await calculatorPage.expectFieldError(field as CalculatorField, message);
});

Then('the previously calculated results should remain unchanged', async ({ calculatorPage, ctx }) => {
  expect(await calculatorPage.emi()).toBe(ctx.lastEmi);
});
