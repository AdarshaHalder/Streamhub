import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  protected abstract readonly path: string;
  readonly mainNav: Locator;
  readonly heading: Locator;

  constructor(readonly page: Page) {
    this.mainNav = page.getByRole('navigation', { name: 'Main' });
    this.heading = page.getByRole('heading', { level: 1 });
  }

  /** Relative path — resolved against BASE_URL from the active environment config. */
  async open(query = ''): Promise<void> {
    await this.page.goto(this.path + query);
  }

  async navigateVia(linkText: string): Promise<void> {
    await this.mainNav.getByRole('link', { name: linkText }).click();
  }

  async expectActiveNav(linkText: string): Promise<void> {
    await expect(this.mainNav.getByRole('link', { name: linkText })).toHaveAttribute('aria-current', 'page');
  }
}
