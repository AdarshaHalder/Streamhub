@ui @dashboard
Feature: Portfolio dashboard
  As a loan officer
  I want a summary of the loan portfolio
  So that I can see exposure and expected collections at a glance

  Background:
    Given I open the portfolio dashboard

  @smoke
  Scenario: Dashboard loads with summary cards, chart and loan table
    Then the portfolio dashboard should be displayed
    And the "Dashboard" navigation link should be active
    And the summary cards should match my own calculation for "All" loans
    And the loans table should list every loan in the portfolio
    And the principal-by-type pie chart should render non-zero slices that match the portfolio

  Scenario Outline: Filtering by loan type "<type>" recalculates the summary
    When I filter the dashboard by loan type "<type>"
    Then only "<type>" loans should be listed
    And the summary cards should match my own calculation for "<type>" loans
    And the principal-by-type pie chart should render non-zero slices that match the portfolio

    Examples:
      | type      |
      | Home      |
      | Car       |
      | Personal  |
      | Education |

  Scenario: Navigating from the dashboard to the EMI calculator
    When I navigate to "EMI Calculator" from the main menu
    Then the EMI calculator should be displayed
    And the "EMI Calculator" navigation link should be active
