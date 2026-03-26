# Mission Control — Design Spec

**Date:** 2026-03-26
**Route:** `/admin/mission-control`
**Purpose:** Monitor, inspect, and control OpenClaw (AI CEO) from the SocialSculp admin dashboard.

---

## Overview

Mission Control is a new admin tab that gives Cal real-time visibility into OpenClaw — the autonomous AI agent running on a DigitalOcean VPS. It surfaces health status, task execution, token/cost tracking, cron workflows, live logs, remote controls, and revenue attribution in a single page.

## Architecture

### Data Flow: SSH Relay + Client Polling

```
Browser (SWR, 30s poll)
  → Next.js API routes (/api/openclaw/*)
    → SSH into VPS (167.172.237.104)
      → Execute `openclaw` CLI commands (--json where available)
      → Parse log files
    ← Return structured JSON
  ← SWR cache + revalidate
```

**Why SSH Relay:** OpenClaw's gateway binds to loopback only. The CLI already supports `--json` output for structured data. SSH avoids any VPS-side changes. Vercel serverless can't hold persistent WebSocket connections, making polling the pragmatic choice.

**SSH Key:** Stored as `OPENCLAW_SSH_KEY` Vercel env var (base64-encoded private key). Decoded at runtime in API routes. Key: `C:/Users/Cal/.ssh/openclaw_vps` (ed25519).

**VPS Details:**
- IP: `167.172.237.104`
- User: `root`
- OpenClaw binary: `/usr/bin/openclaw` (v2026.3.24)
- Gateway: `localhost:18789` (systemd service)
- Logs: `/tmp/openclaw/openclaw-YYYY-MM-DD.log`
- Cron config: `/root/.openclaw/cron/jobs.json`
- Cron run logs: `/root/.openclaw/cron/runs/*.jsonl`
- Workspace: `/root/.openclaw/workspace/`

## Sidebar Integration

New nav item in the OPERATIONS group of `ROLE_NAV.ADMIN`:

```
OPERATIONS group:
  CRM → Sales → Decks → Portals → Tasks → **Mission Control** → Users → Settings
```

- Icon: `Monitor` from lucide-react
- Route: `/admin/mission-control`

## Page Layout

Single scrollable page, no sub-routes. Seven modules arranged as:

1. **Status Hero Bar** (full width)
2. **Stats Row** (4-column grid)
3. **Task Feed + Workflows** (2-column grid)
4. **Live Logs + Revenue/ROI** (2-column grid)

Responsive: collapses to single column on mobile.

## Module Specifications

### 1. Status & Heartbeat (Hero Bar)

**Data source:** `openclaw health` via SSH

**Displays:**
- Status indicator: green pulsing dot (online), red (offline/error), amber (degraded)
- Status text: ONLINE / OFFLINE / ERROR
- Uptime: calculated from gateway process start time
- Last heartbeat: timestamp of last successful `openclaw health` response
- Active agent: name + model (e.g., "main (gpt-4o-mini)")
- Connected nodes: from `openclaw nodes status`

**Controls (right side):**
- Restart button → `systemctl --user restart openclaw-gateway`
- Kill button → `systemctl --user stop openclaw-gateway`

**Polling:** Every 30s via SWR.

**Offline detection:** If SSH connection fails or `openclaw health` returns non-zero, show OFFLINE with last-known timestamp.

### 2. Token & Cost Tracker (Stats Row)

**Data source:** Parse `/tmp/openclaw/openclaw-YYYY-MM-DD.log` for token usage lines, plus `/root/.openclaw/cron/runs/*.jsonl` for per-task duration.

**Stats cards (4 columns):**
- **Today's Tokens** — total input+output tokens, estimated cost
- **Tasks Today** — count with ok/error/running breakdown
- **MTD Cost** — month-to-date estimated cost, budget indicator
- **Cron Jobs** — total count, erroring count

**Cost estimation:** Based on model pricing (gpt-4o-mini: $0.15/$0.60 per 1M tokens in/out). Parsed from log lines containing token counts.

**Polling:** Same 30s interval as status (bundled into single SSH call).

### 3. Task Feed

**Data source:** `openclaw cron list --json` for job definitions + `/root/.openclaw/cron/runs/*.jsonl` for run history.

**Displays:** Reverse-chronological list of recent task executions:
- Task name
- Status badge: ok (green), error (red), running (amber), scheduled (gray)
- Time ago
- Duration (for completed tasks)
- Error message (expandable, for failed tasks)

**Interactions:**
- Click a task row to expand and see full output/error details
- Error rows show the `lastError` field from cron list JSON

### 4. Workflows & Automations

**Data source:** `openclaw cron list --json`

**Displays:** Card per cron job showing:
- Job name
- Schedule (human-readable, e.g., "10:00 AM CT daily")
- Status: ok / error / idle (from `lastRunStatus`)
- Last run time
- Next run time
- Consecutive error count (if > 0)

**Controls per job:**
- Trigger Now button → `openclaw cron trigger <job-id>`
- Enable/Disable toggle → `openclaw cron enable/disable <job-id>` (if supported)

### 5. Live Log Viewer

**Data source:** SSH exec `tail -200 /tmp/openclaw/openclaw-YYYY-MM-DD.log`

**Displays:** Terminal-style monospace log output with:
- Timestamp highlighting
- Error lines in red
- Agent turn start/end highlighted
- Auto-scroll to bottom

**Controls:**
- Refresh button (manual fetch)
- Line count selector (50 / 100 / 200 / 500)
- Filter input (client-side grep)

**Not auto-polling** — fetched on-demand to avoid unnecessary SSH overhead. User clicks Refresh or navigates to this section.

### 6. Remote Controls

Integrated into the Status Hero Bar and Workflow cards rather than a separate module:

- **Restart Gateway** → `systemctl --user restart openclaw-gateway`
- **Stop Gateway** → `systemctl --user stop openclaw-gateway`
- **Trigger Cron Job** → `openclaw cron trigger <id>`
- **Kill Running Task** → future: requires identifying running process

All control actions require a confirmation dialog before execution.

### 7. Revenue & ROI

**Data source:** Parse workspace files via SSH:
- `/root/.openclaw/workspace/emails-sent.json` → outreach email count
- `/root/.openclaw/workspace/apollo-leads.json` → leads generated
- `/root/.openclaw/workspace/tracker.json` → pipeline/deal tracking
- Cost data from token tracking (module 2)

**Displays:**
- Outreach emails sent (MTD)
- Leads generated
- Pipeline value influenced (from tracker.json deal values)
- OpenClaw cost (MTD)
- ROI calculation (pipeline value / cost)

**Note:** Revenue attribution is best-effort based on workspace data files. Not all value is directly trackable.

## API Routes

All under `/api/openclaw/`:

| Route | Method | SSH Command | Response |
|-------|--------|-------------|----------|
| `/api/openclaw/status` | GET | `openclaw health` + `openclaw cron list --json` + log parse | Bundled status JSON |
| `/api/openclaw/logs` | GET | `tail -N /tmp/openclaw/openclaw-YYYY-MM-DD.log` | Log lines array |
| `/api/openclaw/cron/trigger` | POST | `openclaw cron trigger <id>` | Success/error |
| `/api/openclaw/control/restart` | POST | `systemctl --user restart openclaw-gateway` | Success/error |
| `/api/openclaw/control/stop` | POST | `systemctl --user stop openclaw-gateway` | Success/error |
| `/api/openclaw/revenue` | GET | Parse workspace JSON files | Revenue metrics |

### SSH Utility

Shared `lib/openclaw-ssh.ts` module:
- Manages SSH connection using `ssh2` npm package
- Decodes `OPENCLAW_SSH_KEY` env var (base64 → private key)
- Provides `execCommand(cmd: string): Promise<string>` helper
- Connection timeout: 10s
- Command timeout: 15s
- No connection pooling (Vercel serverless = ephemeral)

### Auth

All `/api/openclaw/*` routes require Clerk auth + ADMIN role check (same pattern as existing `/api/admin/*` routes).

## Data Models

No new Prisma models needed for v1. All data is fetched live from the VPS. Future consideration: persist historical token/cost data in the database for trend charts.

## Environment Variables

| Variable | Value | Where |
|----------|-------|-------|
| `OPENCLAW_VPS_HOST` | `167.172.237.104` | Vercel env |
| `OPENCLAW_VPS_USER` | `root` | Vercel env |
| `OPENCLAW_SSH_KEY` | base64-encoded ed25519 private key | Vercel env (secret) |

## Component Structure

```
app/(dashboard)/admin/mission-control/
  page.tsx                    — Server component, auth check, renders MissionControlClient
  MissionControlClient.tsx    — Client component, SWR polling, all module layout

components/mission-control/
  StatusHero.tsx              — Hero bar with status indicator + controls
  StatsRow.tsx                — 4-column stat cards
  TaskFeed.tsx                — Recent task execution list
  WorkflowCards.tsx           — Cron job cards with triggers
  LogViewer.tsx               — Terminal-style log display
  RevenuePanel.tsx            — Revenue & ROI metrics
  ConfirmDialog.tsx           — Reusable confirmation for destructive actions

lib/
  openclaw-ssh.ts             — SSH connection utility
```

## Error Handling

- **SSH connection failure:** Show "VPS Unreachable" state with last-known data timestamp. Retry on next poll.
- **Command timeout:** Show stale data with warning badge. 15s timeout per command.
- **OpenClaw not running:** Detect from `openclaw health` failure. Show OFFLINE state with restart button prominently displayed.
- **Cron errors:** Surface `lastError` from cron list JSON. Show consecutive error count as badge.

## Security

- SSH private key stored as Vercel env var (encrypted at rest)
- All API routes gated behind Clerk auth + ADMIN role
- Control actions (restart, stop, trigger) require confirmation dialog
- No direct shell execution — all commands are predefined strings, no user input interpolation

## Phasing

**Phase 1 (MVP):**
- Status hero bar (health + uptime)
- Stats row (tasks today, cron count)
- Workflow cards with trigger buttons
- Task feed (cron run history)
- SSH utility + API routes

**Phase 2:**
- Live log viewer
- Token/cost tracking (log parsing)
- Remote controls (restart/stop)

**Phase 3:**
- Revenue & ROI panel (workspace file parsing)
- Historical trend charts (requires DB persistence)
- Budget alerts

## Dependencies

- `ssh2` — SSH client for Node.js (new dependency)
- `swr` — already in use for client-side data fetching patterns
- No other new dependencies needed
