@ui @calculator
Feature: EMI calculator
  As a borrower
  I want to calculate my monthly EMI
  So that I know what a loan will cost me

  Background:
    Given I open the EMI calculator

  @smoke
  Scenario Outline: Calculated EMI matches an independently computed value — <tab> <amount> @ <rate>% for <years>y
    Given I select the "<tab>" tab
    When I enter a loan amount of "<amount>", an interest rate of <rate>% and a tenure of <years> years
    And I submit the loan details
    Then the EMI, total interest and total payment should match my own calculation
    And paying that EMI every month should clear the loan exactly

    Examples:
      | tab           | amount | rate  | years |
      | Home Loan     | 25L    | 10    | 10    |
      | Home Loan     | 50L    | 7.5   | 15    |
      | Personal Loan | 10L    | 12    | 5     |
      | Car Loan      | 8L     | 9.25  | 7     |
      | Home Loan     | 2Cr    | 5     | 30    |
      | Personal Loan | 10K    | 30    | 1     |

  Scenario: Values set by dragging the sliders produce the correct EMI
    Given I select the "Personal Loan" tab
    When I set the loan amount slider to "10L", the interest rate slider to 12% and the tenure slider to 5 years
    Then the EMI, total interest and total payment should match my own calculation

  Scenario Outline: Out-of-range input is rejected with an accessible error — <field> = "<value>"
    Given I select the "Home Loan" tab
    And I enter a loan amount of "25L", an interest rate of 10% and a tenure of 10 years
    And I submit the loan details
    When I change the "<field>" field to "<value>" and submit
    Then the "<field>" field should report the error "<message>"
    And the previously calculated results should remain unchanged

    Examples:
      | field  | value    | message                                         |
      | amount | 0        | Must be between 1,00,000 and 2,00,00,000.       |
      | amount | 30000000 | Must be between 1,00,000 and 2,00,00,000.       |
      | amount |          | Please enter a number.                          |
      | rate   | 35       | Must be between 5 and 20.                       |
      | rate   | -1       | Must be between 5 and 20.                       |
      | tenure | 0        | Must be between 1 and 30.                       |
      | tenure | 2.5      | Tenure must be a whole number of years.         |
