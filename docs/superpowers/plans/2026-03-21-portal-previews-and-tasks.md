# Portal Previews & Admin Tasks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin "view-as" portal preview for any brand/creator/agent user, plus a global team to-do list tab in the admin sidebar.

**Architecture:** Portal previews are separate admin routes (`/admin/portals/brand/[userId]`) that re-use existing portal components but fetch data by userId with admin auth, plus a sticky preview banner. Admin Tasks use a new `AdminTask` Prisma model, a `/admin/tasks` page (client component with optimistic UI), and REST API routes.

**Tech Stack:** Next.js 16 App Router, Prisma (Neon), Clerk auth, Tailwind CSS, Lucide React, shadcn/ui (existing), Syne/Inter fonts

---

## File Map

### New (Dashboard)
- `prisma/schema.prisma` — add `AdminTask` model + `TaskStatus` + `TaskPriority` enums
- `prisma/migrations/...` — migration for AdminTask
- `app/(dashboard)/admin/portals/page.tsx` — portal preview index: list users by role with preview links
- `app/(dashboard)/admin/portals/brand/[userId]/page.tsx` — brand portal preview for admin
- `app/(dashboard)/admin/portals/creator/[userId]/page.tsx` — creator portal preview for admin
- `app/(dashboard)/admin/portals/agent/[userId]/page.tsx` — agent portal preview for admin
- `components/admin/PreviewBanner.tsx` — sticky "Admin Preview Mode" banner with exit button
- `app/(dashboard)/admin/tasks/page.tsx` — task list UI (client component)
- `app/api/admin/tasks/route.ts` — GET list + POST create
- `app/api/admin/tasks/[id]/route.ts` — PATCH update + DELETE

### Modified (Dashboard)
- `components/layout/Sidebar.tsx` — add `Eye` + `CheckSquare` icons; add `Portals` + `Tasks` entries to ADMIN nav (the Decks agent may have already added `LayoutTemplate`; leave that intact)

---

## Task 1 — AdminTask Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **1.1 Add enums and model to schema**

Add to `prisma/schema.prisma` before the existing `Post` model:

```prisma
enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model AdminTask {
  id          String        @id @default(cuid())
  title       String
  notes       String?
  status      TaskStatus    @default(TODO)
  priority    TaskPriority  @default(MEDIUM)
  campaignId  String?
  campaign    Campaign?     @relation(fields: [campaignId], references: [id])
  assigneeId  String?
  assignee    User?         @relation("TaskAssignee", fields: [assigneeId], references: [id])
  dueDate     DateTime?
  createdById String
  createdBy   User          @relation("TaskCreator", fields: [createdById], references: [id])
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

Add back-relations to `Campaign` model (inside the Campaign model block):
```prisma
adminTasks  AdminTask[]
```

Add back-relations to `User` model (inside the User model block):
```prisma
tasksCreated   AdminTask[] @relation("TaskCreator")
tasksAssigned  AdminTask[] @relation("TaskAssignee")
```

- [ ] **1.2 Run migration**

```bash
cd ~/socialsculp-dashboard
npx prisma migrate dev --name add-admin-tasks
```

Expected: "Your database is now in sync with your schema."

- [ ] **1.3 Verify TypeScript sees the new types**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **1.4 Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(tasks): add AdminTask model to schema"
```

---

## Task 2 — Admin Tasks API

**Files:**
- Create: `app/api/admin/tasks/route.ts`
- Create: `app/api/admin/tasks/[id]/route.ts`

- [ ] **2.1 Create `app/api/admin/tasks/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import { TaskStatus } from '@prisma/client'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || (user.role !== 'ADMIN' && user.role !== 'AGENT')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status') as TaskStatus | null

  const tasks = await db.adminTask.findMany({
    where: statusParam ? { status: statusParam } : undefined,
    include: {
      assignee: { select: { id: true, name: true } },
      campaign: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: [
      { status: 'asc' },
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || (user.role !== 'ADMIN' && user.role !== 'AGENT')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, notes, priority, assigneeId, campaignId, dueDate } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const task = await db.adminTask.create({
    data: {
      title: title.trim(),
      notes: notes || null,
      priority: priority || 'MEDIUM',
      assigneeId: assigneeId || null,
      campaignId: campaignId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdById: user.id,
    },
    include: {
      assignee: { select: { id: true, name: true } },
      campaign: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(task, { status: 201 })
}
```

- [ ] **2.2 Create `app/api/admin/tasks/[id]/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import { TaskStatus, TaskPriority } from '@prisma/client'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || (user.role !== 'ADMIN' && user.role !== 'AGENT')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { title, notes, status, priority, assigneeId, campaignId, dueDate } = body

  const task = await db.adminTask.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(notes !== undefined && { notes }),
      ...(status !== undefined && { status: status as TaskStatus }),
      ...(priority !== undefined && { priority: priority as TaskPriority }),
      ...(assigneeId !== undefined && { assigneeId }),
      ...(campaignId !== undefined && { campaignId }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
    include: {
      assignee: { select: { id: true, name: true } },
      campaign: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(task)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await db.adminTask.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **2.3 TypeScript check**

```bash
cd ~/socialsculp-dashboard && npx tsc --noEmit
```

- [ ] **2.4 Commit**

```bash
git add app/api/admin/tasks/
git commit -m "feat(tasks): add admin tasks API routes"
```

---

## Task 3 — Admin Tasks Page

**Files:**
- Create: `app/(dashboard)/admin/tasks/page.tsx`

- [ ] **3.1 Create the tasks page**

This is a `'use client'` page. Pattern: fetch on mount, optimistic status updates.

```tsx
'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Plus, Circle, Loader2, CheckCircle2, Trash2 } from 'lucide-react'

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

interface AdminTask {
  id: string
  title: string
  notes: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assignee: { id: string; name: string } | null
  campaign: { id: string; name: string } | null
  createdBy: { id: string; name: string }
  createdAt: string
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: 'text-[#6B6860]',
  MEDIUM: 'text-[#fbbf24]',
  HIGH: 'text-orange-400',
  URGENT: 'text-red-400',
}

const STATUS_NEXT: Record<TaskStatus, TaskStatus> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
}

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  TODO: <Circle className="w-4 h-4 text-[#6B6860]" />,
  IN_PROGRESS: <Loader2 className="w-4 h-4 text-[#008cff] animate-spin" />,
  DONE: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
}

const FILTERS: { label: string; value: TaskStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'To Do', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' },
]

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<AdminTask[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch('/api/admin/tasks')
      .then(r => r.json())
      .then(data => { setTasks(data); setLoading(false) })
  }, [])

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    const res = await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim() }),
    })
    const task = await res.json()
    setTasks(prev => [task, ...prev])
    setNewTitle('')
    setAdding(false)
  }

  async function cycleStatus(task: AdminTask) {
    const nextStatus = STATUS_NEXT[task.status]
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t))
    const res = await fetch(`/api/admin/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (!res.ok) {
      // Rollback on failure
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t))
    }
  }

  async function deleteTask(id: string) {
    const snapshot = tasks.find(t => t.id === id)
    setTasks(prev => prev.filter(t => t.id !== id))
    const res = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok && snapshot) {
      setTasks(prev => [...prev, snapshot].sort((a, b) => a.createdAt > b.createdAt ? -1 : 1))
    }
  }

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter)
  const counts: Record<TaskStatus | 'ALL', number> = {
    ALL: tasks.length,
    TODO: tasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter(t => t.status === 'DONE').length,
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Internal team to-do list"
      />

      {/* Quick-add form */}
      <form onSubmit={addTask} className="mb-6 flex gap-3">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 bg-[#111111] border border-[#222222] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#6B6860] font-syne focus:outline-none focus:border-[#008cff] transition-colors"
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#008cff] text-white text-sm font-syne rounded-lg hover:bg-[#0070cc] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-[#111111] border border-[#222222] rounded-lg p-1 w-fit">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 text-sm font-syne rounded-md transition-colors ${
              filter === f.value
                ? 'bg-[#008cff] text-white'
                : 'text-[#6B6860] hover:text-white'
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-60">({counts[f.value]})</span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="text-[#6B6860] text-sm font-syne">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#6B6860] font-syne text-sm">
          {filter === 'ALL' ? 'No tasks yet — add one above.' : `No ${STATUS_LABELS[filter as TaskStatus]} tasks.`}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(task => (
            <div
              key={task.id}
              className={`flex items-center gap-3 bg-[#111111] border border-[#222222] rounded-lg px-4 py-3 group transition-opacity ${
                task.status === 'DONE' ? 'opacity-50' : ''
              }`}
            >
              {/* Status toggle */}
              <button
                onClick={() => cycleStatus(task)}
                className="flex-shrink-0 hover:scale-110 transition-transform"
                title={`Mark as ${STATUS_LABELS[STATUS_NEXT[task.status]]}`}
              >
                {STATUS_ICON[task.status]}
              </button>

              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-syne ${task.status === 'DONE' ? 'line-through text-[#6B6860]' : 'text-white'}`}>
                  {task.title}
                </span>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className={`text-xs font-syne ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                  {task.campaign && (
                    <span className="text-xs text-[#6B6860] font-syne">
                      📌 {task.campaign.name}
                    </span>
                  )}
                  {task.assignee && (
                    <span className="text-xs text-[#6B6860] font-syne">
                      → {task.assignee.name}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="text-xs text-[#6B6860] font-syne">
                      Due {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <span className="text-xs text-[#6B6860] font-syne hidden sm:block">
                {STATUS_LABELS[task.status]}
              </span>

              {/* Delete (admin only, shows on hover) */}
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[#6B6860] hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **3.2 TypeScript check**

```bash
cd ~/socialsculp-dashboard && npx tsc --noEmit
```

- [ ] **3.3 Commit**

```bash
git add app/(dashboard)/admin/tasks/
git commit -m "feat(tasks): add admin tasks page"
```

---

## Task 4 — Portal Previews: Index Page + PreviewBanner

**Files:**
- Create: `components/admin/PreviewBanner.tsx`
- Create: `app/(dashboard)/admin/portals/page.tsx`

- [ ] **4.1 Create `components/admin/PreviewBanner.tsx`**

```tsx
import Link from 'next/link'
import { Eye, ArrowLeft } from 'lucide-react'

interface PreviewBannerProps {
  userName: string
  role: string
}

export function PreviewBanner({ userName, role }: PreviewBannerProps) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-2.5 bg-amber-500/20 border-b border-amber-500/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-amber-400 text-sm font-syne">
        <Eye className="w-4 h-4" />
        <span>Admin Preview — viewing as <strong>{userName}</strong> ({role})</span>
      </div>
      <Link
        href="/admin/portals"
        className="flex items-center gap-1.5 text-amber-400 text-sm font-syne hover:text-amber-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Exit Preview
      </Link>
    </div>
  )
}
```

- [ ] **4.2 Create `app/(dashboard)/admin/portals/page.tsx`**

Fetch all users with brand/creator/agent profiles. Group by role. Each row has name, email, a preview button.

```tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export default async function AdminPortalsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = getDb()
  const adminUser = await db.user.findUnique({ where: { clerkId: userId } })
  if (adminUser?.role !== 'ADMIN') redirect('/admin')

  const [brands, creators, agents] = await Promise.all([
    db.user.findMany({
      where: { role: 'BRAND' },
      include: { brandProfile: { select: { companyName: true } } },
      orderBy: { name: 'asc' },
    }),
    db.user.findMany({
      where: { role: 'CREATOR' },
      include: { creatorProfile: { select: { handle: true } } },
      orderBy: { name: 'asc' },
    }),
    db.user.findMany({
      where: { role: 'AGENT' },
      orderBy: { name: 'asc' },
    }),
  ])

  function UserTable({
    users,
    role,
    previewBasePath,
    subtitle,
  }: {
    users: { id: string; name: string; email: string }[]
    role: string
    previewBasePath: string
    subtitle?: string
  }) {
    return (
      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#222222]">
          <h2 className="text-base font-syne font-semibold text-white">{role} Portal</h2>
          {subtitle && <p className="text-xs text-[#6B6860] font-syne mt-0.5">{subtitle}</p>}
        </div>
        {users.length === 0 ? (
          <p className="px-5 py-6 text-sm text-[#6B6860] font-syne">No {role.toLowerCase()} users yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#161616] transition-colors">
                  <td className="px-5 py-3 text-white font-syne">{u.name}</td>
                  <td className="px-5 py-3 text-[#6B6860] font-syne hidden sm:table-cell">{u.email}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`${previewBasePath}/${u.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-syne text-[#008cff] hover:text-white transition-colors px-3 py-1.5 border border-[#222222] rounded-md hover:border-[#008cff]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Portal Previews"
        description="View any user's portal exactly as they see it"
      />
      <div className="grid gap-6">
        <UserTable users={brands} role="Brand" previewBasePath="/admin/portals/brand" subtitle="Client-facing campaign portal" />
        <UserTable users={creators} role="Creator" previewBasePath="/admin/portals/creator" subtitle="Creator campaign & analytics portal" />
        <UserTable users={agents} role="Agent" previewBasePath="/admin/portals/agent" subtitle="Sales agent CRM portal" />
      </div>
    </div>
  )
}
```

- [ ] **4.3 TypeScript check**

```bash
cd ~/socialsculp-dashboard && npx tsc --noEmit
```

- [ ] **4.4 Commit**

```bash
git add components/admin/PreviewBanner.tsx app/(dashboard)/admin/portals/page.tsx
git commit -m "feat(portals): add portal preview index and PreviewBanner component"
```

---

## Task 5 — Brand Portal Preview Page

**Files:**
- Create: `app/(dashboard)/admin/portals/brand/[userId]/page.tsx`

- [ ] **5.1 Create the brand portal preview page**

This page fetches data as if we're the target brand user, then renders the brand portal UI with a preview banner. It mirrors `app/(dashboard)/brand/page.tsx` but uses `userId` from params instead of the Clerk session.

```tsx
import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { PreviewBanner } from '@/components/admin/PreviewBanner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Eye, TrendingUp, DollarSign, Megaphone } from 'lucide-react'
import Link from 'next/link'
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge'
import type { CampaignStatusValue } from '@/lib/constants'

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function BrandPortalPreviewPage({ params }: PageProps) {
  const { userId: adminClerkId } = await auth()
  if (!adminClerkId) redirect('/sign-in')

  const db = getDb()
  const adminUser = await db.user.findUnique({ where: { clerkId: adminClerkId } })
  if (adminUser?.role !== 'ADMIN') redirect('/admin')

  const { userId } = await params

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    include: {
      brandProfile: {
        include: {
          campaigns: {
            include: { analyticsSnapshots: { orderBy: { date: 'desc' }, take: 1 } },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  })

  if (!targetUser || targetUser.role !== 'BRAND' || !targetUser.brandProfile) notFound()

  const brand = targetUser.brandProfile
  const campaigns = brand.campaigns

  const totalReach = campaigns.reduce((s, c) => s + (c.analyticsSnapshots[0]?.reach ?? 0), 0)
  const totalSpend = campaigns.reduce((s, c) => s + (c.analyticsSnapshots[0]?.spend ?? 0), 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length
  const avgROAS = campaigns.length > 0
    ? campaigns.reduce((s, c) => s + (c.analyticsSnapshots[0]?.roas ?? 0), 0) / campaigns.length
    : 0

  return (
    <>
      <PreviewBanner userName={targetUser.name} role="Brand" />
      <div className="p-6">
        <PageHeader
          title={brand.companyName}
          description="Brand dashboard"
        />
        <StatCardGrid
          stats={[
            { label: 'Active Campaigns', value: activeCampaigns, icon: Megaphone, color: 'blue' },
            { label: 'Total Reach', value: formatNumber(totalReach), icon: Eye, color: 'purple' },
            { label: 'Total Spend', value: formatCurrency(totalSpend), icon: DollarSign, color: 'green' },
            { label: 'Avg ROAS', value: `${avgROAS.toFixed(1)}x`, icon: TrendingUp, color: 'yellow' },
          ]}
        />
        <div className="mt-8 bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#222222]">
            <h2 className="text-base font-syne font-semibold text-white">Campaigns</h2>
          </div>
          {campaigns.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[#6B6860] font-syne text-center">No campaigns yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="px-5 py-3 text-left text-xs text-[#6B6860] font-syne uppercase">Campaign</th>
                  <th className="px-5 py-3 text-left text-xs text-[#6B6860] font-syne uppercase hidden sm:table-cell">Status</th>
                  <th className="px-5 py-3 text-right text-xs text-[#6B6860] font-syne uppercase">Budget</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-b border-[#1a1a1a] last:border-0">
                    <td className="px-5 py-3 text-white font-syne">{c.name}</td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <CampaignStatusBadge status={c.status as CampaignStatusValue} />
                    </td>
                    <td className="px-5 py-3 text-right text-[#6B6860] font-syne">{formatCurrency(c.totalBudget)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
```

- [ ] **5.2 TypeScript check + commit**

```bash
cd ~/socialsculp-dashboard && npx tsc --noEmit
git add app/(dashboard)/admin/portals/brand/
git commit -m "feat(portals): add brand portal preview page"
```

---

## Task 6 — Creator Portal Preview Page

**Files:**
- Create: `app/(dashboard)/admin/portals/creator/[userId]/page.tsx`

- [ ] **6.1 Create the creator portal preview page**

Mirrors `app/(dashboard)/creator/page.tsx` (creator home dashboard).

```tsx
import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { PreviewBanner } from '@/components/admin/PreviewBanner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { formatNumber, formatPercent } from '@/lib/utils'
import { Users, TrendingUp, Megaphone, Star } from 'lucide-react'
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge'
import type { CampaignStatusValue } from '@/lib/constants'

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function CreatorPortalPreviewPage({ params }: PageProps) {
  const { userId: adminClerkId } = await auth()
  if (!adminClerkId) redirect('/sign-in')

  const db = getDb()
  const adminUser = await db.user.findUnique({ where: { clerkId: adminClerkId } })
  if (adminUser?.role !== 'ADMIN') redirect('/admin')

  const { userId } = await params

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    include: {
      creatorProfile: {
        include: {
          campaignCreators: {
            include: { campaign: { include: { brand: true } } },
            orderBy: { campaign: { createdAt: 'desc' } },
            take: 5,
          },
          deals: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      },
    },
  })

  if (!targetUser || targetUser.role !== 'CREATOR' || !targetUser.creatorProfile) notFound()

  const creator = targetUser.creatorProfile
  const tiktokFollowers = creator.tiktokFollowers ?? 0
  const instagramFollowers = creator.instagramFollowers ?? 0
  const totalFollowers = tiktokFollowers + instagramFollowers
  const avgEng = ((creator.tiktokEngRate ?? 0) + (creator.instagramEngRate ?? 0)) / 2

  return (
    <>
      <PreviewBanner userName={targetUser.name} role="Creator" />
      <div className="p-6">
        <PageHeader
          title={creator.handle ? `@${creator.handle}` : targetUser.name}
          description="Creator portal"
        />
        <StatCardGrid
          stats={[
            { label: 'Total Followers', value: formatNumber(totalFollowers), icon: Users, color: 'blue' },
            { label: 'TikTok', value: formatNumber(tiktokFollowers), icon: Star, color: 'purple' },
            { label: 'Instagram', value: formatNumber(instagramFollowers), icon: Star, color: 'purple' },
            { label: 'Avg Eng Rate', value: formatPercent(avgEng), icon: TrendingUp, color: 'green' },
          ]}
        />
        <div className="mt-8 bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#222222]">
            <h2 className="text-base font-syne font-semibold text-white">Active Campaigns</h2>
          </div>
          {creator.campaignCreators.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[#6B6860] font-syne text-center">No campaigns assigned.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {creator.campaignCreators.map(cc => (
                  <tr key={cc.id} className="border-b border-[#1a1a1a] last:border-0">
                    <td className="px-5 py-3 text-white font-syne">{cc.campaign.name}</td>
                    <td className="px-5 py-3 text-[#6B6860] font-syne hidden sm:table-cell">{cc.campaign.brand.companyName}</td>
                    <td className="px-5 py-3">
                      <CampaignStatusBadge status={cc.campaign.status as CampaignStatusValue} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
```

- [ ] **6.2 TypeScript check + commit**

```bash
cd ~/socialsculp-dashboard && npx tsc --noEmit
git add app/(dashboard)/admin/portals/creator/
git commit -m "feat(portals): add creator portal preview page"
```

---

## Task 7 — Agent Portal Preview Page

**Files:**
- Create: `app/(dashboard)/admin/portals/agent/[userId]/page.tsx`

- [ ] **7.1 Create the agent portal preview page**

Mirrors `app/(dashboard)/agent/page.tsx`.

```tsx
import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { PreviewBanner } from '@/components/admin/PreviewBanner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { formatCurrency } from '@/lib/utils'
import { Users, DollarSign, TrendingUp, Handshake } from 'lucide-react'
import { SalesDealStage } from '@prisma/client'

interface PageProps {
  params: Promise<{ userId: string }>
}

const STAGE_LABELS: Record<SalesDealStage, string> = {
  APPOINTMENT_SET: 'Appointment Set',
  QUALIFIED: 'Qualified',
  DECISION_MAKER: 'Decision Maker',
  PROPOSAL_SENT: 'Proposal Sent',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
}

export default async function AgentPortalPreviewPage({ params }: PageProps) {
  const { userId: adminClerkId } = await auth()
  if (!adminClerkId) redirect('/sign-in')

  const db = getDb()
  const adminUser = await db.user.findUnique({ where: { clerkId: adminClerkId } })
  if (adminUser?.role !== 'ADMIN') redirect('/admin')

  const { userId } = await params

  const targetUser = await db.user.findUnique({ where: { id: userId } })
  if (!targetUser || targetUser.role !== 'AGENT') notFound()

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [newLeads, deals] = await Promise.all([
    db.lead.count({
      where: { createdById: targetUser.id, createdAt: { gte: oneWeekAgo } },
    }),
    db.salesDeal.findMany({
      where: { createdById: targetUser.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  const inNegotiation = deals.filter(d =>
    ['QUALIFIED', 'DECISION_MAKER', 'PROPOSAL_SENT'].includes(d.stage)
  ).length
  const closedWon = deals.filter(d => d.stage === 'CLOSED_WON').length
  const pipelineValue = deals
    .filter(d => d.stage !== 'CLOSED_LOST')
    .reduce((s, d) => s + (d.value ?? 0), 0)

  return (
    <>
      <PreviewBanner userName={targetUser.name} role="Agent" />
      <div className="p-6">
        <PageHeader title={targetUser.name} description="Agent portal" />
        <StatCardGrid
          stats={[
            { label: 'New Leads (7d)', value: newLeads, icon: Users, color: 'blue' },
            { label: 'In Negotiation', value: inNegotiation, icon: Handshake, color: 'yellow' },
            { label: 'Closed Won', value: closedWon, icon: TrendingUp, color: 'green' },
            { label: 'Pipeline Value', value: formatCurrency(pipelineValue), icon: DollarSign, color: 'purple' },
          ]}
        />
        <div className="mt-8 bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#222222]">
            <h2 className="text-base font-syne font-semibold text-white">Recent Deals</h2>
          </div>
          {deals.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[#6B6860] font-syne text-center">No deals yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {deals.slice(0, 8).map(d => (
                  <tr key={d.id} className="border-b border-[#1a1a1a] last:border-0">
                    <td className="px-5 py-3 text-white font-syne">{d.companyName}</td>
                    <td className="px-5 py-3 text-[#6B6860] font-syne hidden sm:table-cell">{STAGE_LABELS[d.stage]}</td>
                    <td className="px-5 py-3 text-right text-[#6B6860] font-syne">{formatCurrency(d.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
```

- [ ] **7.2 TypeScript check + commit**

```bash
cd ~/socialsculp-dashboard && npx tsc --noEmit
git add app/(dashboard)/admin/portals/agent/
git commit -m "feat(portals): add agent portal preview page"
```

---

## Task 8 — Sidebar: Add Portals + Tasks nav entries

**Files:**
- Modify: `components/layout/Sidebar.tsx`

Note: The Decks agent running concurrently may have already added `LayoutTemplate` to the Sidebar. Read the file first before editing.

- [ ] **8.1 Read current Sidebar.tsx**

Read `components/layout/Sidebar.tsx` to see the current state before editing.

- [ ] **8.2 Add icons and nav entries**

Make these three changes (add to existing imports/objects, don't duplicate if already present):

1. Add `Eye` and `CheckSquare` to the lucide-react import line
2. Add `Eye` and `CheckSquare` to the `ICON_MAP` object
3. Add to the `ADMIN` array (after `Analytics`, before `Settings`):
   ```ts
   { label: 'Portals', href: '/admin/portals', icon: 'Eye' },
   { label: 'Tasks', href: '/admin/tasks', icon: 'CheckSquare' },
   ```

- [ ] **8.3 TypeScript check**

```bash
cd ~/socialsculp-dashboard && npx tsc --noEmit
```

- [ ] **8.4 Full build check**

```bash
cd ~/socialsculp-dashboard && npx next build 2>&1 | tail -10
```

Expected: clean build, no errors.

- [ ] **8.5 Commit + push**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat(nav): add Portals and Tasks to admin sidebar"
git push origin feature/portal-trifecta
```

---

## Verification

1. **Tasks**: Visit `/admin/tasks`, add a task, verify it appears. Click the status icon to cycle it through To Do → In Progress → Done. Hover and delete it.
2. **Portal previews index**: Visit `/admin/portals`, verify Brand/Creator/Agent tables list real users.
3. **Brand preview**: Click Preview on a brand user — verify brand portal renders with amber preview banner and real data. Click "Exit Preview" to return.
4. **Creator preview**: Same for a creator user — verify creator stats and campaign list render.
5. **Agent preview**: Same for an agent user — verify pipeline stats render.
6. **Role protection**: Verify a non-admin user visiting `/admin/portals/brand/[anyId]` is redirected.
