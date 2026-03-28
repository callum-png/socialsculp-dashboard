#!/bin/bash
# OpenClaw Mission Control Reporter
# Runs every 60s via LaunchAgent, POSTs status heartbeat to SocialSculp dashboard
# Compatible with macOS (Darwin) and Linux

DASHBOARD_URL="${OPENCLAW_DASHBOARD_URL:-https://socialsculp-dashboard.vercel.app}"
REPORTER_SECRET="${OPENCLAW_REPORTER_SECRET}"
OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"

if [ -z "$REPORTER_SECRET" ]; then
  echo "[reporter] OPENCLAW_REPORTER_SECRET not set, skipping" >&2
  exit 1
fi

OS_TYPE=$(uname -s)

# ─── System Vitals ────────────────────────────────────────────────────────────
if [ "$OS_TYPE" = "Darwin" ]; then
  # macOS
  UPTIME=$(uptime | sed 's/.*up //' | sed 's/,.*//')
  CPU=$(ps -A -o %cpu | awk '{s+=$1} END {printf "%.0f", s/NR}' 2>/dev/null || echo "0")
  MEM_TOTAL=$(sysctl -n hw.memsize 2>/dev/null || echo "0")
  # vm_stat gives pages; page size is typically 16384 on Apple Silicon, 4096 on Intel
  PAGE_SIZE=$(sysctl -n hw.pagesize 2>/dev/null || echo "16384")
  PAGES_ACTIVE=$(vm_stat 2>/dev/null | awk '/Pages active:/ {gsub(/\./,"",$3); print $3}')
  PAGES_WIRED=$(vm_stat 2>/dev/null | awk '/Pages wired down:/ {gsub(/\./,"",$4); print $4}')
  PAGES_COMPRESSED=$(vm_stat 2>/dev/null | awk '/Pages occupied by compressor:/ {gsub(/\./,"",$5); print $5}')
  MEM_USED=$(( (${PAGES_ACTIVE:-0} + ${PAGES_WIRED:-0} + ${PAGES_COMPRESSED:-0}) * PAGE_SIZE ))
  DISK_INFO=$(df -b / | awk 'NR==2{print $3, $2}')
  DISK_USED=$(echo "$DISK_INFO" | awk '{print $1 * 512}')
  DISK_TOTAL=$(echo "$DISK_INFO" | awk '{print $2 * 512}')
  LOAD_AVG=$(sysctl -n vm.loadavg 2>/dev/null | awk '{printf "[%s,%s,%s]", $2, $3, $4}')
else
  # Linux
  UPTIME=$(uptime -p 2>/dev/null || uptime | awk '{print $3,$4}')
  CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'.' -f1 2>/dev/null || echo "0")
  MEM_USED=$(free -b | awk '/^Mem:/{print $3}')
  MEM_TOTAL=$(free -b | awk '/^Mem:/{print $2}')
  DISK_USED=$(df -B1 / | awk 'NR==2{print $3}')
  DISK_TOTAL=$(df -B1 / | awk 'NR==2{print $2}')
  LOAD_AVG=$(cat /proc/loadavg | awk '{printf "[%s,%s,%s]", $1, $2, $3}')
fi

# ─── Gateway Status ──────────────────────────────────────────────────────────
if [ "$OS_TYPE" = "Darwin" ]; then
  # On macOS, check launchctl for the gateway service
  GW_PID=$(launchctl list 2>/dev/null | awk '/ai\.openclaw\.gateway/{print $1}')
  [ "$GW_PID" = "-" ] && GW_PID=""
  # Also try pgrep as fallback
  [ -z "$GW_PID" ] && GW_PID=$(pgrep -f "openclaw.*gateway" 2>/dev/null || echo "")
else
  GW_PID=$(pgrep -f "openclaw-gateway" 2>/dev/null || echo "")
fi

GW_RUNNING=false
GW_VERSION=""
if [ -n "$GW_PID" ] && [ "$GW_PID" != "0" ]; then
  GW_RUNNING=true
  GW_VERSION=$(openclaw --version 2>/dev/null || echo "unknown")
fi

# ─── Agent Info ──────────────────────────────────────────────────────────────
AGENTS_JSON="[]"
if command -v openclaw &>/dev/null; then
  AGENTS_RAW=$(openclaw agents list --json 2>/dev/null || echo "")
  if [ -n "$AGENTS_RAW" ] && echo "$AGENTS_RAW" | jq . &>/dev/null; then
    AGENTS_JSON=$(echo "$AGENTS_RAW" | jq -c '[.[] | {
      name: .name,
      model: (.model // "unknown"),
      fallbackModels: (.fallback_models // []),
      status: (.status // "offline"),
      currentTask: (.current_task // null),
      maxConcurrent: (.max_concurrent // 1),
      maxSubagents: (.max_subagents // 1)
    }]' 2>/dev/null || echo "[]")
  fi
fi

# ─── Cron Jobs ───────────────────────────────────────────────────────────────
CRONS_JSON="[]"
if command -v openclaw &>/dev/null; then
  CRONS_RAW=$(openclaw cron list --json 2>/dev/null || echo "")
  if [ -n "$CRONS_RAW" ] && echo "$CRONS_RAW" | jq . &>/dev/null; then
    CRONS_JSON=$(echo "$CRONS_RAW" | jq -c '[.[] | {
      id: (.id // .name),
      name: .name,
      schedule: .schedule,
      enabled: (.enabled // true),
      lastRun: (.last_run // null),
      lastStatus: (.last_status // null),
      nextRun: (.next_run // null),
      runCount: (.run_count // 0)
    }]' 2>/dev/null || echo "[]")
  fi
fi

# ─── Recent Tasks ────────────────────────────────────────────────────────────
TASKS_JSON="[]"
if command -v openclaw &>/dev/null; then
  TASKS_RAW=$(openclaw tasks list --json --limit 20 2>/dev/null || echo "")
  if [ -n "$TASKS_RAW" ] && echo "$TASKS_RAW" | jq . &>/dev/null; then
    TASKS_JSON=$(echo "$TASKS_RAW" | jq -c '[.[:20] | .[] | {
      id: (.id // "unknown"),
      agent: (.agent // "main"),
      description: (.description // .title // ""),
      status: (.status // "completed"),
      startedAt: (.started_at // .created_at // null),
      completedAt: (.completed_at // null),
      duration: (.duration // null),
      tokensUsed: (.tokens_used // .tokens // 0),
      model: (.model // "unknown"),
      error: (.error // null)
    }]' 2>/dev/null || echo "[]")
  fi
fi

# ─── Workspace Stats ─────────────────────────────────────────────────────────
WS_DIR="${OPENCLAW_HOME}/workspace"
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

  # Get target names from workspace dirs/files
  TARGETS=$(ls -d "$WS_DIR"/outreach-* 2>/dev/null | xargs -I{} basename {} | sed 's/outreach-//' | jq -R -s -c 'split("\n") | map(select(. != ""))' 2>/dev/null || echo "[]")
  [ "$TARGETS" = "" ] && TARGETS="[]"

  # Fallback: check tracker for target names
  if [ "$TARGETS" = "[]" ] && [ -f "$WS_DIR/tracker.json" ]; then
    TARGETS=$(jq -c '[.[].target // .[].name] | unique | map(select(. != null))' "$WS_DIR/tracker.json" 2>/dev/null || echo "[]")
  fi
fi

# ─── Token Usage (from logs) ─────────────────────────────────────────────────
TODAY=$(date +%Y-%m-%d)
WEEK_AGO=$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d "7 days ago" +%Y-%m-%d 2>/dev/null || echo "$TODAY")
MONTH_AGO=$(date -v-30d +%Y-%m-%d 2>/dev/null || date -d "30 days ago" +%Y-%m-%d 2>/dev/null || echo "$TODAY")

# Try to get token usage from openclaw CLI
TOKEN_JSON='{"today":{"input":0,"output":0,"total":0,"estimatedCost":0},"week":{"input":0,"output":0,"total":0,"estimatedCost":0},"month":{"input":0,"output":0,"total":0,"estimatedCost":0}}'
if command -v openclaw &>/dev/null; then
  TOKEN_RAW=$(openclaw usage --json 2>/dev/null || echo "")
  if [ -n "$TOKEN_RAW" ] && echo "$TOKEN_RAW" | jq . &>/dev/null; then
    TOKEN_JSON=$(echo "$TOKEN_RAW" | jq -c '{
      today: { input: (.today.input // 0), output: (.today.output // 0), total: (.today.total // 0), estimatedCost: (.today.cost // 0) },
      week: { input: (.week.input // 0), output: (.week.output // 0), total: (.week.total // 0), estimatedCost: (.week.cost // 0) },
      month: { input: (.month.input // 0), output: (.month.output // 0), total: (.month.total // 0), estimatedCost: (.month.cost // 0) }
    }' 2>/dev/null || echo "$TOKEN_JSON")
  fi
fi

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
  --argjson agents "$AGENTS_JSON" \
  --argjson crons "$CRONS_JSON" \
  --argjson tasks "$TASKS_JSON" \
  --argjson targets "$TARGETS" \
  --argjson emailsSent "$EMAILS_SENT" \
  --argjson emailsQueued "$EMAILS_QUEUED" \
  --argjson leadsTotal "$LEADS_TOTAL" \
  --argjson trackerEntries "$TRACKER_ENTRIES" \
  --argjson tokenUsage "$TOKEN_JSON" \
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
      version: $gwVersion
    },
    agents: $agents,
    crons: $crons,
    recentTasks: $tasks,
    workspace: {
      targets: $targets,
      emailsSent: $emailsSent,
      emailsQueued: $emailsQueued,
      leadsTotal: $leadsTotal,
      trackerEntries: $trackerEntries
    },
    tokenUsage: $tokenUsage
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
