# Design Spec: Decks Tab + Plutus Gaming Deck
**Date:** 2026-03-21
**Status:** Approved

---

## Overview

Two deliverables:
1. A public-facing sales/campaign deck at `socialsculp.io/plutus` for Plutus Gaming — a Creator Seeding pitch.
2. An admin-only "Decks" tab in the SocialSculp dashboard (`/admin/decks`) that lists all client decks with links.

---

## Part 1 — Public Deck: `socialsculp.io/plutus`

### Location
- Repo: `callum-png/SocialSculp` (landing site, `C:\Users\Cal\Desktop\Root socialsculp\`)
- File: `plutus.html` in the root directory
- Public URL: `socialsculp.io/plutus`

### Routing Change
`vercel.json` currently rewrites all routes to `/index.html`. Add a specific rewrite so `/plutus` serves `plutus.html` directly. The catch-all rewrite remains for all other routes.

```json
"rewrites": [
  { "source": "/plutus", "destination": "/plutus.html" },
  { "source": "/(.*)", "destination": "/index.html" }
]
```

### Design Language
- Background: `#0a0a0a` (near-black)
- Accent: `#008cff` (SocialSculp blue)
- Typography: Syne (headings), Inter (body) — loaded via Google Fonts
- Style: dark, editorial, premium — no neon gradients, no generic AI aesthetic
- Self-contained HTML file (inline `<style>`, no external CSS framework)

### Deck Sections (in order)

| # | Section | Key Content |
|---|---|---|
| 1 | **Hero** | "Creator Seeding for Plutus Gaming" — tagline, 3 stat pills: `$1–1.50 CPM`, `3-Phase Playbook`, `Live Optimization` |
| 2 | **The Problem** | Paid ads cost $15–30+ CPM, burn budget, feel like ads. Gaming audiences distrust traditional advertising. |
| 3 | **Our Approach** | Data-powered, not guesswork. AI agents monitor in real time. Test → Validate → Scale. |
| 4 | **The 3-Phase Playbook** | Phase 1: Test (prove what works), Phase 2: Validate (double down on winners), Phase 3: Scale (deploy budget behind validated creative only) |
| 5 | **Narrative Strategy** | 3 mechanics: Hook engineering (pain-point angle first, not features), Conversion mechanics (urgency + social proof embedded in structure), Audience propagation (same narrative across multiple creators = compounding reach, dropping CPM) |
| 6 | **The Numbers** | `$1–1.50 CPM` vs `$15–30+ paid ads`, `∞ creator network`, `Live` optimization, `20+ AI agents monitoring` |
| 7 | **Why SocialSculp** | Brief agency credentials — influencer marketing, creative production, talent management, performance marketing |
| 8 | **CTA** | "Book your strategy call" — prominent button linking to `https://calendar.app.google/c6Ci7BweG3LXyMRQ6` |

### No Auth Required
This is a public page. No Clerk, no session checks. Anyone with the link can view it.

---

## Part 2 — Admin Decks Tab (Dashboard)

### Route
`/admin/decks` — page file at `app/(dashboard)/admin/decks/page.tsx`

### Access
Admin-only. The sidebar (`components/layout/Sidebar.tsx`) already gates nav items by role. Add `Decks` to the `ADMIN` nav array only.

### Sidebar Entry
```ts
{ label: 'Decks', href: '/admin/decks', icon: 'LayoutTemplate' }
```
Icon: `LayoutTemplate` from lucide-react (confirmed available in the installed version).

**Three changes required to `Sidebar.tsx`:**
1. Add `LayoutTemplate` to the named lucide-react imports at the top.
2. Add `LayoutTemplate` to the `ICON_MAP` object.
3. Add the nav entry to the `ADMIN` array.

All three are required — the `ICON_MAP` type is closed (`keyof typeof ICON_MAP`), so TypeScript will reject an unregistered icon key.

### Data: Static Config
No DB model. A static config at `lib/decks.ts` exports an array of deck records:

```ts
export interface DeckRecord {
  slug: string          // e.g. "plutus"
  clientName: string    // e.g. "Plutus Gaming"
  publicUrl: string     // e.g. "https://socialsculp.io/plutus"
  service: string       // e.g. "Creator Seeding"
  status: 'live' | 'draft'
  createdAt: string     // ISO date string
  notes?: string
}

export const DECKS: DeckRecord[] = [
  {
    slug: 'plutus',
    clientName: 'Plutus Gaming',
    publicUrl: 'https://socialsculp.io/plutus',
    service: 'Creator Seeding',
    status: 'live',
    createdAt: '2026-03-21',
    notes: 'Discovery call 2026-03-24',
  },
]
```

### Page UI
- `PageHeader` component (existing) with title "Decks"
- Table with columns: **Client**, **Service**, **Status** (badge), **Created** (formatted as `Mar 21, 2026`), **URL** (copy button), **Actions** (Open Deck button → opens in new tab)
- The `notes` field from `DeckRecord` is admin-reference-only — not displayed in the table. It is visible in the config file only.
- Empty state if no decks
- Status badge: `live` = blue, `draft` = muted
- Follows the existing dashboard design system (Syne font, `#111111` card background, `#008cff` accent, `#222222` borders)

### No CRUD UI in this iteration
Adding a new deck = edit `lib/decks.ts` + deploy. No modal or form needed yet. YAGNI.

---

## Out of Scope (this iteration)
- Admin Tasks/To-do tab (noted as backburner, separate spec)
- Deck analytics (view counts, time-on-page)
- Password-protected decks
- Deck editor in the dashboard
- DB-backed deck management

---

## File Checklist

### Landing site — root at `C:\Users\Cal\Desktop\Root socialsculp\` (NOT the empty `SocialSculp\` subfolder)
- [ ] `C:\Users\Cal\Desktop\Root socialsculp\plutus.html` — new file, the complete deck
- [ ] `C:\Users\Cal\Desktop\Root socialsculp\vercel.json` — add `/plutus` rewrite before the catch-all

### Dashboard (`C:\Users\Cal\socialsculp-dashboard\`)
- [ ] `lib/decks.ts` — new static config
- [ ] `app/(dashboard)/admin/decks/page.tsx` — new admin page (synchronous server component, no `'use client'`, pattern: `export default function AdminDecksPage()`)
- [ ] `components/layout/Sidebar.tsx` — three changes: (1) import `LayoutTemplate`, (2) add to `ICON_MAP`, (3) add nav entry to ADMIN array
