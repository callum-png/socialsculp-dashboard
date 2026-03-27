# Mission Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Mission Control tab to the SocialSculp admin dashboard that monitors and controls OpenClaw via SSH relay + client polling.

**Architecture:** Next.js API routes SSH into the OpenClaw VPS, execute CLI commands (`openclaw health`, `openclaw cron list --json`), and return structured JSON. Client components poll via SWR every 30s. All data is fetched live — no new database models.

**Tech Stack:** Next.js 16 (App Router), ssh2, SWR, shadcn/ui, Tailwind, Clerk auth, lucide-react

**Spec:** `docs/superpowers/specs/2026-03-26-mission-control-design.md`

**Security note:** This plan uses the `ssh2` npm package (SSH2 client library) for remote command execution over SSH. All commands executed on the VPS are predefined string constants — no user input is interpolated into commands. This is NOT Node.js `child_process.exec()`.

---

## File Structure

```
lib/
  openclaw-ssh.ts                              — SSH connection utility (new)

app/api/openclaw/
  health/route.ts                              — GET: openclaw health (new)
  cron/route.ts                                — GET: openclaw cron list --json (new)
  cron/trigger/route.ts                        — POST: openclaw cron trigger <id> (new)
  logs/route.ts                                — GET: tail VPS log file (new, Phase 2)
  control/restart/route.ts                     — POST: systemctl restart (new)
  control/stop/route.ts                        — POST: systemctl stop (new)
  revenue/route.ts                             — GET: parse workspace files (new, Phase 3)

app/(dashboard)/admin/mission-control/
  page.tsx                                     — Server component, auth gate (new)
  MissionControlClient.tsx                     — Client component, SWR + layout (new)

components/mission-control/
  StatusHero.tsx                               — Status bar + controls (new)
  StatsRow.tsx                                 — 4-column stat cards (new)
  TaskFeed.tsx                                 — Cron run history list (new)
  WorkflowCards.tsx                            — Cron jobs + trigger buttons (new)
  LogViewer.tsx                                — Terminal-style log viewer (new, Phase 2)
  RevenuePanel.tsx                             — Revenue & ROI metrics (new, Phase 3)
  ConfirmDialog.tsx                            — Confirmation wrapper over shadcn Dialog (new)

components/layout/Sidebar.tsx                  — Add Monitor icon + nav item (modify)
next.config.ts                                 — Add serverExternalPackages (modify)
```

---

## Phase 1: Foundation + Core Modules

### Task 1: Install dependencies and configure Next.js

**Files:**
- Modify: `package.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Install ssh2 and swr**

```bash
cd C:/Users/Cal/socialsculp-dashboard
npm install ssh2 swr
npm install -D @types/ssh2
```

- [ ] **Step 2: Add serverExternalPackages to next.config.ts**

In `next.config.ts`, add `serverExternalPackages` to the `nextConfig` object (after the `images` key):

```ts
serverExternalPackages: ['ssh2'],
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json next.config.ts
git commit -m "deps: add ssh2 and swr for Mission Control"
```

---

### Task 2: SSH utility module

**Files:**
- Create: `lib/openclaw-ssh.ts`

- [ ] **Step 1: Create the SSH utility**

Create `lib/openclaw-ssh.ts` with:
- `getPrivateKey()`: decodes `OPENCLAW_SSH_KEY` env var from base64
- `execCommand(command: string): Promise<string>`: connects via ssh2 Client, runs the command, returns stdout. Rejects on non-zero exit code with stderr.
- Connection timeout: 5s, command timeout: 30s
- No connection pooling (Vercel serverless = ephemeral)

The `ssh2` package's `Client.exec()` is the SSH2 protocol exec method — it sends a command over an encrypted SSH channel to the remote host. It does NOT use Node.js `child_process.exec()` and is not vulnerable to shell injection on the local machine. All commands sent to the VPS are predefined string constants.

- [ ] **Step 2: Commit**

```bash
git add lib/openclaw-ssh.ts
git commit -m "feat: add SSH utility for OpenClaw VPS communication"
```

---

### Task 3: Health API route

**Files:**
- Create: `app/api/openclaw/health/route.ts`

- [ ] **Step 1: Create the health endpoint**

Pattern: follow `app/api/admin/tasks/route.ts` for auth pattern (Clerk auth + role check via getDb).

- `export const maxDuration = 60`
- GET handler: auth check, then `execCommand('openclaw health 2>&1')`
- Parse output lines for: Telegram status, Agents, Heartbeat interval, active sessions
- Return `{ data, error, timestamp, stale }` envelope
- Catch errors and return `{ data: null, error: message, timestamp, stale: false }`

- [ ] **Step 2: Commit**

```bash
git add app/api/openclaw/health/route.ts
git commit -m "feat: add /api/openclaw/health endpoint"
```

---

### Task 4: Cron API route

**Files:**
- Create: `app/api/openclaw/cron/route.ts`

- [ ] **Step 1: Create the cron endpoint**

- `export const maxDuration = 60`
- GET handler: auth check, then `execCommand('openclaw cron list --json 2>&1')`
- `JSON.parse()` the output (OpenClaw CLI returns structured JSON with `--json` flag)
- Return `{ data: parsed, error, timestamp, stale }` envelope

- [ ] **Step 2: Commit**

```bash
git add app/api/openclaw/cron/route.ts
git commit -m "feat: add /api/openclaw/cron endpoint"
```

---

### Task 5: Cron trigger API route

**Files:**
- Create: `app/api/openclaw/cron/trigger/route.ts`

- [ ] **Step 1: Create the trigger endpoint**

- `export const maxDuration = 60`
- POST handler: auth check, read `{ jobId }` from body
- Validate `jobId` against allowlist: `['morning-brief', 'pipeline-nagger', 'eod-wrapup']`
- If not in allowlist, return 400
- Execute `execCommand(\`openclaw cron trigger \${jobId} 2>&1\`)` — safe because jobId is validated against a hardcoded allowlist
- Return `{ success, output }` or `{ success: false, error }`

- [ ] **Step 2: Commit**

```bash
git add app/api/openclaw/cron/trigger/route.ts
git commit -m "feat: add /api/openclaw/cron/trigger endpoint"
```

---

### Task 6: Control API routes (restart/stop)

**Files:**
- Create: `app/api/openclaw/control/restart/route.ts`
- Create: `app/api/openclaw/control/stop/route.ts`

- [ ] **Step 1: Create restart endpoint**

- `export const maxDuration = 60`
- POST handler: auth check
- Execute: `execCommand('XDG_RUNTIME_DIR=/run/user/0 systemctl --user restart openclaw-gateway 2>&1')`
- Return `{ success, output }` or `{ success: false, error }`

- [ ] **Step 2: Create stop endpoint**

Same pattern, command: `XDG_RUNTIME_DIR=/run/user/0 systemctl --user stop openclaw-gateway 2>&1`

- [ ] **Step 3: Commit**

```bash
git add app/api/openclaw/control/
git commit -m "feat: add restart/stop control endpoints for OpenClaw"
```

---

### Task 7: Add Mission Control to sidebar

**Files:**
- Modify: `components/layout/Sidebar.tsx`

- [ ] **Step 1: Add Monitor import and ICON_MAP entry**

In `Sidebar.tsx`:
- Add `Monitor` to the lucide-react import (line 6)
- Add `Monitor` to `ICON_MAP` object (line 26)

- [ ] **Step 2: Add nav item to ADMIN Operations group**

In the Operations `items` array (around line 72), insert after Tasks and before Users:

```ts
{ label: 'Mission Control', href: '/admin/mission-control', icon: 'Monitor' },
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat: add Mission Control to admin sidebar nav"
```

---

### Task 8: Mission Control page + client component

**Files:**
- Create: `app/(dashboard)/admin/mission-control/page.tsx`
- Create: `app/(dashboard)/admin/mission-control/MissionControlClient.tsx`

- [ ] **Step 1: Create the server page component**

Follow pattern from `app/(dashboard)/admin/tasks/page.tsx`:
- Clerk auth check, redirect if not admin
- Render `<MissionControlClient />`

- [ ] **Step 2: Create the client component**

`MissionControlClient.tsx`:
- `'use client'`
- Two SWR hooks: `/api/openclaw/health` and `/api/openclaw/cron`, both with `refreshInterval: 30_000`
- Fetcher: `(url: string) => fetch(url).then(r => r.json())`
- Renders: `PageHeader` (eyebrow "Operations"), `StatusHero`, `StatsRow`, then a 2-col grid with `TaskFeed` + `WorkflowCards`
- Pass health/cron data + loading states to child components

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/admin/mission-control/"
git commit -m "feat: add Mission Control page and client component"
```

---

### Task 9: ConfirmDialog component

**Files:**
- Create: `components/mission-control/ConfirmDialog.tsx`

- [ ] **Step 1: Create ConfirmDialog**

Wraps `components/ui/dialog.tsx` (shadcn Dialog based on @base-ui/react):
- Props: `trigger`, `title`, `description`, `confirmLabel`, `variant`, `onConfirm`
- State: `open`, `loading`
- Check the exact Dialog API in `components/ui/dialog.tsx` — uses `@base-ui/react/dialog` which may use `render` prop instead of `asChild`. Adjust accordingly.

- [ ] **Step 2: Commit**

```bash
git add components/mission-control/ConfirmDialog.tsx
git commit -m "feat: add ConfirmDialog component"
```

---

### Task 10: StatusHero component

**Files:**
- Create: `components/mission-control/StatusHero.tsx`

- [ ] **Step 1: Create StatusHero**

- Green pulsing dot when online, red when offline/error, gray when loading
- Status text: ONLINE / OFFLINE / ERROR / CHECKING...
- Agent info and active session count from health data
- Restart button (wrapped in ConfirmDialog) → POST `/api/openclaw/control/restart`
- Stop button (wrapped in ConfirmDialog, destructive variant) → POST `/api/openclaw/control/stop`
- Full-width card with `flex items-center gap-5`, matching dashboard card style

- [ ] **Step 2: Commit**

```bash
git add components/mission-control/StatusHero.tsx
git commit -m "feat: add StatusHero component"
```

---

### Task 11: StatsRow component

**Files:**
- Create: `components/mission-control/StatsRow.tsx`

- [ ] **Step 1: Create StatsRow**

4-column responsive grid (`grid-cols-2 lg:grid-cols-4`). Each card shows:
- Status (online/offline)
- Cron Jobs count (with erroring count)
- Last Run (time ago + job name)
- Next Run (time until + job name)

Include `formatTimeAgo()` and `formatTimeUntil()` helper functions.

- [ ] **Step 2: Commit**

```bash
git add components/mission-control/StatsRow.tsx
git commit -m "feat: add StatsRow component"
```

---

### Task 12: TaskFeed component

**Files:**
- Create: `components/mission-control/TaskFeed.tsx`

- [ ] **Step 1: Create TaskFeed**

- Sorted by `lastRunAtMs` descending
- Each row: status icon (CheckCircle2/XCircle/Clock), job name, time ago, duration
- Error rows expandable (click to show `lastError`)
- Loading skeleton: 3 animated placeholder rows
- Empty state text

- [ ] **Step 2: Commit**

```bash
git add components/mission-control/TaskFeed.tsx
git commit -m "feat: add TaskFeed component"
```

---

### Task 13: WorkflowCards component

**Files:**
- Create: `components/mission-control/WorkflowCards.tsx`

- [ ] **Step 1: Create WorkflowCards**

- Card per cron job showing: name, schedule (human-readable), status badge, error count
- Trigger button per job wrapped in ConfirmDialog → POST `/api/openclaw/cron/trigger`
- `formatCronSchedule()` helper: converts `0 10 * * *` + timezone to "10:00 AM Chicago daily"
- Loading skeleton, empty state

- [ ] **Step 2: Commit**

```bash
git add components/mission-control/WorkflowCards.tsx
git commit -m "feat: add WorkflowCards component"
```

---

### Task 14: Set environment variables + verify build

- [ ] **Step 1: Create local .env entries**

Add to `.env.local`:
```
OPENCLAW_VPS_HOST=167.172.237.104
OPENCLAW_VPS_USER=root
OPENCLAW_SSH_KEY=<base64 of C:/Users/Cal/.ssh/openclaw_vps>
```

Generate base64: `base64 -w0 /c/Users/Cal/.ssh/openclaw_vps`

- [ ] **Step 2: Verify build compiles**

```bash
npm run build
```

Fix any TypeScript errors.

- [ ] **Step 3: Test locally**

```bash
npm run dev
```

Navigate to `http://localhost:3000/admin/mission-control`. Verify:
- Page loads with PageHeader
- StatusHero shows ONLINE with green dot
- StatsRow shows cron counts
- TaskFeed shows recent runs with statuses
- WorkflowCards shows all 3 jobs with trigger buttons
- Trigger buttons open confirmation dialog

- [ ] **Step 4: Final commit + push**

```bash
git add -A
git commit -m "feat: Mission Control Phase 1 complete"
git push origin HEAD
```

---

## Phase 2: Logs + Token Tracking (deferred)

### Task 15: Log viewer API + component
- Create `app/api/openclaw/logs/route.ts` — SSH exec `ls -t /tmp/openclaw/*.log | head -1 | xargs tail -N`
- Create `components/mission-control/LogViewer.tsx` — monospace terminal, manual refresh

### Task 16: Token/cost tracking
- Parse log files for token usage
- Add cost estimation to StatsRow

---

## Phase 3: Revenue (deferred)

### Task 17: Revenue API + component
- Create `app/api/openclaw/revenue/route.ts` — parse workspace JSON files with `test -f` fallback
- Create `components/mission-control/RevenuePanel.tsx`
