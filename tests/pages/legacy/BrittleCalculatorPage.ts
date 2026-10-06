import type { Locator, Page } from '@playwright/test';

/**
 * ⚠️  INTENTIONALLY BROKEN — AI self-healing exercise.
 *
 * This is how the calculator page object looked before it was rewritten with
 * role/label/test-id locators (see ../CalculatorPage.ts). Every selector below is
 * brittle and is LEFT BROKEN on purpose so that `npm run heal` has something to
 * detect, repair and validate. See self-healing/SELF_HEALING.md.
 *
 * Each entry records the *intent* of the locator and a semantic fingerprint
 * (expected role / accessible name). The fingerprint is never used to generate a
 * fix — only to validate one — so the healer can't "cheat" by reading the answer.
 */
export type AriaRole = Parameters<Page['getByRole']>[0];

export interface BrittleLocator {
  key: string;
  page: string;
  selector: string;
  /** Plain-language description of what this locator is supposed to find. */
  intent: string;
  /** Why it is brittle / how it breaks. */
  flaw: string;
  fingerprint: {
    role: AriaRole;
    name?: RegExp;
    /** For values without an accessible name (e.g. <dd>): the term that labels them. */
    term?: RegExp;
  };
}

export const BRITTLE_LOCATORS: BrittleLocator[] = [
  {
    key: 'amountInput',
    page: '/calculator',
    // Positional XPath: input[2] in the first field is now the range slider, not the text box.
    selector: 'xpath=//form/div[1]/input[2]',
    intent: 'Numeric text box where the user types the loan amount',
    flaw: 'Positional XPath — silently points at the wrong element (the slider) after a markup change',
    fingerprint: { role: 'spinbutton', name: /Loan Amount/ },
  },
  {
    key: 'rateInput',
    page: '/calculator',
    // Absolute XPath that assumes an old wrapper <div> around <main>.
    selector: 'xpath=/html/body/div[1]/main/form/div[2]/input[1]',
    intent: 'Numeric text box for the annual interest rate',
    flaw: 'Absolute XPath — breaks when any ancestor is added or removed',
    fingerprint: { role: 'spinbutton', name: /Interest Rate/ },
  },
  {
    key: 'calculateButton',
    page: '/calculator',
    // Styling class that was renamed during a CSS refactor (.btn-calculate → .primary).
    selector: 'button.btn-calculate',
    intent: 'Button that submits the loan form and calculates the EMI',
    flaw: 'Coupled to a presentational CSS class',
    fingerprint: { role: 'button', name: /^Calculate$/ },
  },
  {
    key: 'emiResult',
    page: '/calculator',
    // Stale auto-generated id from an earlier build.
    selector: '#emi-result-value-3f9a',
    intent: 'The calculated monthly EMI amount shown in the results panel',
    flaw: 'Generated id that changes between builds',
    fingerprint: { role: 'definition', term: /^Monthly EMI$/ },
  },
  {
    key: 'totalInterestResult',
    page: '/calculator',
    // nth-child chain plus a tag (<span>) that is now a <dd>.
    selector: 'section.results dl > div:nth-child(2) > span.value',
    intent: 'The total interest payable figure in the results panel',
    flaw: 'nth-child chain + tag/class assumptions about the DOM structure',
    fingerprint: { role: 'definition', term: /^Total Interest Payable$/ },
  },
];

const byKey = (key: string) => BRITTLE_LOCATORS.find((l) => l.key === key)!.selector;

/** Short action timeout so the broken scenario fails fast rather than hanging. */
const QUICK = { timeout: 3_000 };

export class BrittleCalculatorPage {
  readonly amountInput: Locator;
  readonly rateInput: Locator;
  readonly calculateButton: Locator;
  readonly emiResult: Locator;
  readonly totalInterestResult: Locator;

  constructor(readonly page: Page) {
    this.amountInput = page.locator(byKey('amountInput'));
    this.rateInput = page.locator(byKey('rateInput'));
    this.calculateButton = page.locator(byKey('calculateButton'));
    this.emiResult = page.locator(byKey('emiResult'));
    this.totalInterestResult = page.locator(byKey('totalInterestResult'));
  }

  async open(): Promise<void> {
    await this.page.goto('/calculator');
  }

  async enterAmount(amount: number): Promise<void> {
    await this.amountInput.fill(String(amount), QUICK);
  }

  async enterRate(rate: number): Promise<void> {
    await this.rateInput.fill(String(rate), QUICK);
  }

  async calculate(): Promise<void> {
    await this.calculateButton.click(QUICK);
  }

  async emiText(): Promise<string> {
    return (await this.emiResult.textContent(QUICK)) ?? '';
  }

  async totalInterestText(): Promise<string> {
    return (await this.totalInterestResult.textContent(QUICK)) ?? '';
  }
}
