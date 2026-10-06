-- Scenario 2: players with 30+ runs in at least 3 consecutive matches, 2024 season.
--
-- "Consecutive matches" = consecutive matches the player appeared in that season
-- (their own appearances, ordered by date). A DNB appearance (runs IS NULL) or a
-- score under 30 breaks the streak; earlier seasons never join a 2024 streak.
--
-- Gaps-and-islands: number every appearance, then number only the 30+ ones. Within
-- an unbroken run of 30+ scores both counters rise together, so their difference
-- is constant and identifies the streak.
WITH season_appearances AS (
  SELECT
    b.player_id,
    p.player_name,
    m.match_id,
    m.match_date,
    b.runs,
    ROW_NUMBER() OVER (PARTITION BY b.player_id ORDER BY m.match_date, m.match_id) AS appearance_no
  FROM batting_scorecard AS b
  JOIN matches AS m ON m.match_id = b.match_id
  JOIN players AS p ON p.player_id = b.player_id
  WHERE m.season = 2024
),
thirty_plus AS (
  SELECT
    *,
    appearance_no - ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY appearance_no) AS streak_key
  FROM season_appearances
  WHERE runs >= 30
)
SELECT
  player_name,
  MIN(match_date) AS streak_start_date,
  MAX(match_date) AS streak_end_date,
  COUNT(*)        AS streak_matches
FROM thirty_plus
GROUP BY player_id, player_name, streak_key
HAVING COUNT(*) >= 3
ORDER BY streak_start_date, player_name;
