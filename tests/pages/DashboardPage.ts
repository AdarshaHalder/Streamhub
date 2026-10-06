import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { PieChart } from './components/PieChart';
import { parseCurrency } from '../utils/format';

export type DashboardStat = 'count' | 'principal' | 'emi' | 'interest';

export class DashboardPage extends BasePage {
  protected readonly path = '/';
  readonly typeFilter: Locator;
  readonly summary: Locator;
  readonly loansTable: Locator;
  readonly loanRows: Locator;
  readonly typePie: PieChart;

  constructor(page: Page) {
    super(page);
    this.typeFilter = page.getByRole('combobox', { name: 'Loan type' });
    this.summary = page.getByRole('region', { name: 'Portfolio summary' });
    this.loansTable = page.getByRole('table', { name: 'Loans' });
    this.loanRows = this.loansTable.getByTestId('loan-row');
    this.typePie = new PieChart(page.getByRole('region', { name: 'Principal by loan type' }));
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toHaveText('Portfolio Dashboard');
    await expect(this.page.locator('body')).toHaveAttribute('data-ready', 'true');
    await expect(this.summary).toBeVisible();
  }

  async filterByType(type: string): Promise<void> {
    await this.typeFilter.selectOption({ label: type });
  }

  async stat(name: DashboardStat): Promise<number> {
    return parseCurrency(await this.summary.getByTestId(`stat-${name}`).textContent());
  }

  /** Loan type column of every visible row, located by its column header text. */
  async visibleLoanTypes(): Promise<string[]> {
    const headers = await this.loansTable.getByRole('columnheader').allInnerTexts();
    const typeColumn = headers.indexOf('Type');
    const rows = await this.loanRows.all();
    return Promise.all(rows.map((row) => row.getByRole('cell').nth(typeColumn).innerText()));
  }
}
