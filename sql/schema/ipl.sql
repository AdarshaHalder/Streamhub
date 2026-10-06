-- Scenario 2 schema: IPL-style players, matches and batting scorecards.
CREATE TABLE players (
  player_id    INTEGER PRIMARY KEY,
  player_name  TEXT NOT NULL,
  team         TEXT NOT NULL
);

CREATE TABLE matches (
  match_id    INTEGER PRIMARY KEY,
  season      INTEGER NOT NULL,
  match_date  TEXT    NOT NULL,              -- 'YYYY-MM-DD'
  home_team   TEXT    NOT NULL,
  away_team   TEXT    NOT NULL,
  venue       TEXT    NOT NULL
);

-- One row per player per match they were in the XI for.
-- runs IS NULL means "did not bat" (DNB): the player appeared but had no innings.
CREATE TABLE batting_scorecard (
  match_id   INTEGER NOT NULL REFERENCES matches(match_id),
  player_id  INTEGER NOT NULL REFERENCES players(player_id),
  runs       INTEGER CHECK (runs IS NULL OR runs >= 0),
  balls      INTEGER,
  PRIMARY KEY (match_id, player_id)
);

CREATE INDEX idx_matches_season_date ON matches (season, match_date);
