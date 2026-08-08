# Coaches Station — Project Context for Claude Code

This file is read automatically at the start of every Claude Code session in
this repo. It exists so you don't have to re-explain the project each time.

## Before doing anything else: pull first

Noah pushes to this same repo from his own machine too. At the start of
every session, run `git pull` before making any changes — if there's
nothing new, this is a no-op; if there is, you want to be editing his
latest version, not a stale one you'd conflict with later. If `git pull`
reports local changes need to be stashed/committed first, stop and ask
rather than force anything — that usually means there's uncommitted work
from a previous session worth checking before proceeding.

## What this is

Coaches Station is an internal hockey analytics dashboard for the Edmonton
Oilers coaching staff (Babcock, McFarland, Smith, Segall, Elenz). It handles
game recaps, pre-scout opponent prep, league stats, standings, faceoff and
shootout analysis, and goal-category tracking. It needs to be fast, reliable,
and usable daily without manual data uploads once PSF data is loaded.

## Architecture

- **Frontend:** `index.html` (~1.15MB shell — dispatch, styling, and most
  logic) + separate JS modules:
  - `h2h-shared.js` — shared team-stats/xG context builder
    (`buildH2HContext`), used by every coach tab
  - `tab-elenz.js` — **yours**; `tab-babcock.js`, `tab-smith.js`,
    `tab-mcfarland.js`, `tab-segall.js` — Noah's
  - `faceoff.js`, `shootout.js` — native feature modules, same `mount()`
    pattern, pull live from their own API endpoints
  - `season-2025-26.js`, `rink-images.js` — embedded static data
  - Hosted on GitHub Pages at `ndsegall.github.io/Coaches-Station`
- **Backend:** `api.py` — FastAPI, deployed on Fly.io
  (`coaches-station-api.fly.dev`), with a persistent SQLite volume holding
  the full season's PSF play-by-play data (~8.35GB). `schema.sql` and
  `load_nhl.py` define/populate that database.

## Staying in your lane (mostly)

- **`tab-elenz.js`** is yours — edit freely, push whenever you're ready.
- **`index.html`** and **`h2h-shared.js`** are shared — both of you touch
  these occasionally. Since a push to `main` deploys automatically (see
  below), pushing a shared-file change means it goes live immediately for
  everyone — worth a heads-up to Noah for anything beyond a small fix.
- The other `tab-*.js` files are Noah's — you shouldn't need to touch these.

## Deploying

There's no separate "publish" step for you — GitHub Pages deploys
automatically on every push to `main`. `git push` **is** the deploy. (Noah's
setup is different: he edits through a Dropbox folder synced into this repo
by a script called `publish.py` — that's specific to his machine, not
something you need.)

**Backend (`api.py`) changes** need a real `flyctl deploy` from
`Coaches Station API/` to actually go live on the production API — pushing
to git alone doesn't deploy the backend. Don't deploy backend changes you
haven't tested locally first (see below) — that's the API everyone's
actually using.

## Local development

- **Frontend:** opening `index.html` via `file://` blocks the API calls it
  makes on load (CORS). Use `Preview Coaches Station Locally.command`
  (put it in this same folder) instead — it serves the page over
  `http://localhost` so those calls work normally.
- **Backend:** `api.py` reads its database path from a `DB_PATH`
  environment variable, which is only ever set in production
  (`fly.toml`). Locally, with no `DB_PATH` set, it just uses a plain
  `nhl.db` sitting next to itself — so testing against a small local
  database needs zero code changes. One-time setup:
  1. `pip3 install -r requirements.txt`
  2. Get a handful of sample `playsequence-*.csv` files from Noah
  3. `python3 load_nhl.py --src <folder of those CSVs> --db dev_nhl.db --reset`
  4. Double-click `Run Local Dev API.command` (put it next to `api.py`)
- **Connecting the two:** load the frontend with `?api=local` added to the
  URL to point it at your local API (`localhost:8000`) instead of
  production. No query param = production, unchanged.

## PSF data model — critical rules before touching `plays` derivation logic

- **Goals are two rows**, not one: a shot row flagged `withgoal`, plus a
  separate `name=='goal'` row. Shot-attempt counts must exclude both.
- **`zone`** on an event is relative to the acting player's own team
  (`team` column), not a fixed rink half. A faceoff that's `zone='dz'` for
  one team is the same physical draw location but `zone='oz'` for the
  other — PSF gives each team its own row, so filtering `zone='dz'` already
  correctly represents that team's own defensive-zone events without
  double-counting.
- **Coordinates:** `xCoord`/`yCoord` are raw; `xAdjCoord`/`yAdjCoord` are
  normalized so each team's attacking direction is always consistent
  regardless of which end they're actually shooting at.
- **Manpower:** `manpowerSituation` is `evenStrength` / `powerPlay` /
  `shortHanded`.
- **Never hardcode the regular-season/playoff boundary date.** This has bit
  the project more than once already — it needs to derive dynamically per
  season (see `playoffStart` / `RS_END` / `PO_START` in `index.html`)
  rather than a literal date string.
- **Scoring-chance classification** (Rush/Cycle/Forecheck/2nd Chance/OZ
  Play) is possession-chain based — see
  `Scoring_Chance_Derivation_Reference.md` before touching anything
  chance-related. Rush and Total Shot Attempts are the reliable signals;
  Cycle is the acknowledged soft spot.

## Recently added (Aug 6, 2026) — know before touching `index.html`

- **URL routing:** every overlay/modal has its own hash address (e.g.
  `#o=prep&role=mcfarland&game=2026020028`), supporting deep links and
  normal back/forward. Self-contained block near the end of the script
  (search `URL ROUTING`). New overlays don't get a URL automatically —
  that's a manual addition to `ROUTES` and `computeHashFromDom` in that
  block.
- **Role URL names differ from internal values**: `role=segall` in the URL
  maps to the internal `video-coach` value used everywhere else in the
  code; `role=babcock` maps to `head-coach`. This mapping lives only in the
  router block (`ROLE_TO_URL`/`ROLE_FROM_URL`) — nowhere else changed.
- **Pre-Scout Prep shows 5 upcoming games**, not just the next one, as
  clickable boxes. Backend: `/api/prep/upcoming-games` (schedule-only,
  fast) and `/api/prep/game/{gameId}` (full payload for one game).
  `/api/prep/next-game` is unchanged for backward compatibility.

## General conventions

- **No emoji, anywhere, in code or comments.**
- **Escape key and clicking outside a popup should always close it** —
  established convention across every overlay in the app.
- **Verify with real tests before calling something done** where possible
  — actual execution against sample data, not just "it parses." If you
  can't test against the real environment (no live DB access, backend not
  deployed), say so explicitly.
- **Don't hardcode what should be derived** — season boundaries, game
  counts, anything that varies by season/context.

Feel free to add your own preferences to this file as you find them — it's
yours to edit, same as Noah edits his own copy in his clone.
