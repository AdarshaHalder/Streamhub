import { expect, type Locator } from '@playwright/test';

export interface PieSlice {
  label: string;
  value: number;
  percent: number;
  area: number;
}

/** Wraps an SVG donut chart. Scoped to a container so multiple charts never collide. */
export class PieChart {
  readonly svg: Locator;
  readonly slices: Locator;
  readonly legendItems: Locator;

  constructor(readonly root: Locator) {
    this.svg = root.getByRole('img');
    this.slices = this.svg.getByTestId('pie-slice');
    this.legendItems = root.getByTestId('legend-item');
  }

  async expectRendered(): Promise<void> {
    await expect(this.svg).toBeVisible();
    await expect(this.slices.first()).toBeVisible();
  }

  /** Reads each slice's bound value plus its rendered on-screen area. */
  async readSlices(): Promise<PieSlice[]> {
    const count = await this.slices.count();
    const result: PieSlice[] = [];
    for (let i = 0; i < count; i++) {
      const slice = this.slices.nth(i);
      const box = await slice.boundingBox();
      result.push({
        label: (await slice.getAttribute('data-label')) ?? '',
        value: Number(await slice.getAttribute('data-value')),
        percent: Number(await slice.getAttribute('data-percent')),
        area: box ? box.width * box.height : 0,
      });
    }
    return result;
  }

  async legendValueFor(label: string): Promise<string> {
    return (await this.legendItems.filter({ hasText: label }).getByTestId('legend-value').textContent()) ?? '';
  }
}
