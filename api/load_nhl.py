#!/usr/bin/env python3
"""
Load a folder of NHL play-sequence CSV files into a SQLite database.

Usage:
    python load_nhl.py                       # load ./*.csv into ./nhl.db
    python load_nhl.py --src DIR --db FILE   # explicit source dir / db path
    python load_nhl.py --src DIR --reset     # drop & recreate tables first

Each CSV is one game. Filenames are expected to look like:
    playsequence-YYYYMMDD-LEAGUE-AWAYvsHOME-SEASON-GAMEID.csv

The script is idempotent per game: re-loading a file replaces that game's rows.
"""

import argparse
import csv
import glob
import os
import re
import sqlite3
import sys

# --- Column type maps (schema is fixed/known, so map explicitly) -------------
INT_COLS = {
    "gameReferenceId", "id", "period", "currentPossession",
    "currentPlayInPossession", "frame", "scoreDifferential",
    "teamSkatersOnIce", "opposingTeamSkatersOnIce", "playerReferenceId",
}
REAL_COLS = {
    "periodTime", "gameTime", "xCoord", "yCoord", "xAdjCoord", "yAdjCoord",
    "expectedGoalsOnNet", "expectedGoalsAllShots",
}
BOOL_COLS = {
    "isPossessionEvent", "isDefensiveEvent",
    "isPossessionBreaking", "isLastPlayOfPossession",
}
# Single-player ref columns (tab-prefixed single id; blank => NULL)
GOALIE_COLS = {"teamGoalieOnIceRef", "opposingTeamGoalieOnIceRef"}
# Comma-separated lists of player refs (tab-prefixed); stored cleaned + normalized
REF_LIST_COLS = {
    "teamForwardsOnIceRefs", "teamDefencemenOnIceRefs",
    "opposingTeamForwardsOnIceRefs", "opposingTeamDefencemenOnIceRefs",
}

# All 47 source columns, in CSV order -> also the plays insert order.
PLAYS_COLS = [
    "gameReferenceId", "id", "period", "periodTime", "gameTime",
    "currentPossession", "teamInPossession", "currentPlayInPossession",
    "isPossessionEvent", "isDefensiveEvent", "isPossessionBreaking",
    "isLastPlayOfPossession", "frame", "timecode", "shorthand", "name",
    "zone", "type", "outcome", "flags", "previousName", "previousType",
    "previousOutcome", "xCoord", "yCoord", "xAdjCoord", "yAdjCoord",
    "scoreDifferential", "manpowerSituation", "teamSkatersOnIce",
    "teamForwardsOnIceRefs", "teamDefencemenOnIceRefs", "teamGoalieOnIceRef",
    "opposingTeamSkatersOnIce", "opposingTeamForwardsOnIceRefs",
    "opposingTeamDefencemenOnIceRefs", "opposingTeamGoalieOnIceRef",
    "team", "playerJersey", "playerPosition", "playerFirstName",
    "playerLastName", "playerReferenceId", "playZone", "playSection",
    "expectedGoalsOnNet", "expectedGoalsAllShots",
]

FNAME_RE = re.compile(
    r"playsequence-(\d{8})-([A-Za-z]+)-([A-Za-z0-9]+)vs([A-Za-z0-9]+)-(\w+)-(\d+)",
    re.IGNORECASE,
)


def clean_refs(raw):
    """'\\t8475786, 8478402' -> '8475786, 8478402'  (strip tabs/whitespace)."""
    if raw is None:
        return None
    cleaned = raw.replace("\t", "").strip()
    if not cleaned:
        return None
    return ", ".join(p.strip() for p in cleaned.split(",") if p.strip())


def to_int(v):
    if v is None or v == "":
        return None
    try:
        return int(float(v))   # tolerate "5.0"
    except (ValueError, TypeError):
        return None


def to_real(v):
    if v is None or v == "":
        return None
    try:
        return float(v)
    except (ValueError, TypeError):
        return None


def to_bool(v):
    if v is None or v == "":
        return None
    return 1 if str(v).strip().lower() == "true" else 0


def single_ref(v):
    """Goalie ref: '\\t8478971' -> 8478971 ; '\\t' / '' -> None (pulled)."""
    cleaned = clean_refs(v)
    return to_int(cleaned) if cleaned else None


def parse_filename(path):
    base = os.path.basename(path)
    m = FNAME_RE.search(base)
    if not m:
        return {"sourceFile": base}
    d, league, away, home, season, gid = m.groups()
    return {
        "gameReferenceId": int(gid),
        "gameDate": f"{d[0:4]}-{d[4:6]}-{d[6:8]}",
        "league": league.upper(),
        "awayTeamAbbrev": away.upper(),   # assumption: AWAYvsHOME ordering
        "homeTeamAbbrev": home.upper(),
        "matchup": f"{away}vs{home}",
        "season": season,
        "sourceFile": base,
    }


def convert_row(row):
    """Map one CSV dict row to a tuple in PLAYS_COLS order."""
    out = []
    for col in PLAYS_COLS:
        v = row.get(col, "")
        if col in BOOL_COLS:
            out.append(to_bool(v))
        elif col in GOALIE_COLS:
            out.append(single_ref(v))
        elif col in REF_LIST_COLS:
            out.append(clean_refs(v))
        elif col in INT_COLS:
            out.append(to_int(v))
        elif col in REAL_COLS:
            out.append(to_real(v))
        else:
            out.append(v if v != "" else None)
    return out


def build_on_ice_rows(row, game_id, event_id):
    """Explode the on-ice ref columns into normalized (event x player) rows."""
    specs = [
        ("teamForwardsOnIceRefs", "for", "F"),
        ("teamDefencemenOnIceRefs", "for", "D"),
        ("teamGoalieOnIceRef", "for", "G"),
        ("opposingTeamForwardsOnIceRefs", "against", "F"),
        ("opposingTeamDefencemenOnIceRefs", "against", "D"),
        ("opposingTeamGoalieOnIceRef", "against", "G"),
    ]
    rows = []
    seen = set()  # guard against dup (player, side) within one event
    for col, side, grp in specs:
        cleaned = clean_refs(row.get(col, ""))
        if not cleaned:
            continue
        for token in cleaned.split(","):
            pid = to_int(token.strip())
            if pid is None:
                continue
            key = (pid, side)
            if key in seen:
                continue
            seen.add(key)
            rows.append((game_id, event_id, pid, side, grp))
    return rows


def ensure_schema(conn, reset=False):
    here = os.path.dirname(os.path.abspath(__file__))
    schema_path = os.path.join(here, "schema.sql")
    with open(schema_path, encoding="utf-8") as f:
        ddl = f.read()
    if reset:
        conn.executescript(
            "DROP TABLE IF EXISTS on_ice;"
            "DROP TABLE IF EXISTS plays;"
            "DROP TABLE IF EXISTS players;"
            "DROP TABLE IF EXISTS games;"
        )
    conn.executescript(ddl)


def load_file(conn, path):
    meta = parse_filename(path)
    game_id = meta.get("gameReferenceId")

    play_rows, on_ice_rows = [], []
    with open(path, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            gid = to_int(row.get("gameReferenceId"))
            eid = to_int(row.get("id"))
            if game_id is None:
                game_id = gid                       # fall back to data
            play_rows.append(convert_row(row))
            if gid is not None and eid is not None:
                on_ice_rows.extend(build_on_ice_rows(row, gid, eid))

    if game_id is None:
        print(f"  ! skipping (no game id): {path}", file=sys.stderr)
        return 0

    # Replace any existing rows for this game (idempotent re-load).
    conn.execute("DELETE FROM on_ice WHERE gameReferenceId = ?", (game_id,))
    conn.execute("DELETE FROM plays  WHERE gameReferenceId = ?", (game_id,))

    # Insert the games row first so plays' foreign key resolves.
    conn.execute(
        "INSERT OR REPLACE INTO games "
        "(gameReferenceId, gameDate, league, season, awayTeamAbbrev, "
        " homeTeamAbbrev, matchup, sourceFile, numPlays) "
        "VALUES (?,?,?,?,?,?,?,?,?)",
        (
            game_id, meta.get("gameDate"), meta.get("league"),
            meta.get("season"), meta.get("awayTeamAbbrev"),
            meta.get("homeTeamAbbrev"), meta.get("matchup"),
            meta.get("sourceFile"), len(play_rows),
        ),
    )

    placeholders = ",".join(["?"] * len(PLAYS_COLS))
    conn.executemany(
        f"INSERT INTO plays ({','.join(PLAYS_COLS)}, sourceFile) "
        f"VALUES ({placeholders}, ?)",
        [tuple(r) + (meta.get("sourceFile"),) for r in play_rows],
    )
    conn.executemany(
        "INSERT OR IGNORE INTO on_ice "
        "(gameReferenceId, id, playerReferenceId, teamSide, positionGroup) "
        "VALUES (?, ?, ?, ?, ?)",
        on_ice_rows,
    )
    return len(play_rows)


def rebuild_players(conn):
    """Derive the players dimension from the loaded events."""
    conn.execute("DELETE FROM players")
    conn.execute(
        """
        INSERT INTO players (playerReferenceId, firstName, lastName,
                             position, jersey, team)
        SELECT playerReferenceId,
               MAX(playerFirstName),
               MAX(playerLastName),
               MAX(playerPosition),
               MAX(playerJersey),
               MAX(team)
        FROM plays
        WHERE playerReferenceId IS NOT NULL
        GROUP BY playerReferenceId
        """
    )


def main():
    ap = argparse.ArgumentParser(description="Load NHL play-sequence CSVs into SQLite.")
    ap.add_argument("--src", default=".", help="folder containing the CSV files")
    ap.add_argument("--db", default="nhl.db", help="output SQLite database path")
    ap.add_argument("--glob", default="playsequence-*.csv", help="filename pattern")
    ap.add_argument("--reset", action="store_true", help="drop & recreate tables first")
    args = ap.parse_args()

    files = sorted(glob.glob(os.path.join(args.src, args.glob)))
    if not files:
        print(f"No files matching {args.glob!r} in {args.src!r}", file=sys.stderr)
        sys.exit(1)

    conn = sqlite3.connect(args.db)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    ensure_schema(conn, reset=args.reset)

    total = 0
    for i, path in enumerate(files, 1):
        n = load_file(conn, path)
        total += n
        conn.commit()
        print(f"[{i}/{len(files)}] {os.path.basename(path)} -> {n} plays")

    rebuild_players(conn)
    conn.commit()

    games = conn.execute("SELECT COUNT(*) FROM games").fetchone()[0]
    players = conn.execute("SELECT COUNT(*) FROM players").fetchone()[0]
    onice = conn.execute("SELECT COUNT(*) FROM on_ice").fetchone()[0]
    conn.close()

    print("-" * 60)
    print(f"Done. {games} games, {total} plays, {onice} on-ice rows, "
          f"{players} players -> {args.db}")


if __name__ == "__main__":
    main()
