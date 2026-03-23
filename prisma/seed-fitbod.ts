/**
 * Seed Fitbod × SocialSculp campaign with real analytics data.
 * Run with: DATABASE_URL=... npx tsx prisma/seed-fitbod.ts
 *
 * Real campaign stats (Dec 2025):
 * - 2 creator deals closed
 * - 6 creatives produced
 * - 2,400,000 estimated views
 * - $5.00 CPM
 * - $12,300 total deal value
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

// Short 2-week campaign: spike early then taper
function buildWeights(days: number): number[] {
  const raw: number[] = []
  for (let i = 0; i < days; i++) {
    if (i < 3) raw.push(2.8 - i * 0.1)        // launch spike
    else if (i < 7) raw.push(2.4 - (i - 3) * 0.08) // strong first week
    else raw.push(1.8 - (i - 7) * 0.06)        // taper second week
  }
  const total = raw.reduce((a, b) => a + b, 0)
  return raw.map(w => w / total)
}

async function main() {
  console.log('🚀 Seeding Fitbod × SocialSculp campaign…')

  // ── 1. Find admin user ──────────────────────────────────────────────────────
  const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found — run main seed first.')

  // ── 2. Create Fitbod brand user + profile ───────────────────────────────────
  const brandUser = await db.user.upsert({
    where: { clerkId: 'seed_fitbod_brand' },
    update: {},
    create: {
      clerkId: 'seed_fitbod_brand',
      email: 'partnerships@fitbod.me',
      name: 'Fitbod',
      role: 'BRAND',
    },
  })

  const brand = await db.brandProfile.upsert({
    where: { userId: brandUser.id },
    update: {},
    create: {
      userId: brandUser.id,
      companyName: 'Fitbod',
      industry: 'Health & Fitness',
      website: 'https://fitbod.me',
    },
  })
  console.log(`  ✓ Brand: Fitbod`)

  // ── 3. Create campaign ──────────────────────────────────────────────────────
  let campaign = await db.campaign.findFirst({
    where: { name: 'Fitbod × SocialSculp' },
  })

  if (!campaign) {
    campaign = await db.campaign.create({
      data: {
        name: 'Fitbod × SocialSculp',
        description:
          '2-creator TikTok & Instagram campaign for Fitbod fitness app. ' +
          'Delivered 2.4M views across 6 creatives at $5.00 CPM.',
        status: 'COMPLETED',
        platform: 'BOTH',
        contentTypes: ['TIKTOK_VIDEO', 'REEL'],
        totalBudget: 12_300,
        spentBudget: 12_000,
        startDate: new Date('2025-12-08'),
        endDate:   new Date('2025-12-22'),
        targetReach: 2_000_000,
        targetEngagement: 5.0,
        targetROAS: 2.8,
        brandId: brand.id,
        createdById: admin.id,
        tags: ['Fitness', 'Health', 'TikTok', 'Instagram', 'Fitbod'],
      },
    })
    console.log(`  ✓ Campaign created: ${campaign.name}`)
  } else {
    console.log(`  · Campaign already exists: ${campaign.name}`)
  }

  // ── 4. Daily analytics snapshots ───────────────────────────────────────────
  const START = new Date('2025-12-08')
  const END   = new Date('2025-12-22')
  const DAYS  = Math.round((END.getTime() - START.getTime()) / 86_400_000) + 1 // 15

  // Real totals from campaign
  const TOTAL_VIEWS    = 2_400_000
  const TOTAL_LIKES    = 120_000   // ~5% engagement
  const TOTAL_COMMENTS =   7_200   // ~0.3%
  const TOTAL_SPEND    = 12_000
  // Estimated revenue: ~2.8× ROAS → ~$33,600
  const TOTAL_REVENUE  = 33_600

  const weights = buildWeights(DAYS)

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

    // TikTok — ~55% of traffic
    const ttViews    = Math.round(dayViews * 0.55)
    const ttLikes    = Math.round(dayLikes * 0.60)
    const ttComments = Math.round(dayComments * 0.58)
    const ttSpend    = parseFloat((daySpend * 0.55).toFixed(2))
    const ttClicks   = Math.round(ttViews * 0.022)
    const ttConvs    = Math.round(ttViews * 0.0028)
    const ttCPM      = ttSpend / Math.max(ttViews / 1000, 0.01)
    const ttCPC      = ttSpend / Math.max(ttClicks, 1)
    const ttROAS     = ttSpend > 0 ? (dayRevenue * 0.55) / ttSpend : 0

    try {
      await db.analyticsSnapshot.create({
        data: {
          campaignId:     campaign.id,
          date,
          platform:       'TIKTOK',
          impressions:    Math.round(ttViews * 1.30),
          reach:          ttViews,
          engagements:    ttLikes + ttComments,
          clicks:         ttClicks,
          conversions:    ttConvs,
          engagementRate: parseFloat((engRate * 1.12).toFixed(2)),
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

    // Instagram — ~45% of traffic
    const igViews    = Math.round(dayViews * 0.45)
    const igLikes    = Math.round(dayLikes * 0.40)
    const igComments = Math.round(dayComments * 0.42)
    const igSpend    = parseFloat((daySpend * 0.45).toFixed(2))
    const igClicks   = Math.round(igViews * 0.016)
    const igConvs    = Math.round(igViews * 0.0019)
    const igCPM      = igSpend / Math.max(igViews / 1000, 0.01)
    const igCPC      = igSpend / Math.max(igClicks, 1)
    const igROAS     = igSpend > 0 ? (dayRevenue * 0.45) / igSpend : 0

    try {
      await db.analyticsSnapshot.create({
        data: {
          campaignId:     campaign.id,
          date,
          platform:       'INSTAGRAM',
          impressions:    Math.round(igViews * 1.20),
          reach:          igViews,
          engagements:    igLikes + igComments,
          clicks:         igClicks,
          conversions:    igConvs,
          engagementRate: parseFloat((engRate * 0.88).toFixed(2)),
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
  console.log(`\n✅ Fitbod campaign seeded!`)
  console.log(`   Campaign ID: ${campaign.id}`)
  console.log(`   ${DAYS} days × 2 platforms = ${DAYS * 2} snapshots`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
