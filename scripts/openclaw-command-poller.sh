#!/bin/bash
# OpenClaw Command Poller
# Runs every 5s via LaunchAgent
# Polls dashboard for pending commands, executes locally, posts results back
# Compatible with macOS (Darwin) and Linux

DASHBOARD_URL="${OPENCLAW_DASHBOARD_URL:-https://socialsculp-dashboard.vercel.app}"
REPORTER_SECRET="${OPENCLAW_REPORTER_SECRET}"
OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"

if [ -z "$REPORTER_SECRET" ]; then
  echo "[cmd-poller] OPENCLAW_REPORTER_SECRET not set" >&2
  exit 1
fi

# Whitelist (redundant safety — dashboard also validates)
# Paths are relative to $OPENCLAW_HOME for portability
ALLOWED_PREFIXES=(
  "openclaw"
  "launchctl list ai.openclaw"
  "cat ${OPENCLAW_HOME}/"
  "ls ${OPENCLAW_HOME}/"
  "tail ${OPENCLAW_HOME}/"
  "uptime"
  "vm_stat"
  "sysctl"
  "df -h"
  "ps aux | grep openclaw"
)

is_allowed() {
  local cmd="$1"
  for prefix in "${ALLOWED_PREFIXES[@]}"; do
    if [[ "$cmd" == "$prefix"* ]]; then
      return 0
    fi
  done
  return 1
}

# Fetch pending commands
RESPONSE=$(curl -s -w "\n%{http_code}" \
  "${DASHBOARD_URL}/api/openclaw/commands/pending" \
  -H "x-reporter-secret: ${REPORTER_SECRET}" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  exit 0
fi

# Parse commands
COMMANDS=$(echo "$BODY" | jq -c '.commands[]' 2>/dev/null)
if [ -z "$COMMANDS" ]; then
  exit 0
fi

echo "$COMMANDS" | while IFS= read -r CMD_JSON; do
  CMD_ID=$(echo "$CMD_JSON" | jq -r '.id')
  CMD_TEXT=$(echo "$CMD_JSON" | jq -r '.command')

  if ! is_allowed "$CMD_TEXT"; then
    # Post back as failed
    curl -s -X POST "${DASHBOARD_URL}/api/openclaw/commands/result" \
      -H "Content-Type: application/json" \
      -H "x-reporter-secret: ${REPORTER_SECRET}" \
      -d "{\"id\":\"$CMD_ID\",\"output\":\"Command not allowed\",\"exitCode\":1,\"duration\":0}" >/dev/null 2>&1
    continue
  fi

  # Execute command
  START_MS=$(python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || echo "0")
  OUTPUT=$(bash -c "$CMD_TEXT" 2>&1)
  EXIT_CODE=$?
  END_MS=$(python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || echo "0")
  DURATION=$((END_MS - START_MS))

  # Escape output for JSON
  ESCAPED_OUTPUT=$(echo "$OUTPUT" | head -c 10000 | jq -Rs '.')

  # Post result back
  curl -s -X POST "${DASHBOARD_URL}/api/openclaw/commands/result" \
    -H "Content-Type: application/json" \
    -H "x-reporter-secret: ${REPORTER_SECRET}" \
    -d "{\"id\":\"$CMD_ID\",\"output\":$ESCAPED_OUTPUT,\"exitCode\":$EXIT_CODE,\"duration\":$DURATION}" >/dev/null 2>&1

  echo "[cmd-poller] Executed: $CMD_TEXT (exit=$EXIT_CODE, ${DURATION}ms)"
done
