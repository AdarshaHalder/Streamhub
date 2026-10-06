import { expect, type Locator, type Page } from '@playwright/test';
import type { BrittleLocator } from '../../tests/pages/legacy/BrittleCalculatorPage';

export type Detection =
  | { status: 'HEALTHY' }
  | { status: 'NOT_FOUND'; detail: string }
  | { status: 'AMBIGUOUS'; detail: string }
  | { status: 'WRONG_ELEMENT'; detail: string };

/** Does the element look like what the locator was written for? */
export async function matchesFingerprint(locator: Locator, fp: BrittleLocator['fingerprint']): Promise<string | null> {
  try {
    await expect(locator).toHaveRole(fp.role, { timeout: 1_000 });
    if (fp.name) await expect(locator).toHaveAccessibleName(fp.name, { timeout: 1_000 });
    if (fp.term) {
      const term = await locator.evaluate((el) => el.previousElementSibling?.textContent?.trim() ?? '');
      if (!fp.term.test(term)) return `expected the value labelled ${fp.term} but found the one labelled "${term}"`;
    }
    return null;
  } catch {
    const actual = await locator.evaluate((el) =>
      ['tagName', 'type', 'role', 'aria-label']
        .map((a) => (a === 'tagName' ? el.tagName.toLowerCase() : el.getAttribute(a) && `${a}="${el.getAttribute(a)}"`))
        .filter(Boolean)
        .join(' '),
    );
    return `expected role "${fp.role}"${fp.name ? ` named ${fp.name}` : ''} but found <${actual}>`;
  }
}

/**
 * Detection goes beyond "element not found": a locator that resolves to the
 * WRONG element is the most dangerous failure, because tests keep running
 * against the wrong thing. The semantic fingerprint catches that case.
 */
export async function detect(page: Page, entry: BrittleLocator): Promise<Detection> {
  const locator = page.locator(entry.selector);
  const count = await locator.count();
  if (count === 0) return { status: 'NOT_FOUND', detail: `"${entry.selector}" matched no elements` };
  if (count > 1) return { status: 'AMBIGUOUS', detail: `"${entry.selector}" matched ${count} elements` };
  const mismatch = await matchesFingerprint(locator, entry.fingerprint);
  return mismatch ? { status: 'WRONG_ELEMENT', detail: mismatch } : { status: 'HEALTHY' };
}
