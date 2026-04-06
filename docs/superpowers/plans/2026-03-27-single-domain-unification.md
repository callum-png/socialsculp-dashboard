# SocialSculp Single Domain Unification

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make socialsculp.io serve the v2 landing page for all visitors, with Clerk auth and dashboard portals — all on one domain, like netflix.com.

**Architecture:** Move the `socialsculp.io` domain from the old `socialsculp-brand` Vercel project to the `socialsculp-dashboard` project. The dashboard already has the v2 landing at `/`, Clerk auth at `/sign-in` and `/sign-up`, and all portal routes (`/admin`, `/brand`, `/creator`, `/agent`). The only change is the Vercel domain assignment + removing the old page's auth-redirect logic so everyone sees the landing first.

**Tech Stack:** Vercel (domain config), Next.js 16 App Router, Clerk v7

---

## Current State

| What | Where |
|------|-------|
| socialsculp.io domain | Points to Vercel project `socialsculp-landing` (old brand repo) |
| v2 landing page code | Lives in `socialsculp-dashboard` repo at `app/(marketing)/page.tsx` |
| Dashboard + auth | Lives in `socialsculp-dashboard` repo |
| Old landing page | Lives in `callum-png/SocialSculp` repo → `socialsculp-brand/` subfolder |

## Target State

| What | Where |
|------|-------|
| socialsculp.io domain | Points to Vercel project `socialsculp` (dashboard repo) |
| socialsculp.io/ | v2 landing page — NO auth redirect, everyone sees it |
| socialsculp.io/sign-in | Clerk sign-in |
| socialsculp.io/sign-up | Clerk sign-up |
| socialsculp.io/admin | Auth-gated admin portal |
| socialsculp.io/brand | Auth-gated brand portal |
| socialsculp.io/creator | Auth-gated creator portal |
| socialsculp.io/agent | Auth-gated agent portal |

---

### Task 1: Remove Auth Redirect from Root Landing Page

**Why:** Currently `app/(marketing)/page.tsx` checks if the user is logged in and redirects them to their dashboard. Cal wants EVERYONE to see the landing page first — like netflix.com. Users click "Sign In" themselves.

**Files:**
- Modify: `app/(marketing)/page.tsx`

- [ ] **Step 1: Remove the auth redirect from the root page**

Replace the entire `page.tsx` with a clean version that just renders the v2 landing — no auth check, no redirect:

```tsx
import './v2/landing-v2.css'
import { V2PageWrapper } from './v2/V2Client'

// Case studies, services, brands data (keep existing)
const caseStudies = [ /* existing data */ ]
const services = [ /* existing data */ ]
const brands = [ /* existing data */ ]

export default function Home() {
  return <V2PageWrapper caseStudies={caseStudies} services={services} brands={brands} />
}
```

The key change: remove `auth()`, `clerkClient()`, and all `redirect()` calls. The page is now a simple server component with zero auth logic.

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No new errors (pre-existing openclaw errors are OK)

- [ ] **Step 3: Commit**

```bash
git add app/(marketing)/page.tsx
git commit -m "fix: remove auth redirect from landing — everyone sees landing first"
```

---

### Task 2: Move Domain in Vercel Dashboard (Manual)

**Why:** `socialsculp.io` currently points to the old `socialsculp-landing` Vercel project. It needs to point to the `socialsculp` (dashboard) project instead.

**This is a manual step — Cal must do this in the Vercel dashboard.**

- [ ] **Step 1: Remove domain from old project**

1. Go to https://vercel.com → project `socialsculp-landing`
2. Settings → Domains
3. Remove `socialsculp.io` and `www.socialsculp.io`

- [ ] **Step 2: Add domain to dashboard project**

1. Go to https://vercel.com → project `socialsculp` (the dashboard)
2. Settings → Domains
3. Add `socialsculp.io`
4. Add `www.socialsculp.io` (redirect to socialsculp.io)
5. Vercel will auto-configure DNS if using Vercel DNS, or show you the records to update

- [ ] **Step 3: Verify DNS propagation**

Run: `curl -s -o /dev/null -w "%{http_code}" https://socialsculp.io`
Expected: 200

Run: `curl -s https://socialsculp.io | grep "We Engineer"`
Expected: Match found (v2 landing content)

---

### Task 3: Update Clerk Allowed Origins

**Why:** Clerk needs to know that `socialsculp.io` is an allowed origin for the dashboard project's Clerk instance. If the domain changes, Clerk auth may fail if the origin isn't whitelisted.

- [ ] **Step 1: Check Clerk Dashboard**

1. Go to https://dashboard.clerk.com
2. Select the SocialSculp application
3. Go to Settings → Domains
4. Ensure `socialsculp.io` is listed as an allowed origin
5. If not, add it

- [ ] **Step 2: Verify sign-in works**

Navigate to `https://socialsculp.io/sign-in`
Expected: Clerk sign-in page renders correctly

---

### Task 4: Push to Main and Force Redeploy

- [ ] **Step 1: Push changes to main**

```bash
git push origin main
```

- [ ] **Step 2: If needed, force redeploy**

```bash
git commit --allow-empty -m "chore: force redeploy for domain change"
git push origin main
```

- [ ] **Step 3: Verify live site**

Check these URLs:
- `https://socialsculp.io` → v2 landing page (stars, cube, case studies)
- `https://socialsculp.io/sign-in` → Clerk sign-in
- `https://socialsculp.io/admin` → redirects to sign-in (auth-gated)
- `https://socialsculp.io/v2` → same landing page (still works)

---

## Rollback Plan

If anything breaks:
1. Re-add `socialsculp.io` domain to the `socialsculp-landing` project in Vercel
2. Remove it from the `socialsculp` project
3. The old landing page will be back immediately
