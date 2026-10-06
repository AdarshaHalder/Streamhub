# Self-healing report

Generated 2026-10-06T07:19:14.171Z · AI disabled · suggestions are **not** auto-applied.

| Locator | Detection | Suggested fix | Source | Gates passed |
|---|---|---|---|---|
| `amountInput` | WRONG_ELEMENT | `page.getByRole('spinbutton', { name: 'Loan Amount' })` | heuristic | unique, visible, semantic, behaviour, re-render, responsive |
| `rateInput` | NOT_FOUND | `page.getByRole('spinbutton', { name: 'Interest Rate' })` | heuristic | unique, visible, semantic, behaviour, re-render, responsive |
| `calculateButton` | NOT_FOUND | `page.getByRole('button', { name: 'Calculate' })` | heuristic | unique, visible, semantic, behaviour, re-render, responsive |
| `emiResult` | NOT_FOUND | `page.getByTestId('result-emi')` | heuristic | unique, visible, semantic, behaviour, re-render, responsive |
| `totalInterestResult` | NOT_FOUND | `page.getByTestId('result-interest')` | heuristic | unique, visible, semantic, behaviour, re-render, responsive |

## `amountInput`

- **Intent:** Numeric text box where the user types the loan amount
- **Broken selector:** `xpath=//form/div[1]/input[2]`
- **Why it was brittle:** Positional XPath — silently points at the wrong element (the slider) after a markup change
- **Detected:** WRONG_ELEMENT — expected role "spinbutton" named /Loan Amount/ but found <input type="range">
- _AI disabled (--no-ai)_

| Candidate | Source | Confidence | Result |
|---|---|---|---|
| `page.getByRole('spinbutton', { name: 'Home Loan Amount' })` | heuristic | 1 | ❌ re-render: matched 0 after switching to the Car Loan tab |
| `page.getByRole('spinbutton', { name: 'Loan Amount' })` | heuristic | 1 | ✅ all gates passed |
| `page.getByRole('spinbutton', { name: 'Loan Tenure' })` | heuristic | 0.8 | ❌ semantic: expected role "spinbutton" named /Loan Amount/ but found <input type="number"> |
| `page.getByRole('spinbutton', { name: 'Interest Rate' })` | heuristic | 0.6 | ❌ semantic: expected role "spinbutton" named /Loan Amount/ but found <input type="number"> |
| `page.getByRole('tablist', { name: 'Loan type' })` | heuristic | 0.2 | ❌ semantic: expected role "spinbutton" named /Loan Amount/ but found <div role="tablist" aria-label="Loan type"> |

Suggested patch (`tests/pages/legacy/BrittleCalculatorPage.ts`):

```diff
- this.amountInput = page.locator('xpath=//form/div[1]/input[2]');
+ this.amountInput = page.getByRole('spinbutton', { name: 'Loan Amount' });
```

## `rateInput`

- **Intent:** Numeric text box for the annual interest rate
- **Broken selector:** `xpath=/html/body/div[1]/main/form/div[2]/input[1]`
- **Why it was brittle:** Absolute XPath — breaks when any ancestor is added or removed
- **Detected:** NOT_FOUND — "xpath=/html/body/div[1]/main/form/div[2]/input[1]" matched no elements
- _AI disabled (--no-ai)_

| Candidate | Source | Confidence | Result |
|---|---|---|---|
| `page.getByRole('spinbutton', { name: 'Interest Rate' })` | heuristic | 0.71 | ✅ all gates passed |
| `page.getByRole('spinbutton', { name: 'Home Loan Amount' })` | heuristic | 0.43 | ❌ semantic: expected role "spinbutton" named /Interest Rate/ but found <input type="number"> |
| `page.getByRole('spinbutton', { name: 'Loan Amount' })` | heuristic | 0.43 | ❌ semantic: expected role "spinbutton" named /Interest Rate/ but found <input type="number"> |
| `page.getByRole('spinbutton', { name: 'Loan Tenure' })` | heuristic | 0.43 | ❌ semantic: expected role "spinbutton" named /Interest Rate/ but found <input type="number"> |

Suggested patch (`tests/pages/legacy/BrittleCalculatorPage.ts`):

```diff
- this.rateInput = page.locator('xpath=/html/body/div[1]/main/form/div[2]/input[1]');
+ this.rateInput = page.getByRole('spinbutton', { name: 'Interest Rate' });
```

## `calculateButton`

- **Intent:** Button that submits the loan form and calculates the EMI
- **Broken selector:** `button.btn-calculate`
- **Why it was brittle:** Coupled to a presentational CSS class
- **Detected:** NOT_FOUND — "button.btn-calculate" matched no elements
- _AI disabled (--no-ai)_

| Candidate | Source | Confidence | Result |
|---|---|---|---|
| `page.getByRole('tab', { name: 'Home Loan' })` | heuristic | 0.5 | ❌ semantic: expected role "button" named /^Calculate$/ but found <button role="tab"> |
| `page.getByRole('tab', { name: 'Personal Loan' })` | heuristic | 0.5 | ❌ semantic: expected role "button" named /^Calculate$/ but found <button role="tab"> |
| `page.getByRole('tab', { name: 'Car Loan' })` | heuristic | 0.5 | ❌ semantic: expected role "button" named /^Calculate$/ but found <button role="tab"> |
| `page.getByRole('button', { name: 'Calculate' })` | heuristic | 0.5 | ✅ all gates passed |

Suggested patch (`tests/pages/legacy/BrittleCalculatorPage.ts`):

```diff
- this.calculateButton = page.locator('button.btn-calculate');
+ this.calculateButton = page.getByRole('button', { name: 'Calculate' });
```

## `emiResult`

- **Intent:** The calculated monthly EMI amount shown in the results panel
- **Broken selector:** `#emi-result-value-3f9a`
- **Why it was brittle:** Generated id that changes between builds
- **Detected:** NOT_FOUND — "#emi-result-value-3f9a" matched no elements
- _AI disabled (--no-ai)_

| Candidate | Source | Confidence | Result |
|---|---|---|---|
| `page.getByTestId('result-emi')` | heuristic | 0.71 | ✅ all gates passed |
| `page.getByTestId('result-interest')` | heuristic | 0.43 | ❌ semantic: expected the value labelled /^Monthly EMI$/ but found the one labelled "Total Interest Payable" |
| `page.getByTestId('result-total')` | heuristic | 0.43 | ❌ semantic: expected the value labelled /^Monthly EMI$/ but found the one labelled "Total Payment (Principal + Interest)" |

Suggested patch (`tests/pages/legacy/BrittleCalculatorPage.ts`):

```diff
- this.emiResult = page.locator('#emi-result-value-3f9a');
+ this.emiResult = page.getByTestId('result-emi');
```

## `totalInterestResult`

- **Intent:** The total interest payable figure in the results panel
- **Broken selector:** `section.results dl > div:nth-child(2) > span.value`
- **Why it was brittle:** nth-child chain + tag/class assumptions about the DOM structure
- **Detected:** NOT_FOUND — "section.results dl > div:nth-child(2) > span.value" matched no elements
- _AI disabled (--no-ai)_

| Candidate | Source | Confidence | Result |
|---|---|---|---|
| `page.getByTestId('result-interest')` | heuristic | 0.86 | ✅ all gates passed |
| `page.getByTestId('result-total')` | heuristic | 0.71 | ❌ semantic: expected the value labelled /^Total Interest Payable$/ but found the one labelled "Total Payment (Principal + Interest)" |
| `page.getByTestId('result-emi')` | heuristic | 0.43 | ❌ semantic: expected the value labelled /^Total Interest Payable$/ but found the one labelled "Monthly EMI" |

Suggested patch (`tests/pages/legacy/BrittleCalculatorPage.ts`):

```diff
- this.totalInterestResult = page.locator('section.results dl > div:nth-child(2) > span.value');
+ this.totalInterestResult = page.getByTestId('result-interest');
```
