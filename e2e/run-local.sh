#!/bin/sh
# Runs Playwright specs on Chrome 147 against `ng serve --port 4300`, without
# retries, and prints only the failures and the summary. The full output goes
# to e2e/test-results/run-local.log (git-ignored; Playwright empties its own
# results folder on start).
#
#   sh e2e/run-local.sh T43                 # one spec
#   sh e2e/run-local.sh T43 T44             # several
#   PROJECT=webkit sh e2e/run-local.sh T43
#   RESTART=1 sh e2e/run-local.sh T43       # restart the dev server first, e.g.
#                                           # after rebuilding the library
#
# Starts the dev server if nothing answers on port 4300. Port 4300 keeps it
# apart from an `ng serve` on the default port 4200.
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$DIR/.."
LOG="$DIR/test-results/run-local.log"
SERVER_LOG="$DIR/test-results/ng-serve-4300.log"
mkdir -p "$DIR/test-results"

if [ -n "$RESTART" ]; then
  lsof -ti tcp:4300 -sTCP:LISTEN | xargs kill 2>/dev/null
  sleep 2
fi
if ! curl -s -o /dev/null http://localhost:4300/; then
  (cd "$ROOT" && nohup npx ng serve --port 4300 > "$SERVER_LOG" 2>&1 &)
fi
for i in $(seq 1 120); do
  curl -s -o /dev/null http://localhost:4300/ && break
  sleep 2
done

E2E_BASE_URL=http://localhost:4300 npx --prefix "$ROOT" playwright test --config="$DIR/playwright.config.ts" \
  --project="${PROJECT:-chrome-147}" --retries=0 --reporter=line "$@" > "$LOG" 2>&1
grep -E "^\s+[0-9]+\) |Error:|Timeout|waiting for|^\s+Expected|^\s+Received|^\s+[0-9]+ (passed|failed|skipped|flaky)" "$LOG" | head -80
