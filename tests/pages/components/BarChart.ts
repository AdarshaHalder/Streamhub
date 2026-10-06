import { expect, type Locator } from '@playwright/test';
import { parseCurrency } from '../../utils/format';

export interface TooltipValues {
  year: number;
  principal: number;
  interest: number;
  balance: number;
}

export class BarChart {
  readonly svg: Locator;
  readonly bars: Locator;
  readonly tooltip: Locator;

  constructor(readonly root: Locator) {
    this.svg = root.getByRole('img');
    this.bars = this.svg.getByTestId('bar');
    this.tooltip = root.getByRole('tooltip');
  }

  async expectRendered(): Promise<void> {
    await expect(this.svg).toBeVisible();
    await expect(this.bars.first()).toBeVisible();
  }

  barForYear(year: number): Locator {
    return this.svg.locator(`[data-testid="bar"][data-year="${year}"]`);
  }

  async years(): Promise<number[]> {
    return (await this.bars.evaluateAll((els) => els.map((e) => e.getAttribute('data-year')))).map(Number);
  }

  async hoverYear(year: number): Promise<TooltipValues> {
    await this.barForYear(year).hover();
    await expect(this.tooltip).toBeVisible();
    return {
      year: Number(await this.tooltip.getByTestId('tooltip-year').textContent()),
      principal: parseCurrency(await this.tooltip.getByTestId('tooltip-principal').textContent()),
      interest: parseCurrency(await this.tooltip.getByTestId('tooltip-interest').textContent()),
      balance: parseCurrency(await this.tooltip.getByTestId('tooltip-balance').textContent()),
    };
  }
}
