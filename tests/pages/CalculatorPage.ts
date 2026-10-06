import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { PieChart } from './components/PieChart';
import { BarChart } from './components/BarChart';
import { parseCurrency } from '../utils/format';

export type LoanTab = 'Home Loan' | 'Personal Loan' | 'Car Loan';
export type CalculatorField = 'amount' | 'rate' | 'tenure';

export class CalculatorPage extends BasePage {
  protected readonly path = '/calculator';
  readonly form: Locator;
  readonly amountInput: Locator;
  readonly rateInput: Locator;
  readonly tenureInput: Locator;
  readonly startMonthInput: Locator;
  readonly calculateButton: Locator;
  readonly results: Locator;
  readonly breakupPie: PieChart;
  readonly scheduleChart: BarChart;
  readonly scheduleRows: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.getByRole('form', { name: 'Loan details' });
    // Label text changes per tab ("Home Loan Amount", "Car Loan Amount"), so match the stable suffix.
    this.amountInput = this.form.getByRole('spinbutton', { name: /Loan Amount/ });
    this.rateInput = this.form.getByRole('spinbutton', { name: 'Interest Rate' });
    this.tenureInput = this.form.getByRole('spinbutton', { name: 'Loan Tenure' });
    this.startMonthInput = this.form.getByLabel('Schedule showing EMI payments starting from');
    this.calculateButton = this.form.getByRole('button', { name: 'Calculate' });
    this.results = page.getByRole('region', { name: 'Results' });
    this.breakupPie = new PieChart(this.results);
    const schedule = page.getByRole('region', { name: 'Yearly payment schedule' });
    this.scheduleChart = new BarChart(schedule);
    this.scheduleRows = schedule.getByRole('table').getByTestId('schedule-row');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toHaveText('EMI Calculator');
    await expect(this.page.locator('body')).toHaveAttribute('data-state', 'calculated');
  }

  async selectTab(tab: LoanTab): Promise<void> {
    const tabButton = this.page.getByRole('tab', { name: tab });
    await tabButton.click();
    await expect(tabButton).toHaveAttribute('aria-selected', 'true');
  }

  private inputFor(field: CalculatorField): Locator {
    return { amount: this.amountInput, rate: this.rateInput, tenure: this.tenureInput }[field];
  }

  async enterLoan(amount: number, ratePct: number, tenureYears: number): Promise<void> {
    await this.amountInput.fill(String(amount));
    await this.rateInput.fill(String(ratePct));
    await this.tenureInput.fill(String(tenureYears));
  }

  async enterField(field: CalculatorField, value: string): Promise<void> {
    await this.inputFor(field).fill(value);
  }

  sliderFor(field: CalculatorField): Locator {
    const name = { amount: /Loan Amount/, rate: 'Interest Rate', tenure: 'Loan Tenure' }[field];
    return this.form.getByRole('slider', { name });
  }

  /**
   * Moves a slider the way a user would: click near the target position on the
   * track, then nudge with arrow keys until the exact value is reached.
   */
  async setSlider(field: CalculatorField, target: number): Promise<void> {
    const slider = this.sliderFor(field);
    const [min, max, step] = await Promise.all(
      ['min', 'max', 'step'].map(async (attr) => Number(await slider.getAttribute(attr))),
    );
    if (target < min || target > max) throw new Error(`${field} slider target ${target} outside [${min}, ${max}]`);

    const box = await slider.boundingBox();
    if (!box) throw new Error(`${field} slider is not visible`);
    await slider.click({ position: { x: ((target - min) / (max - min)) * box.width, y: box.height / 2 } });

    for (let guard = 0; guard < 500; guard++) {
      const current = Number(await slider.inputValue());
      const stepsAway = Math.round((target - current) / step);
      if (stepsAway === 0) break;
      await slider.press(stepsAway > 0 ? 'ArrowRight' : 'ArrowLeft');
    }
    await expect(slider).toHaveValue(String(target));
    await expect(this.inputFor(field)).toHaveValue(String(target));
  }

  async setStartMonth(yyyyMm: string): Promise<void> {
    await this.startMonthInput.fill(yyyyMm);
    // Commit the value the way a user does (leaving the field fires "change").
    await this.startMonthInput.blur();
    await expect(this.scheduleChart.bars.first()).toHaveAttribute('data-year', yyyyMm.slice(0, 4));
  }

  async submit(): Promise<void> {
    await this.calculateButton.click();
  }

  async emi(): Promise<number> {
    return parseCurrency(await this.results.getByTestId('result-emi').textContent());
  }

  async totalInterest(): Promise<number> {
    return parseCurrency(await this.results.getByTestId('result-interest').textContent());
  }

  async totalPayment(): Promise<number> {
    return parseCurrency(await this.results.getByTestId('result-total').textContent());
  }

  /** Errors are linked to inputs via aria-describedby, so we assert on what a screen reader announces. */
  async expectFieldError(field: CalculatorField, message: string | RegExp): Promise<void> {
    const input = this.inputFor(field);
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(message);
  }
}
