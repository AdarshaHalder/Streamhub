# Self-healing locators with AI

This folder covers the AI self-healing exercise: the design, plus a working proof of concept (`npm run heal`).

## The broken locators

[`tests/pages/legacy/BrittleCalculatorPage.ts`](../tests/pages/legacy/BrittleCalculatorPage.ts) holds five deliberately brittle locators. They are **left broken**. The scenarios that use them ([`brittle-calculator.feature`](../tests/features/self-healing/brittle-calculator.feature), tag `@broken`) are excluded from the default run. Run them with `npm run test:broken`.

| Key | Broken selector | Brittle because | Symptom |
|---|---|---|---|
| `amountInput` | `xpath=//form/div[1]/input[2]` | positional XPath | **Silently wrong**: it now resolves to the range slider. `fill()` still works, so the test **passes** while driving the wrong control |
| `rateInput` | `xpath=/html/body/div[1]/main/form/div[2]/input[1]` | absolute XPath assumes an old wrapper `<div>` | not found |
| `calculateButton` | `button.btn-calculate` | tied to a presentational CSS class that was renamed | not found |
| `emiResult` | `#emi-result-value-3f9a` | generated id that changes per build | not found |
| `totalInterestResult` | `section.results dl > div:nth-child(2) > span.value` | `nth-child` chain plus tag/class assumptions | not found |

`amountInput` is the important one. A self-healing approach that only reacts to "element not found" never notices it.

## Approach

```
 test failure / scheduled scan
            │
     ┌──────▼──────┐   NOT_FOUND · AMBIGUOUS · WRONG_ELEMENT
     │  1. Detect  │──────────────────────────────────────────┐
     └──────┬──────┘                                          │
     ┌──────▼──────────────┐  ARIA snapshot + compact element list
     │ 2. Capture context  │  (test ids, roles, labels, text, <dt> for <dd>)
     └──────┬──────────────┘
     ┌──────▼──────────────┐  Claude → JSON-schema-constrained LocatorSpec[]
     │ 3. Propose          │  heuristic healer appended as an offline fallback
     └──────┬──────────────┘
     ┌──────▼──────────────┐  unique → visible → semantic → behaviour
     │ 4. Validate (browser)│  → re-render → responsive   (all must pass)
     └──────┬──────────────┘
     ┌──────▼──────────────┐  healing-report.md / .json + suggested diff
     │ 5. Report, human PR │  nothing is auto-applied
     └─────────────────────┘
```

### 1. Detection

The healer looks for three failure modes, not just one ([`lib/detect.ts`](lib/detect.ts)):

- **NOT_FOUND**: the selector matches 0 elements. In a live suite this shows up as a `TimeoutError` on a locator action, which a custom reporter or an `afterEach` hook can catch.
- **AMBIGUOUS**: the selector matches more than one element, which would be a strict-mode violation.
- **WRONG_ELEMENT**: the selector matches exactly one element, but it is not the element the locator was written for. Every locator records a **semantic fingerprint** when it is written: the expected ARIA role, the accessible name and, for values such as `<dd>`, the term that labels them. A mismatch is reported even though Playwright raises no error.

In CI the trigger would be either (a) a failed test whose error is a locator timeout or strict-mode violation, or (b) a nightly scan of every registered locator against the latest build. The scan catches silent drift before it turns into a red build, or into a wrong green one.

### 2. Context capture

[`lib/pageContext.ts`](lib/pageContext.ts) sends the model only what it needs:

- Playwright's **ARIA snapshot** of `<main>`. This is the same tree that `getByRole` resolves against.
- A **compact element list** with tag, type, id, `data-testid`, role, `aria-label`, associated `<label>` text, own text, and the labelling term for `<dd>`. Scripts, styles, SVG path data and inline styles are dropped. The list is capped at 250 elements.

The prompt stays small, cheap and deterministic, and it contains nothing sensitive beyond the UI text.

### 3. Prompt approach

[`lib/aiHealer.ts`](lib/aiHealer.ts) calls Claude (`claude-opus-5-5`) with:

- **System prompt.** It sets the locator preference order (`data-testid` → role + name → label → placeholder → exact text). It says to use only values that appear in the snapshot (no invented ids), that the locator must match exactly one element, that a stable substring of the name should be used (drop units), and that the model should return an empty list instead of guessing.
- **User message.** It contains the locator's *intent* in plain language ("Numeric text box where the user types the loan amount"), the broken selector, the failure type and detail, and the page context.
- **Structured output.** `output_config.format` takes a Zod schema, so the response is **data** (`{strategy, value, name}`), not code. The schema's `strategy` enum leaves out CSS, XPath and `nth`, so a positional selector cannot even be expressed. Nothing is `eval`'d. [`lib/locatorSpec.ts`](lib/locatorSpec.ts) maps each spec onto `page.getByRole(...)` and the other locator methods.
- **The fingerprint is not sent to the model.** It is kept back for validation, so the model has to find the element from the intent and the page, and the check that follows is independent.
- Server-side refusal fallbacks are enabled. `refusal` and `max_tokens` stop reasons are handled. Any API failure (no credentials, rate limit) falls back to the heuristic healer.

[`lib/heuristicHealer.ts`](lib/heuristicHealer.ts) is the offline fallback. It ranks elements by stemmed word overlap with the intent and the old selector (for example, `btn-calculate` → *calculate*), then builds the most stable locator for each element, including shorter name variants such as "Home Loan Amount" → "Loan Amount". It is deliberately simple. The validator does the real work.

### 4. Validation before applying a fix

A candidate is suggested only if it passes **every** gate in a real browser ([`lib/validate.ts`](lib/validate.ts)). Gates run in order and stop at the first failure.

| Gate | Check | What it catches |
|---|---|---|
| unique | `count() === 1` | strict-mode violations, such as a name that is too generic |
| visible | `isVisible()` | hidden duplicates, templates |
| semantic | role + accessible name + labelling term match the fingerprint | the *wrong* element, such as the EMI value instead of Total Interest |
| behaviour | spinbutton accepts input; button is enabled and clickable (`trial`); result shows a `₹` amount | elements that look right but cannot do the job |
| re-render | still unique after switching to the Car Loan tab | names tied to transient text ("**Home** Loan Amount") |
| responsive | unique and visible at 390×844 | layout-dependent locators |

Even after every gate passes, the fix is **not written to the code**. The tool writes [`reports/healing-report.md`](reports/healing-report.md) with a diff for each locator, and a human applies it in a normal PR. That PR then runs the full suite as the final check. Auto-applying a fix at runtime ("heal and continue") is the step that turns a self-healing tool into a bug-hiding tool, because a test can go green against the wrong element. The `amountInput` case above shows exactly that.

## What the POC run shows

`npm run heal -- --no-ai` (the committed report was generated offline without credentials; run `npm run heal` with `ANTHROPIC_API_KEY` set to use Claude):

```
▶ amountInput: WRONG_ELEMENT — expected role "spinbutton" named /Loan Amount/ but found <input type="range">
  ✘ page.getByRole('spinbutton', { name: 'Home Loan Amount' })  (re-render: matched 0 after switching to the Car Loan tab)
  ✔ page.getByRole('spinbutton', { name: 'Loan Amount' })
▶ calculateButton: NOT_FOUND
  ✘ page.getByRole('tab', { name: 'Home Loan' })  (semantic: expected role "button" … but found <button role="tab">)
  ✔ page.getByRole('button', { name: 'Calculate' })
▶ emiResult: NOT_FOUND
  ✔ page.getByTestId('result-emi')
  ✘ page.getByTestId('result-interest')  (semantic: expected the value labelled /^Monthly EMI$/ …)
5/5 locators healthy or healed.
```

Most candidates are rejected, and that is the point. The heuristic's first guess for the Calculate button is a loan tab, and its first guess for the amount uses a name that breaks on another tab. The validation gates catch both before a human ever sees them.

## Limitations and next steps

- **Fingerprints must be recorded when the locator is written.** That is a small cost per locator. For an existing suite it can be bootstrapped by running every locator once against a known-good build and saving role, name and term.
- **Cost and latency.** One model call per broken locator. Batch the calls for nightly scans, and cache healed results per build hash.
- **Applying fixes.** The next step is a codemod that rewrites the page-object line and opens a PR with the healing report as its description.
- **Live mode.** A Playwright fixture could wrap page-object locators and, on timeout, call the healer and *annotate* the test as "passed with healed locator". The test would still fail CI until the fix is merged, so the drift stays visible.
