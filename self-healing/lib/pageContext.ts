import type { Page } from '@playwright/test';

/** One element of the page, reduced to the attributes that make good locators. */
export interface ElementSummary {
  tag: string;
  type?: string;
  id?: string;
  testid?: string;
  role?: string;
  ariaLabel?: string;
  label?: string;
  text?: string;
  /** Text of the nearest heading/term that describes this element (e.g. the <dt> for a <dd>). */
  context?: string;
}

export interface PageContext {
  url: string;
  ariaSnapshot: string;
  elements: ElementSummary[];
}

/**
 * Captures what an AI (or heuristic) needs to propose a fix: the ARIA snapshot
 * and a compact list of candidate elements. Scripts, styles, SVG paths and
 * inline styles are dropped to keep the prompt small and free of noise.
 */
export async function capturePageContext(page: Page, maxElements = 250): Promise<PageContext> {
  const ariaSnapshot = await page.locator('main').ariaSnapshot();
  // Runs in the browser. Kept free of named inner functions: tsx/esbuild would wrap
  // them in a __name() helper that does not exist in the page.
  const raw = await page.locator('main').evaluate((main, limit) => {
    const tags = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'A', 'DD', 'DT', 'LABEL', 'H1', 'H2', 'TH'];
    const out: Record<string, string | null>[] = [];
    for (const el of Array.from(main.querySelectorAll('*'))) {
      if (out.length >= limit) break;
      const keep = tags.includes(el.tagName) || el.hasAttribute('data-testid') || el.hasAttribute('role') || el.hasAttribute('aria-label') || el.id;
      if (!keep || (el.closest('svg') && el.tagName !== 'svg')) continue;
      out.push({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type'),
        id: el.id || null,
        testid: el.getAttribute('data-testid'),
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label'),
        label: (el as HTMLInputElement).labels?.[0]?.textContent ?? null,
        text: Array.from(el.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join(' '),
        context: el.tagName === 'DD' ? (el.previousElementSibling?.textContent ?? null) : null,
      });
    }
    return out;
  }, maxElements);

  const clean = (s: string | null) => s?.replace(/\s+/g, ' ').trim().slice(0, 80) || undefined;
  const elements = raw.map((e) => {
    const summary = Object.fromEntries(Object.entries(e).map(([k, v]) => [k, clean(v)]).filter(([, v]) => v !== undefined));
    return summary as unknown as ElementSummary;
  });

  return {
    url: page.url(),
    ariaSnapshot,
    elements,
  };
}
