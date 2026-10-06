@sql
Feature: SQL scenarios
  Schemas, seed data and queries live in sql/. Each scenario loads them into an
  in-memory SQLite database, runs the query, checks the result against the
  hand-verified expectation, and saves a screenshot of the output.

  Scenario: Round-trip transfers — B returns a similar amount (±10%) to A within 24 hours
    Given the "banking" database is loaded with its seed data
    When I run the "round_trip_transfers" query
    Then the query should return exactly these rows:
      | outbound_txn_id | account_a | account_b | sent_amount | return_txn_id | returned_amount | amount_diff_pct | hours_between |
      | 1               | ACC001    | ACC002    | 10000       | 2             | 9500            | 5               | 9.5           |
      | 3               | ACC003    | ACC004    | 50000       | 4             | 45000           | 10              | 24            |
      | 13              | ACC009    | ACC010    | 12000       | 14            | 13200           | 10              | 12            |
      | 16              | ACC006    | ACC004    | 5000        | 15            | 5000            | 0               | 1             |
      | 17              | ACC002    | ACC001    | 7000        | 18            | 7200            | 2.86            | 6             |
      | 17              | ACC002    | ACC001    | 7000        | 19            | 6800            | 2.86            | 11            |
    And none of these transactions should be reported: 5, 6, 7, 8, 9, 10, 11, 12
    And I save a screenshot of the query output

  Scenario: IPL 2024 — players with 30+ runs in at least 3 consecutive matches
    Given the "ipl" database is loaded with its seed data
    When I run the "ipl_scoring_streaks" query
    Then the query should return exactly these rows:
      | player_name     | streak_start_date | streak_end_date | streak_matches |
      | Travis Head     | 2024-03-24        | 2024-04-03      | 4              |
      | Virat Kohli     | 2024-03-30        | 2024-04-07      | 3              |
      | Ruturaj Gaikwad | 2024-04-07        | 2024-04-25      | 4              |
      | Abhishek Sharma | 2024-04-13        | 2024-04-21      | 3              |
      | Virat Kohli     | 2024-04-19        | 2024-04-27      | 3              |
    And these players should not appear in the results: Sunil Narine, Rohit Sharma
    And I save a screenshot of the query output
