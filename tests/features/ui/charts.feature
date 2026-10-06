@ui @charts
Feature: EMI charts
  The calculator visualises the loan as a principal/interest pie chart and a
  yearly stacked bar chart; both must reflect the underlying numbers.

  Background:
    Given I open the EMI calculator

  @smoke
  Scenario Outline: Pie chart shows a non-zero principal / interest break-up — <amount> @ <rate>% for <years>y
    Given I select the "Home Loan" tab
    And I enter a loan amount of "<amount>", an interest rate of <rate>% and a tenure of <years> years
    And I submit the loan details
    Then the break-up pie chart should be visible
    And both pie chart slices should have values greater than zero
    And the pie chart slices should equal the principal and my calculated total interest
    And the pie chart legend should show the same values as the slices

    Examples:
      | amount | rate | years |
      | 25L    | 10   | 10    |
      | 50L    | 7.5  | 15    |

  Scenario: Bar chart follows the schedule start month and its tooltip shows correct values
    Given I select the "Personal Loan" tab
    And I set the loan amount slider to "10L", the interest rate slider to 12% and the tenure slider to 5 years
    When I change the schedule start month to "2026-11"
    Then the yearly bar chart should be visible
    And the bar chart should have one bar per calendar year of the schedule
    And every bar should have non-zero principal and interest
    And the bars' principal should add up to the loan amount
    When I hover over the bar for 2028
    Then the tooltip should show the 2028 principal, interest and balance from my own schedule

  Scenario: Changing the start month changes the number of bars
    Given I select the "Personal Loan" tab
    And I enter a loan amount of "10L", an interest rate of 12% and a tenure of 5 years
    When I change the schedule start month to "2027-01"
    Then the bar chart should have one bar per calendar year of the schedule
    When I change the schedule start month to "2027-07"
    Then the bar chart should have one bar per calendar year of the schedule
