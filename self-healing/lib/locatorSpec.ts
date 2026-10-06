import { z } from 'zod';
import type { Locator, Page } from '@playwright/test';

/**
 * A healed locator is expressed as DATA, never as code to eval. Only resilient
 * strategies are representable — CSS/XPath/nth are deliberately absent, so a
 * model (or heuristic) cannot propose a positional selector even by accident.
 */
export const LocatorSpecSchema = z.object({
  strategy: z.enum(['testid', 'role', 'label', 'placeholder', 'text']),
  value: z.string().describe('test id, ARIA role, label text, placeholder or visible text'),
  name: z.string().nullable().describe('accessible name — only for strategy "role", otherwise null'),
});
export type LocatorSpec = z.infer<typeof LocatorSpecSchema>;

export function toLocator(page: Page, spec: LocatorSpec): Locator {
  switch (spec.strategy) {
    case 'testid':
      return page.getByTestId(spec.value);
    case 'role':
      return page.getByRole(spec.value as Parameters<Page['getByRole']>[0], spec.name ? { name: spec.name } : {});
    case 'label':
      return page.getByLabel(spec.value);
    case 'placeholder':
      return page.getByPlaceholder(spec.value);
    case 'text':
      return page.getByText(spec.value, { exact: true });
  }
}

export function toCode(spec: LocatorSpec): string {
  const q = (s: string) => `'${s.replace(/'/g, "\\'")}'`;
  switch (spec.strategy) {
    case 'testid':
      return `page.getByTestId(${q(spec.value)})`;
    case 'role':
      return spec.name
        ? `page.getByRole(${q(spec.value)}, { name: ${q(spec.name)} })`
        : `page.getByRole(${q(spec.value)})`;
    case 'label':
      return `page.getByLabel(${q(spec.value)})`;
    case 'placeholder':
      return `page.getByPlaceholder(${q(spec.value)})`;
    case 'text':
      return `page.getByText(${q(spec.value)}, { exact: true })`;
  }
}

export const sameSpec = (a: LocatorSpec, b: LocatorSpec) =>
  a.strategy === b.strategy && a.value === b.value && (a.name ?? null) === (b.name ?? null);
