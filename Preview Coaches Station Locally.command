#!/bin/bash
# Double-click this to preview Coaches Station locally.
#
# Why this exists: opening index.html directly (file://) blocks the API
# calls the page makes on load (login, prep data, etc.) due to CORS. This
# runs a tiny local web server instead, which browsers treat as a normal
# origin, so those calls work exactly like they do on the live site.
#
# Put this file in the SAME folder as index.html (the root of your git
# clone) before double-clicking it.

cd "$(dirname "$0")"

PORT=8765

# Free up the port if a previous run is still holding it
lsof -ti:$PORT | xargs kill -9 2>/dev/null

python3 -m http.server $PORT &
SERVER_PID=$!

sleep 0.8
open "http://localhost:$PORT/index.html"

echo "Coaches Station (local preview) running at http://localhost:$PORT"
echo "This is your local files, not the live site — changes here don't"
echo "affect anything until you commit and push them."
echo ""
echo "Close this window (or press Ctrl+C) to stop the local server."

wait $SERVER_PID
