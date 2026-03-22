# Decks Tab + Plutus Gaming Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public sales deck at `socialsculp.io/plutus` for Plutus Gaming (Creator Seeding pitch) and an admin-only "Decks" tab in the SocialSculp dashboard at `/admin/decks`.

**Architecture:** The public deck is a standalone `plutus.html` in the landing site root (static HTML, no framework). The dashboard tab is a synchronous server component reading from a static `lib/decks.ts` config — no DB model needed. Two repos involved; commit each independently.

**Tech Stack:** Landing site — vanilla HTML/CSS/JS, Google Fonts (Syne + Inter), Vercel static hosting. Dashboard — Next.js App Router, Tailwind, Lucide React, existing shared components.

---

## File Map

### Landing site — `C:\Users\Cal\Desktop\Root socialsculp\`
| File | Action | Purpose |
|------|--------|---------|
| `vercel.json` | Modify | Add `/plutus` → `/plutus.html` rewrite before catch-all |
| `plutus.html` | Create | Complete standalone deck page for Plutus Gaming |

### Dashboard — `C:\Users\Cal\socialsculp-dashboard\`
| File | Action | Purpose |
|------|--------|---------|
| `lib/decks.ts` | Create | Static config — array of DeckRecord objects |
| `components/layout/Sidebar.tsx` | Modify | Import LayoutTemplate, add to ICON_MAP, add ADMIN nav entry |
| `app/(dashboard)/admin/decks/page.tsx` | Create | Admin Decks page — table of all decks |

---

## Task 1: Update vercel.json routing

**Repo:** `C:\Users\Cal\Desktop\Root socialsculp\`

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Open vercel.json and add the `/plutus` rewrite**

Current content:
```json
{
  "version": 2,
  "buildCommand": null,
  "outputDirectory": ".",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  ...
}
```

Replace the `rewrites` array with:
```json
"rewrites": [
  { "source": "/plutus", "destination": "/plutus.html" },
  { "source": "/(.*)", "destination": "/index.html" }
]
```

The specific `/plutus` rule must come **before** the catch-all `(.*)` rule. Vercel matches rewrites in order — if the catch-all is first, `/plutus` will always serve `index.html`.

- [ ] **Step 2: Commit**

```bash
cd "C:\Users\Cal\Desktop\Root socialsculp"
git add vercel.json
git commit -m "feat: add /plutus rewrite to serve deck page"
```

---

## Task 2: Create plutus.html — the sales deck

**Repo:** `C:\Users\Cal\Desktop\Root socialsculp\`

**Files:**
- Create: `plutus.html`

This is a self-contained HTML file. No build step — just write the file and it's live on deploy.

- [ ] **Step 1: Create `plutus.html` with the complete deck**

Write the following complete file to `C:\Users\Cal\Desktop\Root socialsculp\plutus.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <title>Creator Seeding for Plutus Gaming — SocialSculp</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --blue: #008cff;
      --blue-dim: rgba(0,140,255,0.12);
      --blue-border: rgba(0,140,255,0.25);
      --black: #090909;
      --surface: #111111;
      --border: #1e1e1e;
      --text: #EDE8DE;
      --muted: #6B6860;
      --faint: #2a2a2a;
    }

    html { background: var(--black); scroll-behavior: smooth; }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--black);
      color: var(--text);
      line-height: 1.6;
      overflow-x: hidden;
    }

    /* ── Layout ── */
    .container { max-width: 860px; margin: 0 auto; padding: 0 24px; }

    /* ── Nav ── */
    nav {
      position: sticky;
      top: 0;
      z-index: 50;
      border-bottom: 1px solid var(--border);
      background: rgba(9,9,9,0.92);
      backdrop-filter: blur(12px);
    }
    .nav-inner {
      max-width: 860px;
      margin: 0 auto;
      padding: 0 24px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-logo {
      font-family: 'Syne', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
      text-decoration: none;
      letter-spacing: -0.01em;
    }
    .nav-logo span { color: var(--blue); }
    .nav-cta {
      font-family: 'Syne', sans-serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--black);
      background: var(--blue);
      padding: 8px 18px;
      text-decoration: none;
      transition: background 0.15s;
    }
    .nav-cta:hover { background: #0077dd; }

    /* ── Hero ── */
    .hero {
      padding: 100px 0 80px;
      border-bottom: 1px solid var(--border);
    }
    .hero-label {
      font-family: 'Syne', sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--blue);
      margin-bottom: 28px;
    }
    .hero-title {
      font-family: 'Syne', sans-serif;
      font-size: clamp(36px, 5vw, 58px);
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: var(--text);
      margin-bottom: 24px;
    }
    .hero-title em {
      font-style: normal;
      color: var(--blue);
    }
    .hero-sub {
      font-size: 17px;
      font-weight: 400;
      color: var(--muted);
      max-width: 520px;
      line-height: 1.65;
      margin-bottom: 48px;
    }
    .hero-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .pill {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 14px 22px;
      border: 1px solid var(--border);
      background: var(--surface);
    }
    .pill-value {
      font-family: 'Syne', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: var(--blue);
      letter-spacing: -0.02em;
    }
    .pill-label {
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--muted);
    }

    /* ── Section base ── */
    section { padding: 80px 0; border-bottom: 1px solid var(--border); }
    .section-label {
      font-family: 'Syne', sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--muted);
      margin-bottom: 20px;
    }
    .section-title {
      font-family: 'Syne', sans-serif;
      font-size: clamp(26px, 3.5vw, 36px);
      font-weight: 800;
      letter-spacing: -0.025em;
      color: var(--text);
      line-height: 1.1;
      margin-bottom: 16px;
    }
    .section-body {
      font-size: 15px;
      color: var(--muted);
      line-height: 1.7;
      max-width: 600px;
    }

    /* ── Problem ── */
    .compare-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      background: var(--border);
      margin-top: 48px;
      border: 1px solid var(--border);
    }
    .compare-cell {
      background: var(--surface);
      padding: 32px 28px;
    }
    .compare-cell.highlighted { background: var(--blue-dim); border: 1px solid var(--blue-border); }
    .compare-tag {
      font-family: 'Syne', sans-serif;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-bottom: 16px;
    }
    .compare-tag.bad { color: var(--muted); }
    .compare-tag.good { color: var(--blue); }
    .compare-number {
      font-family: 'Syne', sans-serif;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1;
      margin-bottom: 8px;
    }
    .compare-number.bad { color: var(--faint); text-decoration: line-through; text-decoration-color: #444; }
    .compare-number.good { color: var(--blue); }
    .compare-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }

    /* ── Approach ── */
    .approach-list { margin-top: 48px; display: flex; flex-direction: column; gap: 1px; }
    .approach-item {
      display: flex;
      gap: 24px;
      padding: 28px 0;
      border-bottom: 1px solid var(--border);
    }
    .approach-item:last-child { border-bottom: none; }
    .approach-num {
      font-family: 'Syne', sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: var(--blue);
      min-width: 24px;
      padding-top: 2px;
    }
    .approach-content h3 {
      font-family: 'Syne', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 6px;
      letter-spacing: -0.01em;
    }
    .approach-content p { font-size: 14px; color: var(--muted); line-height: 1.65; }

    /* ── Phases ── */
    .phase-grid { margin-top: 48px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }
    .phase-card {
      background: var(--surface);
      padding: 32px 24px;
    }
    .phase-num {
      font-family: 'Syne', sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--blue);
      margin-bottom: 16px;
    }
    .phase-title {
      font-family: 'Syne', sans-serif;
      font-size: 18px;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 10px;
      letter-spacing: -0.02em;
    }
    .phase-body { font-size: 13px; color: var(--muted); line-height: 1.6; }

    /* ── Narrative ── */
    .narrative-grid { margin-top: 48px; display: flex; flex-direction: column; gap: 1px; background: var(--border); border: 1px solid var(--border); }
    .narrative-row {
      display: grid;
      grid-template-columns: 48px 1fr;
      gap: 24px;
      background: var(--surface);
      padding: 28px 28px;
      align-items: start;
    }
    .narrative-num {
      font-family: 'Syne', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: var(--blue);
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .narrative-title {
      font-family: 'Syne', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 6px;
    }
    .narrative-body { font-size: 13px; color: var(--muted); line-height: 1.65; }

    /* ── Stats ── */
    .stats-grid { margin-top: 48px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }
    .stat-cell {
      background: var(--surface);
      padding: 36px 32px;
    }
    .stat-cell.accent { background: var(--blue-dim); border: 1px solid var(--blue-border); }
    .stat-value {
      font-family: 'Syne', sans-serif;
      font-size: 40px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1;
      color: var(--blue);
      margin-bottom: 8px;
    }
    .stat-label {
      font-size: 13px;
      color: var(--muted);
      line-height: 1.5;
    }

    /* ── Why SocialSculp ── */
    .services-row {
      margin-top: 40px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .service-tag {
      font-family: 'Syne', sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--muted);
      border: 1px solid var(--border);
      padding: 7px 14px;
    }

    /* ── CTA ── */
    .cta-section {
      padding: 100px 0;
      text-align: center;
    }
    .cta-label {
      font-family: 'Syne', sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--muted);
      margin-bottom: 24px;
    }
    .cta-title {
      font-family: 'Syne', sans-serif;
      font-size: clamp(28px, 4vw, 44px);
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text);
      margin-bottom: 16px;
      line-height: 1.05;
    }
    .cta-sub {
      font-size: 15px;
      color: var(--muted);
      margin-bottom: 44px;
    }
    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-family: 'Syne', sans-serif;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--black);
      background: var(--blue);
      padding: 16px 36px;
      text-decoration: none;
      transition: background 0.15s;
    }
    .cta-btn:hover { background: #0077dd; }
    .cta-btn svg { width: 14px; height: 14px; }

    /* ── Footer ── */
    footer {
      border-top: 1px solid var(--border);
      padding: 32px 0;
    }
    .footer-inner {
      max-width: 860px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-brand {
      font-family: 'Syne', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: var(--muted);
    }
    .footer-brand span { color: var(--blue); }
    .footer-note { font-size: 12px; color: var(--faint); }

    @media (max-width: 640px) {
      .compare-grid { grid-template-columns: 1fr; }
      .phase-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: 1fr; }
      .footer-inner { flex-direction: column; gap: 12px; text-align: center; }
    }
  </style>
</head>
<body>

<!-- Nav -->
<nav>
  <div class="nav-inner">
    <a href="https://socialsculp.io" class="nav-logo">SocialSculp<span>.</span></a>
    <a href="https://calendar.app.google/c6Ci7BweG3LXyMRQ6" class="nav-cta" target="_blank" rel="noopener">Book a Call</a>
  </div>
</nav>

<!-- Hero -->
<div class="hero">
  <div class="container">
    <p class="hero-label">Creator Seeding · Strategy Proposal · Plutus Gaming</p>
    <h1 class="hero-title">Your players are<br>already online.<br><em>We make them convert.</em></h1>
    <p class="hero-sub">Creator Seeding is a data-driven, AI-powered content strategy that turns your target audience into an acquisition engine — at a fraction of paid ad CPM.</p>
    <div class="hero-pills">
      <div class="pill">
        <span class="pill-value">$1–1.50</span>
        <span class="pill-label">CPM — not $15–30+</span>
      </div>
      <div class="pill">
        <span class="pill-value">3-Phase</span>
        <span class="pill-label">Conversion Playbook</span>
      </div>
      <div class="pill">
        <span class="pill-value">20+</span>
        <span class="pill-label">AI Agents Monitoring</span>
      </div>
      <div class="pill">
        <span class="pill-value">Live</span>
        <span class="pill-label">In-Campaign Optimization</span>
      </div>
    </div>
  </div>
</div>

<!-- Problem -->
<section>
  <div class="container">
    <p class="section-label">The Problem</p>
    <h2 class="section-title">Paid ads don't work<br>for gaming audiences.</h2>
    <p class="section-body">Gaming communities have the highest ad-blindness of any vertical. Traditional paid channels burn budget on CPMs that don't convert — because the creative looks like an ad. Native creator content doesn't.</p>
    <div class="compare-grid">
      <div class="compare-cell">
        <p class="compare-tag bad">Paid Ads</p>
        <p class="compare-number bad">$15–30+</p>
        <p class="compare-desc">CPM on Meta, TikTok Ads, YouTube pre-roll. High friction. Skippable. Ad-blind audiences tune it out.</p>
      </div>
      <div class="compare-cell highlighted">
        <p class="compare-tag good">Creator Seeding</p>
        <p class="compare-number good">$1–1.50</p>
        <p class="compare-desc">CPM through native creator content. Trusted voices. Embedded in the feed. Converts because it doesn't look like an ad.</p>
      </div>
    </div>
  </div>
</section>

<!-- Our Approach -->
<section>
  <div class="container">
    <p class="section-label">Our Approach</p>
    <h2 class="section-title">Data-powered.<br>Not guesswork.</h2>
    <p class="section-body">Every decision in our campaigns is backed by data from prior campaigns and monitored in real time by AI tooling. We don't set and forget.</p>
    <div class="approach-list">
      <div class="approach-item">
        <span class="approach-num">01</span>
        <div class="approach-content">
          <h3>Past Campaign Intelligence</h3>
          <p>We study what worked and what didn't across every campaign we've run — audience behaviour, content patterns, conversion triggers. That data shapes every brief we write for your creators.</p>
        </div>
      </div>
      <div class="approach-item">
        <span class="approach-num">02</span>
        <div class="approach-content">
          <h3>Live Optimization with AI Tooling</h3>
          <p>20+ AI agents monitor content performance in real time. We adjust distribution, messaging, and targeting while the campaign is still running — not in a post-mortem two weeks later.</p>
        </div>
      </div>
      <div class="approach-item">
        <span class="approach-num">03</span>
        <div class="approach-content">
          <h3>Test → Validate → Scale</h3>
          <p>We start small to prove what works, double down on winners, then scale spend only behind validated creative. No budget wasted proving a hypothesis that a smaller test already answered.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 3-Phase Playbook -->
<section>
  <div class="container">
    <p class="section-label">The Playbook</p>
    <h2 class="section-title">Three phases.<br>Same proven framework.</h2>
    <p class="section-body">Every campaign follows the same structure. Each phase gates the next — no spend scales until the previous phase proves the angle works.</p>
    <div class="phase-grid">
      <div class="phase-card">
        <p class="phase-num">Phase 01</p>
        <p class="phase-title">Test</p>
        <p class="phase-body">Deploy across 3–5 creators with different angles. Small spend. Identify what resonates — hook style, narrative, creator profile, platform.</p>
      </div>
      <div class="phase-card">
        <p class="phase-num">Phase 02</p>
        <p class="phase-title">Validate</p>
        <p class="phase-body">Cut what didn't work. Double spend behind the 1–2 angles with the strongest conversion signal. Confirm the hypothesis at 2× scale.</p>
      </div>
      <div class="phase-card">
        <p class="phase-num">Phase 03</p>
        <p class="phase-title">Scale</p>
        <p class="phase-body">Deploy the validated creative across the full creator network. CPM drops as reach compounds. Spend goes further the longer the campaign runs.</p>
      </div>
    </div>
  </div>
</section>

<!-- Narrative Strategy -->
<section>
  <div class="container">
    <p class="section-label">Narrative Strategy</p>
    <h2 class="section-title">The video that<br>shows the strategy.</h2>
    <p class="section-body">Three mechanics are embedded into every brief. This is the difference between content that gets views and content that converts.</p>
    <div class="narrative-grid">
      <div class="narrative-row">
        <div class="narrative-num">1</div>
        <div>
          <p class="narrative-title">Hook Engineering</p>
          <p class="narrative-body">The hook is built around the audience's pain-point — not the product's features. We engineer the angle first. The video opens on the viewer's problem, not Plutus. This is what makes them watch past 3 seconds.</p>
        </div>
      </div>
      <div class="narrative-row">
        <div class="narrative-num">2</div>
        <div>
          <p class="narrative-title">Conversion Mechanics</p>
          <p class="narrative-body">Urgency, social proof, and a clear next step are embedded into the structure of the content — not bolted on at the end. The CTA is earned, not forced. This is the difference between a brand video and one that drives installs.</p>
        </div>
      </div>
      <div class="narrative-row">
        <div class="narrative-num">3</div>
        <div>
          <p class="narrative-title">Audience Propagation</p>
          <p class="narrative-body">The same narrative angle is deployed across multiple creators who share your target demo — so the message compounds instead of duplicating. Reach scales. CPM drops. The audience sees the same hook from multiple trusted voices.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Numbers -->
<section>
  <div class="container">
    <p class="section-label">The Numbers</p>
    <h2 class="section-title">What you get.</h2>
    <div class="stats-grid">
      <div class="stat-cell accent">
        <p class="stat-value">$1–1.50</p>
        <p class="stat-label">CPM — versus $15–30+ for paid ads. Native content earns attention instead of renting it.</p>
      </div>
      <div class="stat-cell">
        <p class="stat-value">20+</p>
        <p class="stat-label">AI agents monitoring performance in real time — adjusting distribution while the campaign runs.</p>
      </div>
      <div class="stat-cell">
        <p class="stat-value">∞</p>
        <p class="stat-label">Creator network — sourced, matched, and briefed from our vetted roster or yours.</p>
      </div>
      <div class="stat-cell">
        <p class="stat-value">3×</p>
        <p class="stat-label">Phase playbook: Test → Validate → Scale. The same proven framework on every campaign.</p>
      </div>
    </div>
  </div>
</section>

<!-- Why SocialSculp -->
<section>
  <div class="container">
    <p class="section-label">Why SocialSculp</p>
    <h2 class="section-title">Built for performance.<br>Not impressions.</h2>
    <p class="section-body">SocialSculp is an influencer marketing agency built around one outcome: conversion. We don't optimise for reach vanity metrics — we optimise for what happens after the view. Every service we offer maps to acquisition.</p>
    <div class="services-row">
      <span class="service-tag">Creator Seeding</span>
      <span class="service-tag">Performance Marketing</span>
      <span class="service-tag">Creative Production</span>
      <span class="service-tag">Talent Management</span>
      <span class="service-tag">Social PR</span>
      <span class="service-tag">Campaign Analytics</span>
    </div>
  </div>
</section>

<!-- CTA -->
<div class="cta-section">
  <div class="container">
    <p class="cta-label">Next Step</p>
    <h2 class="cta-title">Ready to build<br>your acquisition engine?</h2>
    <p class="cta-sub">30 minutes. No pitch deck — just a strategy conversation about what would actually work for Plutus.</p>
    <a href="https://calendar.app.google/c6Ci7BweG3LXyMRQ6" class="cta-btn" target="_blank" rel="noopener">
      Book a Strategy Call
      <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>
  </div>
</div>

<!-- Footer -->
<footer>
  <div class="footer-inner">
    <span class="footer-brand">SocialSculp<span>.</span></span>
    <span class="footer-note">Confidential · Prepared for Plutus Gaming</span>
  </div>
</footer>

</body>
</html>
```

- [ ] **Step 2: Verify the file exists**

```bash
ls "C:\Users\Cal\Desktop\Root socialsculp\plutus.html"
```

Expected: file listed with non-zero size.

- [ ] **Step 3: Commit**

```bash
cd "C:\Users\Cal\Desktop\Root socialsculp"
git add plutus.html
git commit -m "feat: add plutus gaming creator seeding deck"
```

- [ ] **Step 4: Push landing site repo**

```bash
cd "C:\Users\Cal\Desktop\Root socialsculp"
git push
```

Vercel will auto-deploy. After deploy, `socialsculp.io/plutus` should serve the deck.

---

## Task 3: Create lib/decks.ts — static deck config

**Repo:** `C:\Users\Cal\socialsculp-dashboard\`

**Files:**
- Create: `lib/decks.ts`

- [ ] **Step 1: Create `lib/decks.ts`**

```ts
export interface DeckRecord {
  slug: string
  clientName: string
  publicUrl: string
  service: string
  status: 'live' | 'draft'
  createdAt: string // ISO date string e.g. "2026-03-21"
  notes?: string    // admin-reference only, not shown in UI
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

---

## Task 4: Update Sidebar — add Decks nav entry

**Repo:** `C:\Users\Cal\socialsculp-dashboard\`

**Files:**
- Modify: `components/layout/Sidebar.tsx`

Three changes required — all in the same file. The `ICON_MAP` is a closed object typed as `keyof typeof ICON_MAP`, so TypeScript will reject any icon key not present in both the import AND the map.

- [ ] **Step 1: Add `LayoutTemplate` to the lucide-react import**

Find the existing import block at the top of `Sidebar.tsx`:
```ts
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Handshake,
  Building2,
  BarChart3,
  Settings,
  User,
  FileText,
  ContactRound,
} from 'lucide-react'
```

Add `LayoutTemplate` to the list:
```ts
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Handshake,
  Building2,
  BarChart3,
  Settings,
  User,
  FileText,
  ContactRound,
  LayoutTemplate,
} from 'lucide-react'
```

- [ ] **Step 2: Add `LayoutTemplate` to `ICON_MAP`**

Find:
```ts
const ICON_MAP = {
  LayoutDashboard,
  Megaphone,
  Users,
  Handshake,
  Building2,
  BarChart3,
  Settings,
  User,
  FileText,
  ContactRound,
}
```

Add the entry:
```ts
const ICON_MAP = {
  LayoutDashboard,
  Megaphone,
  Users,
  Handshake,
  Building2,
  BarChart3,
  Settings,
  User,
  FileText,
  ContactRound,
  LayoutTemplate,
}
```

- [ ] **Step 3: Add Decks to the ADMIN nav array**

Find the `ADMIN` array in `ROLE_NAV`:
```ts
ADMIN: [
  { label: 'Overview', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Campaigns', href: '/admin/campaigns', icon: 'Megaphone' },
  { label: 'Creators', href: '/admin/creators', icon: 'Users' },
  { label: 'Deals', href: '/admin/deals', icon: 'Handshake' },
  { label: 'Brands', href: '/admin/brands', icon: 'Building2' },
  { label: 'CRM', href: '/admin/crm', icon: 'ContactRound' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
],
```

Add Decks after CRM:
```ts
ADMIN: [
  { label: 'Overview', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Campaigns', href: '/admin/campaigns', icon: 'Megaphone' },
  { label: 'Creators', href: '/admin/creators', icon: 'Users' },
  { label: 'Deals', href: '/admin/deals', icon: 'Handshake' },
  { label: 'Brands', href: '/admin/brands', icon: 'Building2' },
  { label: 'CRM', href: '/admin/crm', icon: 'ContactRound' },
  { label: 'Decks', href: '/admin/decks', icon: 'LayoutTemplate' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
],
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd "C:\Users\Cal\socialsculp-dashboard"
npx tsc --noEmit
```

Expected: no errors related to Sidebar or LayoutTemplate.

---

## Task 5: Create admin/decks page

**Repo:** `C:\Users\Cal\socialsculp-dashboard\`

**Files:**
- Create: `app/(dashboard)/admin/decks/page.tsx`

This is a synchronous server component — no `'use client'`, no `async`. It imports `DECKS` from `lib/decks.ts` and renders a table.

- [ ] **Step 1: Create `app/(dashboard)/admin/decks/page.tsx`**

```tsx
import { ExternalLink, Copy } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DECKS } from '@/lib/decks'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

export default function AdminDecksPage() {
  return (
    <div>
      <PageHeader title="Decks" description="Client sales and campaign decks" />

      <div className="p-6">
        <div className="bg-[#111111] border border-[#222222]">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.5fr_100px_120px_1fr_auto] gap-4 px-5 py-3 border-b border-[#222222]">
            {['Client', 'Service', 'Status', 'Created', 'URL', 'Actions'].map((h) => (
              <span key={h} className="text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860]">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {DECKS.length === 0 ? (
            <div className="px-5 py-12 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">
              No decks yet
            </div>
          ) : (
            DECKS.map((deck) => (
              <div
                key={deck.slug}
                className="grid grid-cols-[2fr_1.5fr_100px_120px_1fr_auto] gap-4 px-5 py-4 items-center border-b border-[#1A1A1A] last:border-b-0"
              >
                {/* Client */}
                <span className="text-sm font-syne font-bold text-[#EDE8DE] truncate">
                  {deck.clientName}
                </span>

                {/* Service */}
                <span className="text-xs font-syne text-[#6B6860] truncate">
                  {deck.service}
                </span>

                {/* Status */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest w-fit ${
                    deck.status === 'live'
                      ? 'bg-[#001a33] text-[#008cff] border border-[#003366]'
                      : 'bg-[#1A1A1A] text-[#6B6860] border border-[#222222]'
                  }`}
                >
                  {deck.status}
                </span>

                {/* Created */}
                <span className="text-xs font-syne text-[#6B6860]">
                  {formatDate(deck.createdAt)}
                </span>

                {/* URL */}
                <span className="text-xs font-syne text-[#6B6860] truncate">
                  {deck.publicUrl}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(deck.publicUrl)}
                    className="p-1.5 text-[#6B6860] hover:text-[#EDE8DE] transition-colors"
                    title="Copy URL"
                  >
                    <Copy size={13} />
                  </button>
                  <a
                    href={deck.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#6B6860] hover:text-[#008cff] transition-colors"
                    title="Open deck"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
```

> **Note:** The `Copy` button uses `onClick` (a client event), which means the file needs `'use client'` OR the copy button must be extracted into a small client component. Easiest fix: extract a `CopyButton` client component.

- [ ] **Step 2: Extract CopyButton into a client component**

The page itself stays a server component. Create `components/shared/CopyButton.tsx`:

```tsx
'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-[#6B6860] hover:text-[#EDE8DE] transition-colors"
      title="Copy URL"
    >
      {copied ? <Check size={13} className="text-[#008cff]" /> : <Copy size={13} />}
    </button>
  )
}
```

- [ ] **Step 3: Update decks page to use CopyButton**

Replace the inline `<button onClick=...>` in the page with:
```tsx
import { CopyButton } from '@/components/shared/CopyButton'
// ...
<CopyButton text={deck.publicUrl} />
```

And remove the `Copy` import from lucide-react in the page (keep `ExternalLink`).

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd "C:\Users\Cal\socialsculp-dashboard"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit dashboard changes**

```bash
cd "C:\Users\Cal\socialsculp-dashboard"
git add lib/decks.ts app/(dashboard)/admin/decks/page.tsx components/shared/CopyButton.tsx components/layout/Sidebar.tsx
git commit -m "feat: add admin Decks tab with Plutus Gaming deck entry"
```

- [ ] **Step 6: Push dashboard repo**

```bash
cd "C:\Users\Cal\socialsculp-dashboard"
git push
```

---

## Verification Checklist

After both deployments complete:

- [ ] `socialsculp.io/plutus` loads the deck (not the main landing page)
- [ ] `socialsculp.io` still loads normally (catch-all rewrite untouched)
- [ ] Admin dashboard sidebar shows "Decks" between CRM and Analytics
- [ ] `/admin/decks` renders the Plutus Gaming row with correct data
- [ ] Copy button copies `https://socialsculp.io/plutus` to clipboard
- [ ] "Open deck" button opens `socialsculp.io/plutus` in a new tab
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)
