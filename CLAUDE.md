# Coaches Station — Project Context for Claude Code

This file is read automatically at the start of every Claude Code session in
this repo. It exists so you don't have to re-explain the project each time.
Erik maintains his own personalized copy of this same file in his own
clone — this version is mine, tailored to my workflow.

## Before doing anything else: pull first

**Erik pushes to this same repo from his own machine now.** At the start of
every session, run `git pull` before making any changes — if there's
nothing new, this is a no-op; if there is, you want to be editing his
latest version, not a stale one you'd conflict with later. If `git pull`
reports local changes need to be stashed/committed first, stop and ask
rather than force anything — that usually means there's uncommitted work
from a previous session worth checking before proceeding. Note that
`CLAUDE.md` itself is one of the files that can genuinely diverge this way
(each of us edits our own copy) — if a pull touches it, check the result
actually reflects my preferences below rather than assuming it merged
cleanly.

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
  - `tab-babcock.js`, `tab-smith.js`, `tab-mcfarland.js`, `tab-segall.js` —
    mine; `tab-elenz.js` — Erik's
  - `faceoff.js`, `shootout.js` — native feature modules, same `mount()`
    pattern, pull live from their own API endpoints
  - `season-2025-26.js`, `rink-images.js` — embedded static data
  - Hosted on GitHub Pages at `ndsegall.github.io/Coaches-Station`
- **Backend:** `api.py` — FastAPI, deployed on Fly.io
  (`coaches-station-api.fly.dev`), with a persistent SQLite volume holding
  the full season's PSF play-by-play data (~8.35GB). `schema.sql` and
  `load_nhl.py` define/populate that database.

## Repo layout on my machine

- Git clone (the one Claude Code should actually work in):
  `~/Projects/Coaches-Station`
- Dropbox editing folder (kept in sync via `publish.py`, **not** a git
  repo — never point git at this folder directly, Dropbox syncing corrupts
  `.git`):
  `~/Oilers Coaching Dropbox/.../2026-27/Claude/Coaches Station/Coaches Station Pages/`
- `index.html` and `h2h-shared.js` are shared with Erik — both of us touch
  these occasionally. A push to `main` deploys automatically (see below), so
  pushing a shared-file change goes live immediately for everyone — worth a
  heads-up to Erik for anything beyond a small fix. The other `tab-*.js`
  files are mine; I shouldn't need to touch `tab-elenz.js`.

## Deploying

- **Frontend-only changes:** `python3 publish.py` from the Dropbox project
  root — copies files from Dropbox into the git repo, commits, pushes. It
  pulls first and will refuse if the repo has newer content than Dropbox
  (that check is real and correct now — Erik pushes directly to git, so his
  changes can land there before Dropbox catches up). GitHub Pages deploys
  automatically on every push to `main` either way — there's no separate
  publish step beyond getting the commit pushed.
- **Backend (`api.py`) changes:** need `flyctl deploy` from
  `Coaches Station API/` — a separate, real deploy, not covered by
  `publish.py` or a plain `git push` at all. Go ahead and run `flyctl
  deploy` directly when a backend change is ready — no need to ask for
  confirmation first, that's pre-authorized standing instruction for this
  repo. Still test against a local copy first where possible (see "Local
  development" below), and say so explicitly when that isn't possible (no
  local DB, no way to exercise the changed code path) rather than deploying
  untested changes silently.
- Since Claude Code edits the git clone directly rather than the Dropbox
  folder, changes made here still need to flow back to Dropbox before
  `publish.py`'s normal flow picks them up — or I run `git push` from the
  clone directly and treat this as the new primary editing location instead.
  Ask if it's unclear which direction to sync.

## Deploying Erik's backend changes

Erik works on this repo too, but doesn't have Fly.io access — deploys
have to come from me. He commits and pushes his own backend (`api.py`)
changes to `main` directly, testing locally first where possible, but
he can't run `flyctl deploy` — so his changes sit live-in-git but not
live-in-production until I do.

**Deploy automatically, no need to ask me first:**
- At the start of a session (or whenever you're about to do other work
  in this repo), check `git log -- api.py` for commits authored by
  Erik since the last deploy that haven't gone live yet.
- `git pull`, skim the diff to `api.py` for anything that looks clearly
  wrong (touches the DB schema in a way that looks destructive, changes
  a query another tab depends on, etc.) — this is a sanity check, not a
  full review.
- If it looks reasonable, `flyctl deploy` from `Coaches Station API/`.
  This is the same standing authorization I already have for my own
  backend changes — Erik's commits get the same treatment, no separate
  ask needed each time.
- If something looks risky or a deploy fails, hold off and loop me in
  directly rather than guessing or retrying blindly.

One thing worth knowing: this means a backend change goes live to
everyone the moment it's pushed to git, same as frontend changes
already do — there's no human-in-the-loop gate on Erik's side of this
specific flow anymore.

## Local development

- **Frontend:** opening `index.html` via `file://` blocks the API calls it
  makes on load (CORS). Use `Preview Coaches Station Locally.command`
  (serves it over `http://localhost`) instead.
- **Backend:** `api.py` reads its database path from `DB_PATH`, which is
  only set in production (`fly.toml`). Locally, with no `DB_PATH` set, it
  just uses a plain `nhl.db` next to itself — so a small test database
  works with zero code changes. One-time setup:
  1. `pip3 install -r requirements.txt`
  2. Get a handful of sample `playsequence-*.csv` files
  3. `python3 load_nhl.py --src <folder of those CSVs> --db dev_nhl.db --reset`
  4. Double-click `Run Local Dev API.command` (next to `api.py`)
- **Connecting the two:** load the frontend with `?api=local` in the URL to
  point it at `http://localhost:8000` instead of production. No query
  param = production, unchanged — this is opt-in only.

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
- **Never hardcode the regular-season/playoff boundary date.** This bit
  both the frontend and backend earlier and had to be fixed to derive
  dynamically per season (see how `playoffStart` / `RS_END` / `PO_START`
  work in `index.html`, and `_fo_rs_game_count`-style game-count logic in
  `api.py`) instead of a literal date string.
- **Scoring-chance classification** (Rush/Cycle/Forecheck/2nd Chance/OZ
  Play) is possession-chain based — see
  `Scoring_Chance_Derivation_Reference.md` for the full logic before
  touching anything chance-related. Rush and Total Shot Attempts are the
  reliable signals; Cycle is the acknowledged soft spot (it depends on
  player movement/intent that isn't fully recoverable from event labels).

## Recently added (Aug 6, 2026) — know before touching `index.html`

- **URL routing:** every overlay/modal has its own hash address (e.g.
  `#o=prep&role=mcfarland&game=2026020028`), supporting deep links and
  normal back/forward. Self-contained block near the end of the script
  (search `URL ROUTING`). It watches each overlay's `visible` class via
  `MutationObserver` and reflects it into the hash — never duplicates the
  app's real open/close logic, just decides which button to click when the
  hash changes. New overlays don't get a URL automatically; that's a manual
  addition to `ROUTES` and `computeHashFromDom`.
- **Role URL names differ from internal values**: `role=segall` in the URL
  maps to the internal `video-coach` value everywhere else in the code;
  `role=babcock` maps to `head-coach`. This mapping lives only in the
  router block (`ROLE_TO_URL`/`ROLE_FROM_URL`) — nowhere else changed.
- **Pre-Scout Prep shows 5 upcoming games**, not just the next one, as
  clickable boxes. Backend: `/api/prep/upcoming-games` (schedule-only,
  fast) and `/api/prep/game/{gameId}` (full payload for one game).
  `/api/prep/next-game` is unchanged for backward compatibility. Frontend
  state: `_prepData`, `_prepUpcomingGames`, `_prepSelectedGameId`. The
  picker proactively warms all 5 games' data (including the separately-
  cached PK/PP visual heatmaps) in the background when it opens, since
  those heatmaps were the actual cause of slow game-switching, not the
  per-game payload itself.

## My working style

- **Direct and terse.** I expect you to take ownership of follow-through
  without me reminding you — if something obviously needs updating (e.g. a
  hardcoded value made dynamic elsewhere, a pattern established in one
  place that should apply elsewhere), just do it.
- **No emoji, anywhere, in code or comments.**
- **Verify with real tests before calling something done** — actual
  execution against sample data, byte-identical diffs where relevant, not
  "it parses" or "it looks right." If you can't test against the real
  environment (no live DB access, no deployed backend), say so explicitly
  rather than presenting something as verified when it isn't.
- **Diagnose before implementing.** Confirm what's actually wrong before
  writing a fix. If diagnosis is taking a long time, say so and move to
  best-effort rather than spinning indefinitely.
- **Complex string replacements**: use a script rather than manual
  multi-line find/replace when there's real risk of escaping mistakes;
  syntax-check afterward (`python3 -m py_compile`, `node --check`).
- **Don't hardcode what should be derived** — season boundaries, game
  counts, anything that varies by season/context. This has bitten the
  project multiple times already.
- **Escape key and clicking outside a popup should always close it** —
  established convention across every overlay in the app.
- I'll catch factual errors in your reasoning and correct them directly —
  take the correction and move on, no need to over-apologize.
