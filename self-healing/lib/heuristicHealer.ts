import type { BrittleLocator } from '../../tests/pages/legacy/BrittleCalculatorPage';
import type { ElementSummary, PageContext } from './pageContext';
import type { LocatorSpec } from './locatorSpec';
import type { Candidate } from './aiHealer';

/**
 * Offline fallback when no Claude credentials are available. It ranks page
 * elements by word overlap with the locator's intent and the old selector
 * ("btn-calculate" → calculate), then derives the most stable locator for each.
 * It never reads the fingerprint — that is reserved for validation.
 */
const STOP = new Set(['the', 'and', 'for', 'where', 'user', 'types', 'that', 'shown', 'with', 'this', 'html', 'body', 'div', 'xpath', 'form', 'input', 'span', 'section', 'nth', 'child']);

// Plain-language words for element kinds, so "text box" in an intent can match an <input type=number>.
const KIND_WORDS: Record<string, string> = {
  'input:number': 'numeric text box field',
  'input:range': 'slider range',
  'input:month': 'month date picker',
  button: 'button submits click',
  select: 'dropdown select filter',
  dd: 'figure value amount result shown',
};

const tokens = (text: string) =>
  new Set(
    text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2 && !STOP.has(t) && !/^\d+$/.test(t) && !/^[0-9a-f]{4}$/.test(t))
      .map(stem),
  );

/** Crude suffix stripping so "calculates" / "calculated" / "calculate" compare equal. */
function stem(word: string): string {
  return word.replace(/(ing|ed|es|s)$/, '').replace(/e$/, '');
}

/** Looks up "tag:type" first (input:number), then the bare tag (button type=submit → button). */
const byKind = <T>(table: Record<string, T>, el: ElementSummary): T | undefined =>
  table[`${el.tag}:${el.type}`] ?? table[el.tag];

function describe(el: ElementSummary): string {
  const kind = byKind(KIND_WORDS, el) ?? '';
  return [el.testid, el.id, el.ariaLabel, el.label, el.text, el.context, kind].filter(Boolean).join(' ');
}

const IMPLICIT_ROLE: Record<string, string> = { 'input:number': 'spinbutton', 'input:range': 'slider', button: 'button', select: 'combobox', a: 'link' };

/**
 * Stable locators for this element, most specific first, in the same preference
 * order as the AI prompt. For role+name it also offers shorter trailing parts of
 * the name ("Home Loan Amount" → "Loan Amount"), because leading words are often
 * context that changes (here: the selected loan tab). Validation picks the one that holds up.
 */
function locatorsFor(el: ElementSummary): LocatorSpec[] {
  if (el.testid) return [{ strategy: 'testid', value: el.testid, name: null }];
  const role = el.role ?? byKind(IMPLICIT_ROLE, el);
  // Drop trailing units like "(₹)" or "(% p.a.)" — they are the part most likely to change.
  const name = (el.label ?? el.ariaLabel ?? el.text)?.replace(/\s*\(.*\)\s*$/, '').trim();
  if (role && name) {
    const words = name.split(/\s+/);
    return words
      .map((_, i) => words.slice(i).join(' '))
      .filter((n, i) => i === 0 || n.split(' ').length >= 2)
      .map((n) => ({ strategy: 'role' as const, value: role, name: n }));
  }
  if (el.label) return [{ strategy: 'label', value: el.label, name: null }];
  return [];
}

export function proposeWithHeuristics(entry: BrittleLocator, context: PageContext): Candidate[] {
  const wanted = new Set([...tokens(entry.intent), ...tokens(entry.selector)]);
  return context.elements
    .map((el) => {
      const have = tokens(describe(el));
      const overlap = [...wanted].filter((t) => have.has(t));
      return { el, overlap, score: overlap.length / Math.max(wanted.size, 1) };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    // Word overlap is a weak signal (ties are common), so keep a generous pool
    // and let browser validation reject the wrong ones.
    .slice(0, 5)
    .flatMap(({ el, overlap, score }) => locatorsFor(el).map((locator) => ({ locator, overlap, score })))
    .map(({ locator, overlap, score }) => ({
      locator,
      rationale: `Matched intent words: ${overlap.join(', ')}`,
      confidence: Number(score.toFixed(2)),
      source: 'heuristic' as const,
    }));
}
