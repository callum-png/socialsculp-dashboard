# Editorial Typography — Design Spec
**Date:** 2026-03-22

## Goal
Make the dashboard typography more vibrant and editorial using the Fraunces serif already loaded in the project, while keeping Syne for all UI chrome.

## Direction: Editorial (Option A)
- Fraunces for display text: page titles, large stat numbers, secondary/italic descriptions
- Syne for all UI labels, buttons, table headers, badges, nav — anything functional
- No letter-spacing on display text or brand names (letters must sit tight)
- Accent color (#008cff) on key/active stat values

## Changes by Component

### 1. `components/shared/PageHeader.tsx`
- Add optional `eyebrow?: string` prop (backward compatible — existing call sites pass nothing and render nothing)
- Eyebrow: `font-syne text-[9px] font-bold uppercase tracking-[0.12em] text-accent mb-1` (renders only when prop is provided)
- Title: change from `text-2xl font-bold tracking-tight text-foreground` Syne → `font-fraunces text-2xl font-bold leading-none text-foreground` (no letter-spacing)
- Description: change from `text-sm text-muted-foreground` Syne → `font-fraunces text-sm italic text-muted` (conscious switch from CSS-var token to direct design token — both resolve to #6B6860)

### 2. `components/shared/StatCard.tsx`
- Stat value: change from `text-lg sm:text-xl font-bold tracking-tight text-foreground` Syne → `font-fraunces text-2xl font-bold leading-none text-foreground`
- Remove `tracking-tight` (no tracking on display numbers)
- When `accent={true}` OR `color === 'blue'`: render value in `text-accent` (blue) — both variants already turn the icon blue, so the value should match for visual consistency

### 3. `components/campaigns/CampaignTable.tsx`
- `brandName` cells: add `font-fraunces italic` alongside existing `text-muted`
- `platform` cells: add `font-fraunces italic` alongside existing `text-muted`

### 4. Eyebrow on page-level routes (top-level list pages only)

Eyebrow applies to top-level section pages only. Detail pages, new/edit pages, and portal sub-pages intentionally omit the eyebrow — it's a section landmark, not a breadcrumb replacement.

**Admin pages — `eyebrow="Admin"`:**
- `app/(dashboard)/admin/page.tsx`
- `app/(dashboard)/admin/campaigns/page.tsx`
- `app/(dashboard)/admin/creators/page.tsx`
- `app/(dashboard)/admin/deals/page.tsx`
- `app/(dashboard)/admin/analytics/page.tsx`
- `app/(dashboard)/admin/brands/page.tsx`
- `app/(dashboard)/admin/decks/page.tsx`
- `app/(dashboard)/admin/portals/page.tsx`
- `app/(dashboard)/admin/tasks/page.tsx`
- `app/(dashboard)/admin/crm/page.tsx` (PageHeader rendered inside `CrmView` component)

**Brand portal — `eyebrow="Brand"`:**
- `app/(dashboard)/brand/page.tsx`
- `app/(dashboard)/brand/campaigns/page.tsx`
- `app/(dashboard)/brand/reports/page.tsx`

**Creator portal — `eyebrow="Creator"`:**
- `app/(dashboard)/creator/page.tsx`
- `app/(dashboard)/creator/campaigns/page.tsx`
- `app/(dashboard)/creator/analytics/page.tsx`
- `app/(dashboard)/creator/deals/page.tsx`

**Agent portal — `eyebrow="Agent"`:**
- `app/(dashboard)/agent/page.tsx`
- `app/(dashboard)/agent/crm/page.tsx`

**No eyebrow (detail/sub pages — intentionally omitted):**
- `admin/campaigns/[id]/page.tsx`
- `admin/campaigns/new/page.tsx`
- `admin/creators/[id]/page.tsx`
- `admin/portals/brand/[userId]/page.tsx`
- `admin/portals/creator/[userId]/page.tsx`
- `admin/portals/agent/[userId]/page.tsx`
- `brand/campaigns/[id]/page.tsx`
- `creator/campaigns/[id]/page.tsx`

## What Does NOT Change
- Modals and forms — UI chrome stays Syne throughout
- Table headers, badges, labels — Syne
- Nav, topbar, sidebar — Syne
- Buttons — Syne
- Breadcrumb links in PageHeader use `tracking-widest` at `text-xs` — this predates the rule and is intentionally left alone
- `CreatorCard` creator.name already uses `font-fraunces` ✓
- `DealKanbanCard` campaign name already uses `font-fraunces` ✓

## Letter-Spacing Rule
- Zero tracking on all display text (titles, numbers, names)
- Logo/brand wordmarks: zero tracking always
- Only tiny ALL-CAPS UI labels (≤10px) may use tracking, max 0.12em
- Breadcrumb links are grandfathered — no change required
