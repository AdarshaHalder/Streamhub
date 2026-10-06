import { Given, When, Then } from '../fixtures';

Given('I open the portfolio dashboard', async ({ dashboardPage }) => {
  await dashboardPage.open();
});

Given('I open the EMI calculator', async ({ calculatorPage }) => {
  await calculatorPage.open();
  await calculatorPage.expectLoaded();
});

When('I navigate to {string} from the main menu', async ({ dashboardPage }, linkText: string) => {
  await dashboardPage.navigateVia(linkText);
});

Then('the {string} navigation link should be active', async ({ dashboardPage }, linkText: string) => {
  await dashboardPage.expectActiveNav(linkText);
});

Then('the portfolio dashboard should be displayed', async ({ dashboardPage }) => {
  await dashboardPage.expectLoaded();
});

Then('the EMI calculator should be displayed', async ({ calculatorPage }) => {
  await calculatorPage.expectLoaded();
});
