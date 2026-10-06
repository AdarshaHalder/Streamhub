import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { LocatorSpecSchema, type LocatorSpec } from './locatorSpec';
import type { PageContext } from './pageContext';
import type { BrittleLocator } from '../../tests/pages/legacy/BrittleCalculatorPage';
import type { Detection } from './detect';

const CandidatesSchema = z.object({
  candidates: z
    .array(
      z.object({
        locator: LocatorSpecSchema,
        rationale: z.string().describe('one sentence: why this element matches the intent and why the locator is stable'),
        confidence: z.number().describe('0.0 – 1.0'),
      }),
    )
    .describe('up to 3 candidates, best first'),
});

export interface Candidate {
  locator: LocatorSpec;
  rationale: string;
  confidence: number;
  source: 'ai' | 'heuristic';
}

const SYSTEM_PROMPT = `You repair broken Playwright locators in an end-to-end test suite.

You get: what the locator is meant to find (its intent), the broken selector, why it failed, and a snapshot of the current page (ARIA tree plus a list of elements with their test ids, roles, labels and text).

Propose up to 3 replacement locators, best first. Rules:
- Prefer, in order: data-testid ("testid"), ARIA role + accessible name ("role"), associated label ("label"), placeholder, exact visible text.
- Every value must appear in the snapshot. Never invent test ids, roles or names.
- The locator must identify exactly one element on the page; choose names specific enough to avoid matching other elements.
- Pick the element that fulfils the intent, even if the broken selector pointed elsewhere.
- For accessible names, use a stable substring of the label (drop units or punctuation that may change).
If nothing on the page matches the intent, return an empty list rather than guessing.`;

/**
 * Asks Claude for replacement locators. Output is constrained by a JSON schema,
 * so the response is data (LocatorSpec), not code — it is validated in a real
 * browser before anything is suggested to a human.
 */
export async function proposeWithAi(entry: BrittleLocator, detection: Detection, context: PageContext): Promise<Candidate[]> {
  const client = new Anthropic();
  const response = await client.beta.messages.parse({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: betaZodOutputFormat(CandidatesSchema) },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          `Intent: ${entry.intent}`,
          `Broken selector: ${entry.selector}`,
          `Failure: ${detection.status}${'detail' in detection ? ` — ${detection.detail}` : ''}`,
          `Page URL: ${context.url}`,
          '',
          '<aria_snapshot>',
          context.ariaSnapshot,
          '</aria_snapshot>',
          '',
          '<elements>',
          JSON.stringify(context.elements),
          '</elements>',
        ].join('\n'),
      },
    ],
  });

  if (response.stop_reason === 'refusal') throw new Error(`Model declined: ${response.stop_details?.explanation ?? 'no detail'}`);
  if (response.stop_reason === 'max_tokens') throw new Error('Model response was truncated (max_tokens)');
  const parsed = response.parsed_output;
  if (!parsed) throw new Error('Model returned no parseable candidates');
  return parsed.candidates.map((c) => ({ ...c, source: 'ai' as const }));
}
