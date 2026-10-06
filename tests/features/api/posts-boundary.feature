@api
Feature: JSONPlaceholder — boundary and invalid data on POST /posts
  The API should handle boundary and invalid input with appropriate 4xx codes or
  error messages and never fail server-side (5xx).

  JSONPlaceholder is a fake API: it accepts any JSON and echoes it back with
  201. Scenarios tagged @known-defect assert the *expected* behaviour and are
  marked @fail (expected to fail) so the suite stays green while the defects
  stay visible in the report. If the API is ever fixed, those scenarios will
  start "unexpectedly passing" and flag it.

  Rule: Excessively long titles

    Scenario Outline: A <length>-character title is handled without a server error
      When I create a post with a title of <length> characters
      Then the response should not be a server error
      And the response status should be 201
      And the response should be JSON
      And the echoed "title" should be identical to what was sent
      And the response should arrive within the configured time limit

      Examples:
        | length  |
        | 255     |
        | 256     |
        | 10000   |
        | 1000000 |

    @known-defect @fail @slow
    Scenario: A payload above the server's body limit is rejected with 413, not 500
      When I create a post with a title of 11000000 characters
      Then the response status should be 413
      # Actual: 500 "PayloadTooLargeError" with a Node.js stack trace

  Rule: Unsupported special characters

    Scenario Outline: Title with <category> is stored without server error or corruption
      When I create a post whose title contains "<category>"
      Then the response should not be a server error
      And the response status should be 201
      And the response should be JSON
      And the echoed "title" should be identical to what was sent

      Examples:
        | category                    |
        | HTML and script injection   |
        | SQL injection               |
        | emoji and astral unicode    |
        | RTL override and zero-width |
        | control characters          |
        | JSON metacharacters         |
        | mixed scripts               |

  Rule: Missing or invalid required fields

    Scenario Outline: Post with <problem> does not cause a server error
      When I create a post with <problem>
      Then the response should not be a server error
      And the response should be JSON

      Examples:
        | problem              |
        | no userId            |
        | no title             |
        | an empty body        |
        | a string userId      |
        | a negative userId    |
        | a null title         |

    @known-defect @fail
    Scenario Outline: Post with <problem> is rejected with 400 Bad Request
      When I create a post with <problem>
      Then the response status should be 400
      # Actual: 201 Created — JSONPlaceholder performs no validation

      Examples:
        | problem              |
        | no userId            |
        | an empty body        |
        | a string userId      |

  Rule: Malformed requests

    @known-defect @fail
    Scenario: Malformed JSON is rejected with 400, not a server error
      When I send a post with a malformed JSON body
      Then the response should not be a server error
      And the response status should be 400
      # Actual: 500 with "SyntaxError: Unexpected end of JSON input" stack trace

    @known-defect @fail
    Scenario: Error responses do not leak server internals
      When I send a post with a malformed JSON body
      Then the response body should not contain a stack trace
