/**
 * Seed Quizard × SocialSculp campaign with real analytics data.
 * Run with: DATABASE_URL=... npx tsx prisma/seed-quizard.ts
 *
 * Real campaign stats (Sep–Dec 2025):
 * - 3 batches of creator drops
 * - 14 total creator deals closed
 * - 45 creatives produced
 * - 16,300,000 estimated total views
 * - $1.22 avg CPM
 * - $19,950 total deal value
 *
 * Batch breakdown:
 *   Batch 1 (Sep 14–21): 13 creatives, 7M views, $8,050
 *   Batch 2 (Oct 12–27): 14 creatives, 1.2M views, $1,553
 *   Batch 3 (Dec 01):    18 creatives, 8.1M views, $9,860
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any)

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

// Build per-day views allocation across three batch spikes
function buildBatchedWeights(
  totalDays: number,
  batches: { startDay: number; durationDays: number; share: number }[]
): number[] {
  const raw = new Array(totalDays).fill(0.001) // baseline trickle

  for (const batch of batches) {
    for (let d = 0; d < batch.durationDays; d++) {
      const dayIdx = batch.startDay + d
      if (dayIdx >= totalDays) break
      // Spike: peak on day 0, taper over duration
      const t = d / batch.durationDays
      const batchW = batch.share * (1 - 0.7 * t) // linear taper within batch window
      raw[dayIdx] += batchW
    }
    // Add a 2-week long-tail after each batch
    const tailStart = batch.startDay + batch.durationDays
    for (let d = 0; d < 14; d++) {
      const dayIdx = tailStart + d
      if (dayIdx >= totalDays) break
      raw[dayIdx] += batch.share * 0.015 * Math.exp(-d * 0.15)
    }
  }

  const total = raw.reduce((a, b) => a + b, 0)
  return raw.map(w => w / total)
}

async function main() {
  console.log('🚀 Seeding Quizard × SocialSculp campaign…')

  // ── 1. Find admin user ──────────────────────────────────────────────────────
  const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found — run main seed first.')

  // ── 2. Create Quizard brand user + profile ──────────────────────────────────
  const brandUser = await db.user.upsert({
    where: { clerkId: 'seed_quizard_brand' },
    update: {},
    create: {
      clerkId: 'seed_quizard_brand',
      email: 'partnerships@quizard.ai',
      name: 'Quizard',
      role: 'BRAND',
    },
  })

  const brand = await db.brandProfile.upsert({
    where: { userId: brandUser.id },
    update: {},
    create: {
      userId: brandUser.id,
      companyName: 'Quizard',
      industry: 'EdTech / AI',
      website: 'https://quizard.ai',
    },
  })
  console.log(`  ✓ Brand: Quizard`)

  // ── 3. Create campaign ──────────────────────────────────────────────────────
  let campaign = await db.campaign.findFirst({
    where: { name: 'Quizard × SocialSculp' },
  })

  if (!campaign) {
    campaign = await db.campaign.create({
      data: {
        name: 'Quizard × SocialSculp',
        description:
          '14-creator TikTok & Instagram campaign for Quizard AI study app. ' +
          'Ran in 3 batches (Sep–Dec 2025). Delivered 16.3M views across 45 creatives at $1.22 CPM.',
        status: 'COMPLETED',
        platform: 'BOTH',
        contentTypes: ['TIKTOK_VIDEO', 'REEL'],
        totalBudget: 19_950,
        spentBudget: 19_463,
        startDate: new Date('2025-09-14'),
        endDate:   new Date('2025-12-15'),
        targetReach: 12_000_000,
        targetEngagement: 6.0,
        targetROAS: 3.2,
        brandId: brand.id,
        createdById: admin.id,
        tags: ['EdTech', 'AI', 'TikTok', 'Instagram', 'Quizard', 'Students'],
      },
    })
    console.log(`  ✓ Campaign created: ${campaign.name}`)
  } else {
    console.log(`  · Campaign already exists: ${campaign.name}`)
  }

  // ── 4. Daily analytics snapshots ───────────────────────────────────────────
  const START = new Date('2025-09-14')
  const END   = new Date('2025-12-15')
  const DAYS  = daysBetween(START, END) + 1 // ~93 days

  // Real totals
  const TOTAL_VIEWS    = 16_300_000
  const TOTAL_LIKES    =    814_000   // ~5% avg engagement
  const TOTAL_COMMENTS =     97_000   // ~0.6%
  const TOTAL_SPEND    =  19_463
  // Estimated revenue: ~3.2× ROAS → ~$62,282
  const TOTAL_REVENUE  = 62_282

  // Batch 1: day 0 (Sep 14) → 8 day window, 7M / 16.3M ≈ 43% of total
  // Batch 2: day 28 (Oct 12) → 16 day window, 1.2M / 16.3M ≈ 7% of total
  // Batch 3: day 78 (Dec 1)  → 15 day window, 8.1M / 16.3M ≈ 50% of total
  const weights = buildBatchedWeights(DAYS, [
    { startDay: 0,  durationDays: 8,  share: 0.430 },
    { startDay: 28, durationDays: 16, share: 0.074 },
    { startDay: 78, durationDays: 15, share: 0.496 },
  ])

  let created = 0
  let skipped = 0

  for (let i = 0; i < DAYS; i++) {
    const date = addDays(START, i)
    const w = weights[i]

    const dayViews    = Math.round(TOTAL_VIEWS    * w)
    const dayLikes    = Math.round(TOTAL_LIKES    * w)
    const dayComments = Math.round(TOTAL_COMMENTS * w)
    const daySpend    = parseFloat((TOTAL_SPEND * w).toFixed(2))
    const dayRevenue  = TOTAL_REVENUE * w

    const engRate = ((dayLikes + dayComments) / Math.max(dayViews, 1)) * 100

    // TikTok — ~65% of traffic (student audience skews TikTok)
    const ttViews    = Math.round(dayViews * 0.65)
    const ttLikes    = Math.round(dayLikes * 0.68)
    const ttComments = Math.round(dayComments * 0.65)
    const ttSpend    = parseFloat((daySpend * 0.65).toFixed(2))
    const ttClicks   = Math.round(ttViews * 0.032)
    const ttConvs    = Math.round(ttViews * 0.0038)
    const ttCPM      = ttSpend / Math.max(ttViews / 1000, 0.01)
    const ttCPC      = ttSpend / Math.max(ttClicks, 1)
    const ttROAS     = ttSpend > 0 ? (dayRevenue * 0.65) / ttSpend : 0

    try {
      await db.analyticsSnapshot.create({
        data: {
          campaignId:     campaign.id,
          date,
          platform:       'TIKTOK',
          impressions:    Math.round(ttViews * 1.40),
          reach:          ttViews,
          engagements:    ttLikes + ttComments,
          clicks:         ttClicks,
          conversions:    ttConvs,
          engagementRate: parseFloat((engRate * 1.10).toFixed(2)),
          cpm:            parseFloat(ttCPM.toFixed(2)),
          cpc:            parseFloat(ttCPC.toFixed(2)),
          roas:           parseFloat(ttROAS.toFixed(2)),
          spend:          ttSpend,
        },
      })
      created++
    } catch {
      skipped++
    }

    // Instagram — ~35% of traffic
    const igViews    = Math.round(dayViews * 0.35)
    const igLikes    = Math.round(dayLikes * 0.32)
    const igComments = Math.round(dayComments * 0.35)
    const igSpend    = parseFloat((daySpend * 0.35).toFixed(2))
    const igClicks   = Math.round(igViews * 0.020)
    const igConvs    = Math.round(igViews * 0.0022)
    const igCPM      = igSpend / Math.max(igViews / 1000, 0.01)
    const igCPC      = igSpend / Math.max(igClicks, 1)
    const igROAS     = igSpend > 0 ? (dayRevenue * 0.35) / igSpend : 0

    try {
      await db.analyticsSnapshot.create({
        data: {
          campaignId:     campaign.id,
          date,
          platform:       'INSTAGRAM',
          impressions:    Math.round(igViews * 1.22),
          reach:          igViews,
          engagements:    igLikes + igComments,
          clicks:         igClicks,
          conversions:    igConvs,
          engagementRate: parseFloat((engRate * 0.90).toFixed(2)),
          cpm:            parseFloat(igCPM.toFixed(2)),
          cpc:            parseFloat(igCPC.toFixed(2)),
          roas:           parseFloat(igROAS.toFixed(2)),
          spend:          igSpend,
        },
      })
      created++
    } catch {
      skipped++
    }
  }

  console.log(`  ✓ Analytics snapshots: ${created} created, ${skipped} skipped`)
  console.log(`\n✅ Quizard campaign seeded!`)
  console.log(`   Campaign ID: ${campaign.id}`)
  console.log(`   ${DAYS} days × 2 platforms = ${DAYS * 2} snapshots`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
