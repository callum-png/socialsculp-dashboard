# Mission Control — OpenClaw Dashboard Tab

## Overview
Add a "Mission Control" tab to the SocialSculp admin dashboard that monitors and controls OpenClaw (AI CEO bot on DigitalOcean VPS 167.172.237.104). Uses **Approach C: SSH + Polling hybrid** — a lightweight reporting client on the VPS pushes status to a Next.js API route, with on-demand SSH for commands.

## Architecture

### Data Flow
```
VPS (OpenClaw)                    Dashboard (Next.js)
┌─────────────┐    HTTP POST      ┌──────────────────┐
│ reporter.sh  │ ──────────────→  │ /api/openclaw/    │
│ (cron 1min)  │    heartbeat     │   heartbeat       │
└─────────────┘                   │   (stores in DB)  │
                                  └──────────────────┘
                                         ↓
                    SSH on-demand  ┌──────────────────┐
Admin clicks   ←─────────────────→│ /api/openclaw/    │
"Run Task"        (exec command)  │   command         │
                                  └──────────────────┘
```

### Reporter Client (VPS-side)
- Shell script (`/root/.openclaw/reporter.sh`) running via system crontab every 60s
- Collects: gateway status, agent status, cron jobs, recent task logs, token usage, workspace stats
- POSTs JSON heartbeat to `https://socialsculp-dashboard.vercel.app/api/openclaw/heartbeat`
- Authenticated with a shared secret (env var `OPENCLAW_REPORTER_SECRET`)

### API Routes (Dashboard-side)
- `POST /api/openclaw/heartbeat` — receives status from reporter, stores in Prisma
- `GET /api/openclaw/status` — returns latest heartbeat + computed metrics
- `POST /api/openclaw/command` — executes SSH command on VPS (admin-only)

---

## 7 Modules (All scoped to `/admin/mission-control`)

### Module 1: Status Overview (default tab)
- **Heartbeat indicator** — green/yellow/red based on last heartbeat age
- **System vitals** — uptime, CPU, memory, disk from heartbeat
- **Gateway status** — running/stopped, port, version
- **Agent cards** — main + claude agent status, current task, model info
- **Last heartbeat timestamp** with relative time

### Module 2: Task Feed
- **Live task log** — scrollable list of recent tasks with status, duration, tokens
- **Task detail drawer** — click to see full output/error
- **Filter by agent** — main vs claude
- **Auto-refresh** — polls `/api/openclaw/status` every 30s

### Module 3: Cron Jobs
- **Cron job table** — name, schedule, last run, next run, status
- **Run history** — expandable rows showing last N runs with success/fail
- **Manual trigger** — button to run a cron job on-demand via SSH command

### Module 4: Token Burn / Cost Tracking
- **Daily/weekly/monthly token usage** — area chart (recharts)
- **Cost estimate** — based on model pricing (GPT-4o-mini, GPT-4o, Claude)
- **Per-agent breakdown** — bar chart
- **Budget alert threshold** — configurable, visual warning when approaching

### Module 5: Revenue & Pipeline
- **Outreach stats** — emails sent, leads contacted, responses received
- **Pipeline table** — targets (quittr, turbolearn, etc.) with status
- **Revenue tracking** — deals closed, MRR from OpenClaw outreach
- **Data source**: parsed from workspace files (tracker.json, emails-sent.json)

### Module 6: Workflows & Automations
- **Active workflows list** — morning brief, pipeline nagger, outreach sequences
- **Workflow detail** — trigger, schedule, last output summary
- **Enable/disable toggle** — via SSH command to update cron config
- **Execution timeline** — visual timeline of when workflows ran today

### Module 7: Command Terminal
- **Admin SSH terminal** — text input to send commands to VPS
- **Predefined quick actions** — restart gateway, check logs, run health check
- **Output display** — monospace scrollable output area
- **Command history** — last 20 commands with timestamps

---

## Implementation Plan

### Phase 1: Backend Foundation
1. **Prisma schema** — add `OpenClawHeartbeat` model (status JSON, timestamp, etc.)
2. **API routes** — `/api/openclaw/heartbeat`, `/api/openclaw/status`, `/api/openclaw/command`
3. **SSH utility** — `lib/openclaw-ssh.ts` using `ssh2` package for on-demand commands
4. **Reporter script** — shell script for VPS that collects + POSTs heartbeat data

### Phase 2: Dashboard UI
5. **Sidebar nav** — add "Mission Control" to admin Operations group
6. **Page + layout** — `/admin/mission-control/page.tsx` with tab bar (7 tabs)
7. **Status Overview tab** — heartbeat indicator, system vitals, agent cards
8. **Task Feed tab** — task list with auto-refresh, detail drawer
9. **Cron Jobs tab** — job table with run history, manual trigger
10. **Token Burn tab** — recharts area/bar charts for usage + cost
11. **Revenue tab** — outreach stats, pipeline table
12. **Workflows tab** — workflow list with timeline
13. **Command Terminal tab** — input, quick actions, output display

### Phase 3: VPS Setup
14. **Deploy reporter script** to VPS via SSH
15. **Set up system crontab** for reporter (every 60s)
16. **Add env vars** — `OPENCLAW_REPORTER_SECRET` on both VPS and Vercel

### Phase 4: Polish
17. **Loading states** — skeletons for each module
18. **Error states** — offline/unreachable indicators
19. **Mobile responsive** — stack cards vertically on mobile

---

## Files to Create/Modify

### New Files
```
app/(dashboard)/admin/mission-control/
  page.tsx
  _components/
    MissionControlClient.tsx
    MissionControlTabBar.tsx
    StatusOverviewTab.tsx
    TaskFeedTab.tsx
    CronJobsTab.tsx
    TokenBurnTab.tsx
    RevenueTab.tsx
    WorkflowsTab.tsx
    CommandTerminalTab.tsx
    HeartbeatIndicator.tsx
    AgentCard.tsx
    TaskDetailDrawer.tsx

app/api/openclaw/
  heartbeat/route.ts
  status/route.ts
  command/route.ts

lib/openclaw-ssh.ts
types/openclaw.ts

prisma/migrations/xxx_add_openclaw_heartbeat/migration.sql
```

### Modified Files
```
components/layout/Sidebar.tsx          — add Mission Control nav item
prisma/schema.prisma                   — add OpenClawHeartbeat model
```

### VPS Files (deployed via SSH)
```
/root/.openclaw/reporter.sh            — heartbeat reporter script
```

---

## Tech Decisions
- **ssh2** npm package for SSH from API routes (not shelling out)
- **Prisma** for heartbeat storage (not Convex — this is operational data, not real-time metrics)
- **Polling** (30s interval via useEffect) for live updates — keeps it simple, no WebSocket needed
- **recharts** for charts (already in the project)
- **framer-motion** for tab transitions (matches existing pattern)
- **lucide-react `Radio` icon** for sidebar nav item
