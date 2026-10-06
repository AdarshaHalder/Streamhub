import { expect, type Page } from '@playwright/test';
import type { BrittleLocator } from '../../tests/pages/legacy/BrittleCalculatorPage';
import { toLocator, type LocatorSpec } from './locatorSpec';
import { matchesFingerprint } from './detect';

export interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

export interface Validation {
  passed: boolean;
  checks: Check[];
}

/**
 * A candidate is only suggested if it passes every gate, run in a real browser:
 *  1. unique      — resolves to exactly one element
 *  2. visible     — a user could interact with it
 *  3. semantic    — role / accessible name match the locator's recorded fingerprint
 *  4. behaviour   — the element does what the test needs (fillable, clickable, shows a ₹ value)
 *  5. re-render   — still unique after the UI re-renders (switching to another loan tab)
 *  6. responsive  — still unique and visible on a mobile viewport
 * Gates short-circuit: there is no point checking behaviour on an ambiguous locator.
 */
export async function validateCandidate(page: Page, entry: BrittleLocator, spec: LocatorSpec, baseUrl: string): Promise<Validation> {
  const checks: Check[] = [];
  const add = (name: string, ok: boolean, detail: string) => (checks.push({ name, ok, detail }), ok);
  const fresh = async () => {
    await page.goto(new URL(entry.page, baseUrl).toString());
    await expect(page.locator('body')).toHaveAttribute('data-state', 'calculated');
  };

  await fresh();
  const locator = toLocator(page, spec);

  const count = await locator.count();
  if (!add('unique', count === 1, `matched ${count} element(s)`)) return { passed: false, checks };

  const visible = await locator.isVisible();
  if (!add('visible', visible, visible ? 'visible' : 'hidden')) return { passed: false, checks };

  const mismatch = await matchesFingerprint(locator, entry.fingerprint);
  if (!add('semantic', !mismatch, mismatch ?? `role "${entry.fingerprint.role}" confirmed`)) return { passed: false, checks };

  const behaviour = await probeBehaviour(page, entry, spec);
  if (!add('behaviour', behaviour.ok, behaviour.detail)) return { passed: false, checks };

  await fresh();
  // Switch to another product and stay there: labels and results re-render, so a
  // locator tied to "Home Loan …" text fails here even though it worked above.
  await page.getByRole('tab', { name: 'Car Loan' }).click();
  const afterRerender = await toLocator(page, spec).count();
  if (!add('re-render', afterRerender === 1, `matched ${afterRerender} after switching to the Car Loan tab`)) return { passed: false, checks };

  const original = page.viewportSize();
  await page.setViewportSize({ width: 390, height: 844 });
  await fresh();
  const mobile = toLocator(page, spec);
  const mobileOk = (await mobile.count()) === 1 && (await mobile.isVisible());
  if (original) await page.setViewportSize(original);
  add('responsive', mobileOk, mobileOk ? 'unique and visible at 390×844' : 'not unique/visible at 390×844');

  return { passed: checks.every((c) => c.ok), checks };
}

async function probeBehaviour(page: Page, entry: BrittleLocator, spec: LocatorSpec): Promise<{ ok: boolean; detail: string }> {
  const locator = toLocator(page, spec);
  try {
    switch (entry.fingerprint.role) {
      case 'spinbutton': {
        const value = String(Number(await locator.getAttribute('min')) + Number(await locator.getAttribute('step') || 1));
        await locator.fill(value, { timeout: 2_000 });
        await expect(locator).toHaveValue(value, { timeout: 1_000 });
        return { ok: true, detail: `accepted input "${value}"` };
      }
      case 'button':
        await expect(locator).toBeEnabled({ timeout: 1_000 });
        await locator.click({ trial: true, timeout: 2_000 });
        return { ok: true, detail: 'enabled and clickable' };
      default: {
        const text = (await locator.textContent()) ?? '';
        return /₹\s?[\d,]+/.test(text) ? { ok: true, detail: `shows "${text.trim()}"` } : { ok: false, detail: `unexpected text "${text}"` };
      }
    }
  } catch (error) {
    return { ok: false, detail: (error as Error).message.split('\n')[0] };
  }
}
