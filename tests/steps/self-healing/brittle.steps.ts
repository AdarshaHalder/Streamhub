import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures';
import { BrittleCalculatorPage } from '../../pages/legacy/BrittleCalculatorPage';

// Created per step from `page`; the legacy page object holds no state worth sharing.
const legacy = (page: import('@playwright/test').Page) => new BrittleCalculatorPage(page);

Given('I open the calculator using the legacy page object', async ({ page }) => {
  await legacy(page).open();
});

When('I type {int} into the legacy amount field', async ({ page }, amount: number) => {
  await legacy(page).enterAmount(amount);
});

Then('the legacy amount field should contain {int}', async ({ page }, amount: number) => {
  await expect(legacy(page).amountInput).toHaveValue(String(amount));
});

When('I type {float} into the legacy interest rate field', async ({ page }, rate: number) => {
  await legacy(page).enterRate(rate);
});

When('I click the legacy Calculate button', async ({ page }) => {
  await legacy(page).calculate();
});

Then('the legacy EMI result should show a rupee amount', async ({ page }) => {
  expect(await legacy(page).emiText()).toMatch(/₹[\d,]+/);
});

Then('the legacy total interest result should show a rupee amount', async ({ page }) => {
  expect(await legacy(page).totalInterestText()).toMatch(/₹[\d,]+/);
});
