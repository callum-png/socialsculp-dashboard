# Sales Tab — Design Spec

**Date:** 2026-03-23
**Project:** SocialSculp Admin Dashboard (`socialsculp-dashboard`)
**Scope:** New Sales section under the admin Operations sidebar group, with two sub-tabs: Call Preps and Playbooks.

---

## 1. Structure & Navigation

### Sidebar

Add a `Sales` entry to the **Operations** group in `components/layout/Sidebar.tsx`. Icon: `PhoneCall` (Lucide). Href: `/admin/sales`. Positioned after `CRM`.

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

`/admin/sales` renders a tab bar with two tabs. Tab state is stored in a `?tab=` query param (default: `call-preps`) so the active tab survives a refresh and is directly linkable. The URL does not change to a sub-route when switching tabs.

```
/admin/sales?tab=call-preps   →  <CallPrepsTab>
/admin/sales?tab=playbooks    →  <PlaybooksTab>
```

Detail pages are full-page routes (not modals), as content is rich enough to warrant the space.

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

Reusable call type template. Shared admin resource — no user ownership.

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
  title: string   // e.g. "Agenda", "Key Objections", "Close Strategy"
  body: string    // markdown or plain text
}
```

Sections are always read and written as a unit with the parent doc — no per-section IDs needed.

### User relation on `User` model

Add the inverse relations to `User`:

```prisma
callPreps  CallPrep[]
```

---

## 3. Page Components

### `app/(dashboard)/admin/sales/page.tsx`

Server component. Renders the tab bar and delegates to the active tab component. Reads `?tab` from `searchParams`.

```
<SalesPage>
  <TabBar tabs={["Call Preps", "Playbooks"]} />
  {tab === 'call-preps' && <CallPrepsTab />}
  {tab === 'playbooks'  && <PlaybooksTab />}
```

### `<CallPrepsTab>`

Server component. Fetches all `CallPrep` rows ordered by `createdAt desc`.

- Renders a table: Prospect | Company | Call Type | Scheduled | →
- Clicking a row navigates to `/admin/sales/call-preps/[id]`
- **"New Call Prep"** button (top-right) opens `<SalesDrawer>` with a form: prospect name, company, call type (text input), scheduled date
- On submit: `POST /api/sales/call-preps` → revalidate list

First seeded entry: **Plutus Gaming** (plutus.gg, Discovery Call).

### `app/(dashboard)/admin/sales/call-preps/[id]/page.tsx`

Server component. Fetches `CallPrep` by id.

- Back link: `← Back to Sales`
- Header: prospect name + call type + scheduled date
- Body: `<SectionViewer sections={callPrep.sections} />`
- **Edit** button toggles `<SectionEditor>` inline (client component)
- Save: `PATCH /api/sales/call-preps/[id]`

### `<PlaybooksTab>`

Same pattern as `<CallPrepsTab>`. Fetches all `Playbook` rows. Renders a card grid (name + description). "New Playbook" drawer. Click → `/admin/sales/playbooks/[id]`.

### `app/(dashboard)/admin/sales/playbooks/[id]/page.tsx`

Identical structure to the CallPrep detail page. Same `<SectionViewer>` and `<SectionEditor>` components. Save: `PATCH /api/sales/playbooks/[id]`.

---

## 4. API Routes

```
POST   /api/sales/call-preps          Create a new CallPrep
PATCH  /api/sales/call-preps/[id]     Update sections (and metadata) on a CallPrep
POST   /api/sales/playbooks           Create a new Playbook
PATCH  /api/sales/playbooks/[id]      Update sections (and metadata) on a Playbook
```

No delete endpoints. All routes require ADMIN role (enforced via Clerk auth check, consistent with other admin API routes).

---

## 5. Shared Components

New directory: `components/sales/`

| Component | Purpose |
|---|---|
| `SectionViewer` | Renders a `Section[]` as stacked read-only cards |
| `SectionEditor` | Inline edit mode: textarea per section + add/remove controls |
| `SalesDrawer` | Generic slide-over drawer wrapper, reused by both "New" forms |

---

## 6. Out of Scope

- Delete endpoints for CallPrep or Playbook
- Linking CallPrep to a `Lead` record (can be added later)
- Versioning or history of section edits
- Sharing/exporting call prep docs
