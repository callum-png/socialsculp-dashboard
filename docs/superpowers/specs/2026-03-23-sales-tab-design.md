# Sales Tab — Design Spec

**Date:** 2026-03-23
**Project:** SocialSculp Admin Dashboard (`socialsculp-dashboard`)
**Scope:** New Sales section under the admin Operations sidebar group, with two sub-tabs: Call Preps and Playbooks.

---

## 1. Structure & Navigation

### Sidebar

Add a `Sales` entry to the **Operations** group in `components/layout/Sidebar.tsx`. Icon: `PhoneCall` (Lucide — confirmed present in `lucide-react@^0.577.0`, the installed version). Href: `/admin/sales`. Positioned after `CRM`. Add `PhoneCall` to `ICON_MAP`.

```
Operations
  CRM          /admin/crm
  Sales        /admin/sales        ← new
  Decks        /admin/decks
  Portals      /admin/portals
  Tasks        /admin/tasks
  Users        /admin/users
  Settings     /admin/settings
```

### Routes

```
app/(dashboard)/admin/sales/
  page.tsx                         ← Sales index (tab shell)
  call-preps/[id]/page.tsx         ← CallPrep detail
  playbooks/[id]/page.tsx          ← Playbook detail
```

### Tab layout

`/admin/sales` renders a tab bar with two tabs. Tab state is stored in a `?tab=` query param (default: `call-preps`; any invalid value falls back to `call-preps`). The URL does not change to a sub-route when switching tabs.

```
/admin/sales?tab=call-preps   →  <CallPrepsTab>
/admin/sales?tab=playbooks    →  <PlaybooksTab>
```

Detail pages are full-page routes (not modals).

---

## 2. Data Model

Two new Prisma models added to `prisma/schema.prisma`.

### `CallPrep`

Prospect-specific call preparation document. Not a hard foreign key to `Lead` — kept lightweight for now.

```prisma
model CallPrep {
  id          String    @id @default(cuid())
  prospect    String              // e.g. "Plutus Gaming"
  company     String?
  callType    String              // e.g. "Discovery Call"
  scheduledAt DateTime?
  sections    Json      @default("[]")  // Section[]
  createdById String
  createdBy   User      @relation(fields: [createdById], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("call_preps")
}
```

### `Playbook`

Reusable call type template. Shared admin resource — intentionally has no `createdById`. Playbooks are global, not user-owned.

```prisma
model Playbook {
  id          String    @id @default(cuid())
  name        String              // e.g. "Discovery Call"
  description String?
  sections    Json      @default("[]")  // Section[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("playbooks")
}
```

### Section JSON shape (TypeScript type, not DB-enforced)

```ts
type Section = {
  title: string   // required; e.g. "Agenda", "Key Objections", "Close Strategy"
  body: string    // required; may be empty string; markdown or plain text
}
```

Sections are ordered by array index — no `order` field needed. They are always read and written as a unit with the parent doc.

### User relation on `User` model

Add the inverse relation to `User`:

```prisma
callPreps  CallPrep[]
```

---

## 3. Page Components

### Server/client boundary

Server components fetch data and pass it as props. Client components own UI state (drawers, edit mode) and call API routes via `fetch`. The pattern per tab is:

```
<CallPrepsTab>         ← server: fetches data, passes rows as props
  <CallPrepsClient>    ← client: owns drawer open/close state
    <SalesDrawer>      ← client: slide-over form
```

The detail pages follow the same pattern:

```
<CallPrepDetailPage>      ← server: fetches CallPrep, passes to shell
  <SectionEditorShell>    ← client: owns edit-mode toggle state
    <SectionViewer>       ← read-only when not editing
    <SectionEditor>       ← edit mode; calls PATCH on save
```

### `app/(dashboard)/admin/sales/page.tsx`

Server component. Reads `?tab` from `searchParams` (defaults/falls back to `call-preps`). Renders the tab bar and the active tab component.

### `<CallPrepsTab>` (server) + `<CallPrepsClient>` (client)

Server component fetches all `CallPrep` rows ordered by `createdAt desc`, passes them to `<CallPrepsClient>`.

`<CallPrepsClient>`:
- Renders table: Prospect | Company | Call Type | Scheduled | →
- Clicking a row navigates to `/admin/sales/call-preps/[id]`
- **"New Call Prep"** button opens `<SalesDrawer>` with form fields: prospect name, company, call type (text input), scheduled date
- On submit: `POST /api/sales/call-preps` → `router.refresh()` to revalidate

First seeded entry: **Plutus Gaming** (company: plutus.gg, callType: Discovery Call).

### `app/(dashboard)/admin/sales/call-preps/[id]/page.tsx`

Server component. Fetches `CallPrep` by id. Passes data to `<SectionEditorShell>`.

- Back link: `← Back to Sales`
- Header: prospect name + call type + scheduled date
- `<SectionEditorShell>` renders `<SectionViewer>` by default; Edit button toggles to `<SectionEditor>`
- Save: `PATCH /api/sales/call-preps/[id]` with `{ sections }` → `router.refresh()`

### `<PlaybooksTab>` (server) + `<PlaybooksClient>` (client)

Same pattern as CallPreps. Server fetches all `Playbook` rows. Client renders a card grid (name + description). "New Playbook" drawer. Click → `/admin/sales/playbooks/[id]`.

### `app/(dashboard)/admin/sales/playbooks/[id]/page.tsx`

Identical structure to CallPrep detail. PATCH sends `{ name, description, sections }` (all mutable fields).

---

## 4. API Routes

### Field contracts

**`POST /api/sales/call-preps`**
Body: `{ prospect: string, company?: string, callType: string, scheduledAt?: string }`
Creates with empty `sections: []`.

**`PATCH /api/sales/call-preps/[id]`**
Body: `{ prospect?: string, company?: string, callType?: string, scheduledAt?: string | null, sections?: Section[] }`
All fields optional; only provided fields are updated.

**`POST /api/sales/playbooks`**
Body: `{ name: string, description?: string }`
Creates with empty `sections: []`.

**`PATCH /api/sales/playbooks/[id]`**
Body: `{ name?: string, description?: string, sections?: Section[] }`
All fields optional.

All routes require ADMIN role. The pattern follows existing admin routes: `auth()` returns Clerk `userId`, then `db.user.findUnique({ where: { clerkId: userId } })` retrieves the Prisma user (which is guaranteed to exist via the Clerk `user.created` webhook at `app/api/webhooks/clerk/route.ts` that syncs every new Clerk user into the `User` table). The `createdById` FK in `CallPrep` is populated with `user.id` from this lookup.

**Input validation** — API route handlers must validate incoming JSON using a Zod schema before writing to the database. Minimum schemas:

```ts
// Shared
const SectionSchema = z.object({ title: z.string().min(1), body: z.string() })

// POST /api/sales/call-preps
const CreateCallPrepSchema = z.object({
  prospect: z.string().min(1),
  company: z.string().optional(),
  callType: z.string().min(1),
  scheduledAt: z.string().datetime().optional(),
})

// PATCH /api/sales/call-preps/[id]
const UpdateCallPrepSchema = z.object({
  prospect: z.string().min(1).optional(),
  company: z.string().nullable().optional(),
  callType: z.string().min(1).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  sections: z.array(SectionSchema).optional(),
})

// POST /api/sales/playbooks
const CreatePlaybookSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

// PATCH /api/sales/playbooks/[id]
const UpdatePlaybookSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  sections: z.array(SectionSchema).optional(),
})
```

`scheduledAt` is accepted as an ISO 8601 UTC string and stored as-is. No delete endpoints.

---

## 5. Shared Components

New directory: `components/sales/`

| Component | Type | Purpose |
|---|---|---|
| `SectionViewer` | client | Renders a `Section[]` as stacked read-only cards |
| `SectionEditor` | client | Textarea per section + add/remove controls; calls PATCH on save |
| `SectionEditorShell` | client | Owns edit-mode toggle; renders SectionViewer or SectionEditor |
| `SalesDrawer` | client | Generic slide-over drawer wrapper, reused by both "New" forms |

---

## 6. Access Control Notes

`Playbook` has no ownership — any ADMIN can overwrite any Playbook's sections. This is a conscious decision: Playbooks are shared templates, not personal documents.

`CallPrep` is created by and attributed to a specific admin user (via `createdById`) but there is no per-record access control — any ADMIN can edit any CallPrep.

---

## 7. Out of Scope

- Delete endpoints for CallPrep or Playbook (no soft-delete or archive flag at this stage)
- Linking CallPrep to a `Lead` record (can be added later via optional FK)
- Versioning or history of section edits
- Sharing/exporting call prep docs
- Per-record ownership enforcement for CallPreps
