-- ============================================================================
-- NHL Play-Sequence event data — SQLite schema (DDL)
--
-- Source: "playsequence-YYYYMMDD-LEAGUE-AWAYvsHOME-SEASON-GAMEID.csv"
-- One CSV per game; one row per on-ice event.
--
-- Tables:
--   games     - one row per game (metadata parsed from filename + file)
--   plays     - one row per event (the wide fact table; columns match the CSV)
--   on_ice    - normalized: one row per (event x player on ice)
--   players   - dimension built from the data: player_ref -> name/pos/team
--
-- Column names match the source CSV (camelCase) so they map 1:1 to the feed.
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- games: one row per loaded CSV file
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS games (
    gameReferenceId   INTEGER PRIMARY KEY,   -- matches plays.gameReferenceId
    gameDate          TEXT,                  -- 'YYYY-MM-DD' parsed from filename
    league            TEXT,                  -- e.g. 'NHL'
    season            TEXT,                  -- e.g. '20252026'
    awayTeamAbbrev    TEXT,                  -- 1st abbrev in "AWAYvsHOME" (assumption)
    homeTeamAbbrev    TEXT,                  -- 2nd abbrev in "AWAYvsHOME" (assumption)
    matchup           TEXT,                  -- raw "VANvsEDM"
    sourceFile        TEXT,                  -- original filename
    numPlays          INTEGER                -- event count loaded for this game
);

-- ---------------------------------------------------------------------------
-- plays: the wide event fact table. PK = (gameReferenceId, id).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plays (
    gameReferenceId             INTEGER NOT NULL,
    id                          INTEGER NOT NULL,   -- event index within the game
    period                      INTEGER,
    periodTime                  REAL,               -- seconds into the period
    gameTime                    REAL,               -- seconds into the game
    currentPossession           INTEGER,
    teamInPossession            TEXT,
    currentPlayInPossession     INTEGER,
    isPossessionEvent           INTEGER,            -- 0/1
    isDefensiveEvent            INTEGER,            -- 0/1
    isPossessionBreaking        INTEGER,            -- 0/1
    isLastPlayOfPossession      INTEGER,            -- 0/1
    frame                       INTEGER,
    timecode                    TEXT,               -- 'HH:MM:SS:FF'
    shorthand                   TEXT,
    name                        TEXT,               -- event name (faceoff, shot, ...)
    zone                        TEXT,               -- nz / oz / dz
    type                        TEXT,
    outcome                     TEXT,               -- successful / failed / undetermined
    flags                       TEXT,               -- comma-separated tags
    previousName                TEXT,
    previousType                TEXT,
    previousOutcome             TEXT,
    xCoord                      REAL,
    yCoord                      REAL,
    xAdjCoord                   REAL,               -- adjusted so play goes one direction
    yAdjCoord                   REAL,
    scoreDifferential           INTEGER,
    manpowerSituation           TEXT,               -- evenStrength / powerPlay / shortHanded
    teamSkatersOnIce            INTEGER,
    teamForwardsOnIceRefs       TEXT,               -- comma-separated player_refs (cleaned)
    teamDefencemenOnIceRefs     TEXT,               -- comma-separated player_refs (cleaned)
    teamGoalieOnIceRef          INTEGER,            -- single ref; NULL if goalie pulled
    opposingTeamSkatersOnIce    INTEGER,
    opposingTeamForwardsOnIceRefs   TEXT,
    opposingTeamDefencemenOnIceRefs TEXT,
    opposingTeamGoalieOnIceRef  INTEGER,
    team                        TEXT,               -- team of the acting player
    playerJersey                TEXT,               -- TEXT to preserve '00' etc.
    playerPosition              TEXT,
    playerFirstName             TEXT,
    playerLastName              TEXT,
    playerReferenceId           INTEGER,            -- acting player; -> players.playerReferenceId
    playZone                    TEXT,
    playSection                 TEXT,
    expectedGoalsOnNet          REAL,
    expectedGoalsAllShots       REAL,
    sourceFile                  TEXT,
    PRIMARY KEY (gameReferenceId, id),
    FOREIGN KEY (gameReferenceId) REFERENCES games (gameReferenceId)
);

-- ---------------------------------------------------------------------------
-- on_ice: normalized roster-on-ice. One row per (event x player on ice).
--   teamSide:      'for'  = same team as acting player's team,
--                  'against' = opposing team
--   positionGroup: 'F' forward, 'D' defence, 'G' goalie
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS on_ice (
    gameReferenceId   INTEGER NOT NULL,
    id                INTEGER NOT NULL,        -- event id within game
    playerReferenceId INTEGER NOT NULL,
    teamSide          TEXT NOT NULL,           -- 'for' / 'against'
    positionGroup     TEXT NOT NULL,           -- 'F' / 'D' / 'G'
    PRIMARY KEY (gameReferenceId, id, playerReferenceId, teamSide),
    FOREIGN KEY (gameReferenceId, id) REFERENCES plays (gameReferenceId, id)
);

-- ---------------------------------------------------------------------------
-- players: dimension built from the event rows after load.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS players (
    playerReferenceId INTEGER PRIMARY KEY,
    firstName         TEXT,
    lastName          TEXT,
    position          TEXT,
    jersey            TEXT,
    team              TEXT                     -- most recent team seen
);

-- ---------------------------------------------------------------------------
-- Indexes for common exploratory queries
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_plays_game        ON plays (gameReferenceId);
CREATE INDEX IF NOT EXISTS idx_plays_name        ON plays (name);
CREATE INDEX IF NOT EXISTS idx_plays_team        ON plays (team);
CREATE INDEX IF NOT EXISTS idx_plays_player      ON plays (playerReferenceId);
CREATE INDEX IF NOT EXISTS idx_plays_manpower    ON plays (manpowerSituation);
-- Covers the (name, manpowerSituation, team) combo that every PP/PK
-- report, entry/shot-carrier breakdown, and heatmap-location query
-- filters on together — those single-column indexes above each only
-- narrow things down a little on their own for this shape of query.
CREATE INDEX IF NOT EXISTS idx_plays_name_manpower_team ON plays (name, manpowerSituation, team);
CREATE INDEX IF NOT EXISTS idx_onice_player      ON on_ice (playerReferenceId);
CREATE INDEX IF NOT EXISTS idx_onice_event       ON on_ice (gameReferenceId, id);
