#!/bin/bash
# Double-click this to run the Coaches Station API locally.
#
# This runs YOUR copy of api.py, against a small local test database
# (dev_nhl.db, in this same folder) — not the real production database,
# and not the live coaches-station-api.fly.dev API everyone actually uses.
# Nothing you do here can affect production.
#
# One-time setup before your first run:
#   1. pip3 install -r requirements.txt
#   2. Get a few sample playsequence CSVs from Noah (a whole season isn't
#      needed for most development — a handful of games is plenty).
#   3. python3 load_nhl.py --src <folder-of-those-CSVs> --db dev_nhl.db --reset
#
# Put this file in the same folder as api.py before double-clicking it.

cd "$(dirname "$0")"

export DB_PATH="$(pwd)/dev_nhl.db"

if [ ! -f "$DB_PATH" ]; then
  echo "No dev_nhl.db found in this folder yet."
  echo "Run load_nhl.py first to build one (see the comment at the top of"
  echo "this file for the one-time setup steps)."
  echo ""
  echo "Press Enter to close this window."
  read
  exit 1
fi

echo "Starting the API locally against: $DB_PATH"
echo "Once it's running, load the frontend with ?api=local added to the"
echo "URL (e.g. http://localhost:8765/index.html?api=local) so it talks"
echo "to this local API instead of the real production one."
echo ""
echo "Press Ctrl+C to stop the server."
echo ""

python3 -m uvicorn api:app --reload --port 8000
