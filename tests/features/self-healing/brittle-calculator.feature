@broken @self-healing
Feature: Legacy calculator flow (intentionally broken locators)
  These scenarios use tests/pages/legacy/BrittleCalculatorPage.ts, whose locators
  are deliberately brittle and LEFT BROKEN for the AI self-healing exercise.
  They are excluded from the default run; execute with `npm run test:broken`
  and repair suggestions with `npm run heal`.

  Background:
    Given I open the calculator using the legacy page object

  # NOTE: this one PASSES — the positional XPath now resolves to the range slider,
  # which also accepts fill(). The test is green while driving the wrong control.
  # Only semantic detection (expected role "spinbutton") exposes it; see `npm run heal`.
  Scenario: Typing the loan amount (positional XPath silently drives the slider)
    When I type 2500000 into the legacy amount field
    Then the legacy amount field should contain 2500000

  Scenario: Typing the interest rate (absolute XPath)
    When I type 10 into the legacy interest rate field

  Scenario: Clicking Calculate (renamed CSS class)
    When I click the legacy Calculate button

  Scenario: Reading the EMI result (stale generated id)
    Then the legacy EMI result should show a rupee amount

  Scenario: Reading total interest (nth-child chain)
    Then the legacy total interest result should show a rupee amount
