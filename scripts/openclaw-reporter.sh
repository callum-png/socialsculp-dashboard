#!/bin/bash
# OpenClaw Mission Control Reporter v2
# Runs every 60s via LaunchAgent, POSTs status heartbeat to SocialSculp dashboard
# Uses `openclaw status --json` as primary data source (v2026.3.24+)

DASHBOARD_URL="${OPENCLAW_DASHBOARD_URL:-https://socialsculp-dashboard.vercel.app}"
REPORTER_SECRET="${OPENCLAW_REPORTER_SECRET}"

# IMPORTANT: Do NOT set OPENCLAW_HOME — the CLI auto-detects ~/.openclaw and
# setting it explicitly causes double-nesting bugs (/.openclaw/.openclaw/).
# We only use this variable for workspace file paths, not for CLI commands.
OPENCLAW_DATA_DIR="${HOME}/.openclaw"
unset OPENCLAW_HOME

if [ -z "$REPORTER_SECRET" ]; then
  echo "[reporter] OPENCLAW_REPORTER_SECRET not set, skipping" >&2
  exit 1
fi

OS_TYPE=$(uname -s)

# Ensure /usr/sbin is in PATH (needed for sysctl, vm_stat under LaunchAgent)
export PATH="/usr/sbin:/sbin:$PATH"

# ─── System Vitals ────────────────────────────────────────────────────────────
if [ "$OS_TYPE" = "Darwin" ]; then
  UPTIME=$(uptime | sed 's/.*up //' | sed 's/,.*//')
  CPU=$(ps -A -o %cpu | awk '{s+=$1} END {printf "%.0f", s/NR}' 2>/dev/null || echo "0")
  MEM_TOTAL=$(/usr/sbin/sysctl -n hw.memsize 2>/dev/null || echo "0")
  PAGE_SIZE=$(/usr/sbin/sysctl -n hw.pagesize 2>/dev/null || echo "16384")
  PAGES_ACTIVE=$(/usr/bin/vm_stat 2>/dev/null | awk '/Pages active:/ {gsub(/\./,"",$3); print $3}')
  PAGES_WIRED=$(/usr/bin/vm_stat 2>/dev/null | awk '/Pages wired down:/ {gsub(/\./,"",$4); print $4}')
  PAGES_COMPRESSED=$(/usr/bin/vm_stat 2>/dev/null | awk '/Pages occupied by compressor:/ {gsub(/\./,"",$5); print $5}')
  MEM_USED=$(( (${PAGES_ACTIVE:-0} + ${PAGES_WIRED:-0} + ${PAGES_COMPRESSED:-0}) * PAGE_SIZE ))
  DISK_INFO=$(df -b / | awk 'NR==2{print $3, $2}')
  DISK_USED=$(echo "$DISK_INFO" | awk '{print $1 * 512}')
  DISK_TOTAL=$(echo "$DISK_INFO" | awk '{print $2 * 512}')
  LOAD_AVG=$(/usr/sbin/sysctl -n vm.loadavg 2>/dev/null | awk '{printf "[%s,%s,%s]", $2, $3, $4}')
else
  UPTIME=$(uptime -p 2>/dev/null || uptime | awk '{print $3,$4}')
  CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'.' -f1 2>/dev/null || echo "0")
  MEM_USED=$(free -b | awk '/^Mem:/{print $3}')
  MEM_TOTAL=$(free -b | awk '/^Mem:/{print $2}')
  DISK_USED=$(df -B1 / | awk 'NR==2{print $3}')
  DISK_TOTAL=$(df -B1 / | awk 'NR==2{print $2}')
  LOAD_AVG=$(cat /proc/loadavg | awk '{printf "[%s,%s,%s]", $1, $2, $3}')
fi

# ─── OpenClaw Status (single command, all data) ─────────────────────────────
OC_STATUS_JSON="{}"
if command -v openclaw &>/dev/null; then
  OC_STATUS_RAW=$(openclaw status --json 2>/dev/null || echo "")
  if [ -n "$OC_STATUS_RAW" ] && echo "$OC_STATUS_RAW" | jq . &>/dev/null; then
    OC_STATUS_JSON="$OC_STATUS_RAW"
  fi
fi

# Extract gateway info from status
GW_RUNNING=$(echo "$OC_STATUS_JSON" | jq -r '.gateway.reachable // false')
GW_VERSION=$(echo "$OC_STATUS_JSON" | jq -r '.runtimeVersion // "unknown"')
GW_PID=$(echo "$OC_STATUS_JSON" | jq -r '.gatewayService.runtimeShort // ""' | grep -oE 'pid [0-9]+' | awk '{print $2}')
GW_LATENCY=$(echo "$OC_STATUS_JSON" | jq -r '.gateway.connectLatencyMs // 0')
GW_MODE=$(echo "$OC_STATUS_JSON" | jq -r '.gateway.mode // "unknown"')
GW_URL=$(echo "$OC_STATUS_JSON" | jq -r '.gateway.url // ""')

# Extract agent info from status
AGENTS_JSON=$(echo "$OC_STATUS_JSON" | jq -c '[.agents.agents // [] | .[] | {
  name: .id,
  model: (.model // "unknown"),
  sessionsCount: (.sessionsCount // 0),
  workspace: (.workspaceDir // ""),
  status: (if .lastActiveAgeMs != null and .lastActiveAgeMs < 300000 then "active" elif .lastActiveAgeMs != null then "idle" else "offline" end),
  lastActiveAgeMs: (.lastActiveAgeMs // null)
}]' 2>/dev/null || echo "[]")

# Extract session/token data from status
SESSIONS_JSON=$(echo "$OC_STATUS_JSON" | jq -c '[.sessions.recent // [] | .[] | {
  key: .key,
  agentId: .agentId,
  kind: .kind,
  model: (.model // "unknown"),
  modelProvider: (.modelProvider // "unknown"),
  inputTokens: (.inputTokens // 0),
  outputTokens: (.outputTokens // 0),
  cacheRead: (.cacheRead // 0),
  totalTokens: (.totalTokens // 0),
  contextTokens: (.contextTokens // 0),
  percentUsed: (.percentUsed // 0),
  remainingTokens: (.remainingTokens // 0),
  updatedAt: (.updatedAt // 0),
  ageMs: (.age // 0)
}]' 2>/dev/null || echo "[]")

# Extract models from status
MODELS_JSON="[]"
if command -v openclaw &>/dev/null; then
  MODELS_RAW=$(openclaw models list --json 2>/dev/null || echo "")
  if [ -n "$MODELS_RAW" ] && echo "$MODELS_RAW" | jq . &>/dev/null; then
    MODELS_JSON=$(echo "$MODELS_RAW" | jq -c '[.models // [] | .[] | {
      key: .key,
      name: .name,
      local: (.local // false),
      available: (.available // false),
      contextWindow: (.contextWindow // 0),
      tags: (.tags // [])
    }]' 2>/dev/null || echo "[]")
  fi
fi

# Extract service status
GW_SERVICE=$(echo "$OC_STATUS_JSON" | jq -c '{
  label: (.gatewayService.label // "unknown"),
  installed: (.gatewayService.installed // false),
  runtime: (.gatewayService.runtimeShort // "unknown")
}' 2>/dev/null || echo '{}')

NODE_SERVICE=$(echo "$OC_STATUS_JSON" | jq -c '{
  label: (.nodeService.label // "unknown"),
  installed: (.nodeService.installed // false),
  runtime: (.nodeService.runtimeShort // "unknown")
}' 2>/dev/null || echo '{}')

# Heartbeat config from status
HEARTBEAT_CONFIG=$(echo "$OC_STATUS_JSON" | jq -c '.heartbeat // {}' 2>/dev/null || echo '{}')

# Channel summary
CHANNELS_JSON=$(echo "$OC_STATUS_JSON" | jq -c '.channelSummary // []' 2>/dev/null || echo '[]')

# ─── Cron Jobs ───────────────────────────────────────────────────────────────
CRONS_JSON='{"jobs":[],"total":0}'
if command -v openclaw &>/dev/null; then
  CRONS_RAW=$(openclaw cron list --json 2>/dev/null || echo "")
  if [ -n "$CRONS_RAW" ] && echo "$CRONS_RAW" | jq . &>/dev/null; then
    # Flatten schedule object and state for the frontend
    CRONS_JSON=$(echo "$CRONS_RAW" | jq -c '{
      jobs: [.jobs // [] | .[] | {
        id: .id,
        name: .name,
        description: (.description // ""),
        schedule: (if .schedule.expr then .schedule.expr else (.schedule // "") end),
        timezone: (.schedule.tz // null),
        enabled: (.enabled // false),
        lastRun: null,
        lastStatus: null,
        nextRun: (if .state.nextRunAtMs then (.state.nextRunAtMs / 1000 | todate) else null end),
        runCount: (.state.runCount // 0)
      }],
      total: (.total // 0)
    }' 2>/dev/null || echo '{"jobs":[],"total":0}')
  fi
fi

# Cron scheduler status
CRON_STATUS='{"enabled":false}'
if command -v openclaw &>/dev/null; then
  CRON_STATUS_RAW=$(openclaw cron status --json 2>/dev/null || echo "")
  if [ -n "$CRON_STATUS_RAW" ] && echo "$CRON_STATUS_RAW" | jq . &>/dev/null; then
    CRON_STATUS=$(echo "$CRON_STATUS_RAW" | jq -c '.' 2>/dev/null || echo '{"enabled":false}')
  fi
fi

# ─── Workspace Stats ─────────────────────────────────────────────────────────
WS_DIR="${OPENCLAW_DATA_DIR}/workspace"
TARGETS="[]"
EMAILS_SENT=0
EMAILS_QUEUED=0
LEADS_TOTAL=0
TRACKER_ENTRIES=0

if [ -d "$WS_DIR" ]; then
  [ -f "$WS_DIR/tracker.json" ] && TRACKER_ENTRIES=$(jq 'length' "$WS_DIR/tracker.json" 2>/dev/null || echo "0")
  [ -f "$WS_DIR/emails-sent.json" ] && EMAILS_SENT=$(jq 'length' "$WS_DIR/emails-sent.json" 2>/dev/null || echo "0")
  [ -f "$WS_DIR/email-queue.json" ] && EMAILS_QUEUED=$(jq 'length' "$WS_DIR/email-queue.json" 2>/dev/null || echo "0")
  [ -f "$WS_DIR/apollo-leads.json" ] && LEADS_TOTAL=$(jq 'length' "$WS_DIR/apollo-leads.json" 2>/dev/null || echo "0")

  TARGETS=$(ls -d "$WS_DIR"/outreach-* 2>/dev/null | xargs -I{} basename {} | sed 's/outreach-//' | jq -R -s -c 'split("\n") | map(select(. != ""))' 2>/dev/null || echo "[]")
  [ "$TARGETS" = "" ] && TARGETS="[]"

  if [ "$TARGETS" = "[]" ] && [ -f "$WS_DIR/tracker.json" ]; then
    TARGETS=$(jq -c '[.[].target // .[].name] | unique | map(select(. != null))' "$WS_DIR/tracker.json" 2>/dev/null || echo "[]")
  fi
fi

# ─── OS Info from status ─────────────────────────────────────────────────────
OS_INFO=$(echo "$OC_STATUS_JSON" | jq -c '.os // {}' 2>/dev/null || echo '{}')

# ─── Build Payload ───────────────────────────────────────────────────────────
PAYLOAD=$(jq -n -c \
  --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg uptime "$UPTIME" \
  --argjson cpu "${CPU:-0}" \
  --argjson memUsed "${MEM_USED:-0}" \
  --argjson memTotal "${MEM_TOTAL:-0}" \
  --argjson diskUsed "${DISK_USED:-0}" \
  --argjson diskTotal "${DISK_TOTAL:-0}" \
  --argjson loadAvg "${LOAD_AVG:-[0,0,0]}" \
  --argjson gwRunning "$GW_RUNNING" \
  --arg gwPid "${GW_PID:-null}" \
  --arg gwVersion "$GW_VERSION" \
  --argjson gwLatency "${GW_LATENCY:-0}" \
  --arg gwMode "$GW_MODE" \
  --arg gwUrl "$GW_URL" \
  --argjson agents "$AGENTS_JSON" \
  --argjson sessions "$SESSIONS_JSON" \
  --argjson models "$MODELS_JSON" \
  --argjson crons "$CRONS_JSON" \
  --argjson cronStatus "$CRON_STATUS" \
  --argjson heartbeatConfig "$HEARTBEAT_CONFIG" \
  --argjson channels "$CHANNELS_JSON" \
  --argjson gwService "$GW_SERVICE" \
  --argjson nodeService "$NODE_SERVICE" \
  --argjson osInfo "$OS_INFO" \
  --argjson targets "$TARGETS" \
  --argjson emailsSent "$EMAILS_SENT" \
  --argjson emailsQueued "$EMAILS_QUEUED" \
  --argjson leadsTotal "$LEADS_TOTAL" \
  --argjson trackerEntries "$TRACKER_ENTRIES" \
  '{
    timestamp: $timestamp,
    system: {
      uptime: $uptime,
      cpu: $cpu,
      memoryUsed: $memUsed,
      memoryTotal: $memTotal,
      diskUsed: $diskUsed,
      diskTotal: $diskTotal,
      loadAvg: $loadAvg
    },
    gateway: {
      running: $gwRunning,
      pid: (if $gwPid == "null" then null else ($gwPid | tonumber) end),
      port: 18789,
      version: $gwVersion,
      latencyMs: $gwLatency,
      mode: $gwMode,
      url: $gwUrl
    },
    services: {
      gateway: $gwService,
      node: $nodeService
    },
    agents: $agents,
    sessions: $sessions,
    models: $models,
    crons: $crons,
    cronScheduler: $cronStatus,
    heartbeatConfig: $heartbeatConfig,
    channels: $channels,
    os: $osInfo,
    workspace: {
      targets: $targets,
      emailsSent: $emailsSent,
      emailsQueued: $emailsQueued,
      leadsTotal: $leadsTotal,
      trackerEntries: $trackerEntries
    }
  }')

# ─── POST to Dashboard ──────────────────────────────────────────────────────
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${DASHBOARD_URL}/api/openclaw/heartbeat" \
  -H "Content-Type: application/json" \
  -H "x-reporter-secret: ${REPORTER_SECRET}" \
  -d "$PAYLOAD" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "[reporter] Heartbeat sent successfully at $(date)"
else
  echo "[reporter] Heartbeat failed (HTTP $HTTP_CODE): $BODY" >&2
fi
