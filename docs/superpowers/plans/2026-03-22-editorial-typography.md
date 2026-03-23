# Editorial Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply editorial typography to the SocialSculp dashboard — Fraunces serif for page titles, stat numbers, and secondary descriptions; Syne for all UI chrome; accent-colored key stat values; blue eyebrow labels above page titles.

**Architecture:** Two shared components (`PageHeader`, `StatCard`) cascade changes to every page automatically. The campaign table secondary text is the only component-level change. The remaining work is passing `eyebrow` props at call sites across ~20 route files.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, Fraunces + Syne fonts (both already loaded via Google Fonts in `app/layout.tsx`), TypeScript.

---

## File Map

| File | Change |
|---|---|
| `components/shared/PageHeader.tsx` | Add `eyebrow?` prop; Fraunces title + italic description |
| `components/shared/StatCard.tsx` | Fraunces stat value; accent color on `accent` or `color="blue"` |
| `components/campaigns/CampaignTable.tsx` | Fraunces italic on brandName + platform cells |
| `app/(dashboard)/admin/page.tsx` | Add `eyebrow="Admin"` |
| `app/(dashboard)/admin/campaigns/page.tsx` | Add `eyebrow="Admin"` |
| `app/(dashboard)/admin/creators/page.tsx` | Add `eyebrow="Admin"` |
| `app/(dashboard)/admin/deals/page.tsx` | Add `eyebrow="Admin"` |
| `app/(dashboard)/admin/analytics/page.tsx` | Add `eyebrow="Admin"` |
| `app/(dashboard)/admin/brands/page.tsx` | Add `eyebrow="Admin"` |
| `app/(dashboard)/admin/decks/page.tsx` | Add `eyebrow="Admin"` |
| `app/(dashboard)/admin/portals/page.tsx` | Add `eyebrow="Admin"` |
| `app/(dashboard)/admin/tasks/page.tsx` | Add `eyebrow="Admin"` |
| `app/(dashboard)/admin/crm/page.tsx` (via `CrmView`) | Add `eyebrow="Admin"` to PageHeader inside `components/crm/CrmView.tsx` |
| `app/(dashboard)/brand/page.tsx` | Add `eyebrow="Brand"` |
| `app/(dashboard)/brand/campaigns/page.tsx` | Add `eyebrow="Brand"` |
| `app/(dashboard)/brand/reports/page.tsx` | Add `eyebrow="Brand"` |
| `app/(dashboard)/creator/page.tsx` | Add `eyebrow="Creator"` |
| `app/(dashboard)/creator/campaigns/page.tsx` | Add `eyebrow="Creator"` |
| `app/(dashboard)/creator/analytics/page.tsx` | Add `eyebrow="Creator"` |
| `app/(dashboard)/creator/deals/page.tsx` | Add `eyebrow="Creator"` |
| `app/(dashboard)/agent/page.tsx` | Add `eyebrow="Agent"` |
| `app/(dashboard)/agent/crm/page.tsx` (via `CrmView`) | Add `eyebrow="Agent"` to CrmView — pass as prop |

---

### Task 1: Update `PageHeader` — eyebrow + Fraunces title + italic description

**Files:**
- Modify: `components/shared/PageHeader.tsx`

- [ ] **Step 1: Read the current file**

Read `components/shared/PageHeader.tsx` to confirm current prop shape before editing.

- [ ] **Step 2: Add `eyebrow` prop and apply typography changes**

Replace the `PageHeaderProps` interface and component JSX with:

```tsx
interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  breadcrumb?: BreadcrumbItem[]
  className?: string
  eyebrow?: string   // ← new
}
```

In the component, add the eyebrow render directly above the `<h1>`:
```tsx
{eyebrow && (
  <p className="font-syne text-[9px] font-bold uppercase tracking-[0.12em] text-accent mb-1">
    {eyebrow}
  </p>
)}
<h1 className="font-fraunces text-2xl font-bold leading-none text-foreground">{title}</h1>
```

Change the description line from:
```tsx
<p className="text-sm text-muted-foreground">{description}</p>
```
to:
```tsx
<p className="font-fraunces text-sm italic text-muted">{description}</p>
```

- [ ] **Step 3: Verify build**

```bash
cd /c/Users/Cal/socialsculp-dashboard && npm run build 2>&1 | tail -10
```
Expected: `✓ Compiled successfully` with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add components/shared/PageHeader.tsx
git commit -m "feat(typography): Fraunces title + italic desc + eyebrow prop in PageHeader"
```

---

### Task 2: Update `StatCard` — Fraunces values + accent color on accent/blue variants

**Files:**
- Modify: `components/shared/StatCard.tsx`

- [ ] **Step 1: Read the current file**

Read `components/shared/StatCard.tsx` to confirm current value class and iconColor logic.

- [ ] **Step 2: Change stat value font and add accent value color**

Locate the value `<p>` element (currently `text-lg sm:text-xl font-bold tracking-tight text-foreground`) and replace with:
```tsx
<p className={cn(
  'font-fraunces text-2xl font-bold leading-none',
  (accent || color === 'blue') ? 'text-accent' : 'text-foreground'
)}>
  {displayValue}
</p>
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -10
```
Expected: clean build, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add components/shared/StatCard.tsx
git commit -m "feat(typography): Fraunces stat values + accent color on active/blue cards"
```

---

### Task 3: Update `CampaignTable` — Fraunces italic on secondary cells

**Files:**
- Modify: `components/campaigns/CampaignTable.tsx`

- [ ] **Step 1: Read the current file**

Read `components/campaigns/CampaignTable.tsx` to locate brandName and platform `<td>` cells.

- [ ] **Step 2: Apply Fraunces italic to brandName and platform cells**

Change the brandName `<td>` from:
```tsx
<td className="px-5 py-4 text-muted">
  {campaign.brandName}
</td>
```
to:
```tsx
<td className="px-5 py-4 font-fraunces italic text-muted">
  {campaign.brandName}
</td>
```

Change the platform `<td>` from:
```tsx
<td className="px-5 py-4 text-muted">
  {PLATFORM_LABELS[campaign.platform as PlatformValue] ?? campaign.platform}
</td>
```
to:
```tsx
<td className="px-5 py-4 font-fraunces italic text-muted">
  {PLATFORM_LABELS[campaign.platform as PlatformValue] ?? campaign.platform}
</td>
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add components/campaigns/CampaignTable.tsx
git commit -m "feat(typography): Fraunces italic on campaign table secondary text"
```

---

### Task 4: Add eyebrow props to all Admin portal pages

**Files:**
- Modify: `app/(dashboard)/admin/page.tsx`
- Modify: `app/(dashboard)/admin/campaigns/page.tsx`
- Modify: `app/(dashboard)/admin/creators/page.tsx`
- Modify: `app/(dashboard)/admin/deals/page.tsx`
- Modify: `app/(dashboard)/admin/analytics/page.tsx`
- Modify: `app/(dashboard)/admin/brands/page.tsx`
- Modify: `app/(dashboard)/admin/decks/page.tsx`
- Modify: `app/(dashboard)/admin/portals/page.tsx`
- Modify: `app/(dashboard)/admin/tasks/page.tsx`
- Modify: `components/crm/CrmView.tsx`

- [ ] **Step 1: Read each file before editing**

Read all 10 files listed above. For each `<PageHeader` call site, note the current props.

- [ ] **Step 2: Add `eyebrow="Admin"` to each PageHeader call**

For each file, add `eyebrow="Admin"` to the `<PageHeader` JSX. Example:
```tsx
// Before
<PageHeader title="Campaigns" description={`${campaigns.length} campaigns total`}>

// After
<PageHeader eyebrow="Admin" title="Campaigns" description={`${campaigns.length} campaigns total`}>
```

For `CrmView.tsx`: CrmView is used by both `admin/crm/page.tsx` and `agent/crm/page.tsx` with different eyebrow values. Add `eyebrow?: string` prop to CrmView's interface, pass it down to the `<PageHeader>` inside, then pass `eyebrow="Admin"` from `admin/crm/page.tsx` and `eyebrow="Agent"` from `agent/crm/page.tsx`. Do NOT hardcode.

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add app/(dashboard)/admin/ components/crm/CrmView.tsx
git commit -m "feat(typography): eyebrow='Admin' across all admin portal pages"
```

---

### Task 5: Add eyebrow props to Brand, Creator, and Agent portal pages

**Files:**
- Modify: `app/(dashboard)/brand/page.tsx`
- Modify: `app/(dashboard)/brand/campaigns/page.tsx`
- Modify: `app/(dashboard)/brand/reports/page.tsx`
- Modify: `app/(dashboard)/creator/page.tsx`
- Modify: `app/(dashboard)/creator/campaigns/page.tsx`
- Modify: `app/(dashboard)/creator/analytics/page.tsx`
- Modify: `app/(dashboard)/creator/deals/page.tsx`
- Modify: `app/(dashboard)/agent/page.tsx`
- Modify: `app/(dashboard)/agent/crm/page.tsx` (if CrmView uses eyebrow prop — see Task 4)

- [ ] **Step 1: Read each file before editing**

Read all files. Note each `<PageHeader` call site.

- [ ] **Step 2: Add eyebrow to each call site**

- Brand pages: `eyebrow="Brand"`
- Creator pages: `eyebrow="Creator"`
- Agent pages: `eyebrow="Agent"`

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -10
```
Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add app/(dashboard)/brand/ app/(dashboard)/creator/ app/(dashboard)/agent/
git commit -m "feat(typography): eyebrow props across brand, creator, and agent portals"
```

---

### Task 6: Push to GitHub

- [ ] **Step 1: Final build check**

```bash
npm run build 2>&1 | tail -15
```
Expected: `✓ Compiled successfully`, zero errors or warnings.

- [ ] **Step 2: Push**

```bash
git push
```
