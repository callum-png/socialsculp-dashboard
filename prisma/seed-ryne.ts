/**
 * Seed Ryne AI × SocialSculp campaign with real analytics data.
 * Run with: DATABASE_URL=... npx tsx prisma/seed-ryne.ts
 *
 * Real campaign stats (Feb–Mar 2026):
 * - 6 creators (Zayynelly, 3purxpii, Greening, KB the Ginger, ECHO Talks, maxtalkstech)
 * - 34 videos tracked (TikTok + Instagram)
 * - 2,900,000 total views
 * - 266,800 total likes
 * - 2,700 total comments
 * - 9.28% avg engagement rate
 * - Campaign period: Feb 23 – Mar 21 2026, status: ACTIVE
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

// Organic growth curve: builds slowly then accelerates mid-campaign
// Reflects real viral content behavior — a few hero videos skew heavily
function buildWeights(days: number): number[] {
  const raw: number[] = []
  for (let i = 0; i < days; i++) {
    if (i < 5)  raw.push(1.2 + i * 0.05)        // slow ramp
    else if (i < 10) raw.push(1.5 + (i - 5) * 0.15) // building
    else if (i < 18) raw.push(2.3 - (i - 10) * 0.06) // peak window
    else raw.push(1.8 - (i - 18) * 0.04)          // steady tail
  }
  const total = raw.reduce((a, b) => a + b, 0)
  return raw.map(w => w / total)
}

async function main() {
  console.log('🚀 Seeding Ryne AI × SocialSculp campaign…')

  // ── 1. Find admin user ──────────────────────────────────────────────────────
  const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found — run main seed first.')

  // ── 2. Create Ryne AI brand user + profile ──────────────────────────────────
  const brandUser = await db.user.upsert({
    where: { clerkId: 'seed_ryneai_brand' },
    update: {},
    create: {
      clerkId: 'seed_ryneai_brand',
      email: 'partnerships@ryne.ai',
      name: 'Ryne AI',
      role: 'BRAND',
    },
  })

  const brand = await db.brandProfile.upsert({
    where: { userId: brandUser.id },
    update: {},
    create: {
      userId: brandUser.id,
      companyName: 'Ryne AI',
      industry: 'AI / EdTech',
      website: 'https://ryne.ai',
    },
  })
  console.log(`  ✓ Brand: Ryne AI`)

  // ── 3. Create campaign ──────────────────────────────────────────────────────
  let campaign = await db.campaign.findFirst({
    where: { name: 'Ryne AI × SocialSculp' },
  })

  if (!campaign) {
    campaign = await db.campaign.create({
      data: {
        name: 'Ryne AI × SocialSculp',
        description:
          '6-creator TikTok & Instagram campaign for Ryne AI. ' +
          '34 videos delivering 2.9M views at 9.28% avg engagement.',
        status: 'ACTIVE',
        platform: 'BOTH',
        contentTypes: ['TIKTOK_VIDEO', 'REEL'],
        totalBudget: 18_000,
        spentBudget: 14_800,
        startDate: new Date('2026-02-23'),
        endDate:   new Date('2026-04-15'),
        targetReach: 3_000_000,
        targetEngagement: 8.5,
        targetROAS: 3.0,
        brandId: brand.id,
        createdById: admin.id,
        tags: ['AI', 'EdTech', 'TikTok', 'Instagram', 'RyneAI'],
      },
    })
    console.log(`  ✓ Campaign created: ${campaign.name}`)
  } else {
    console.log(`  · Campaign already exists: ${campaign.name}`)
  }

  // ── 4. Daily analytics snapshots ───────────────────────────────────────────
  // Seed up to today (Mar 23 2026) — 29 days into campaign
  const START = new Date('2026-02-23')
  const END   = new Date('2026-03-23') // today
  const DAYS  = Math.round((END.getTime() - START.getTime()) / 86_400_000) + 1 // 29

  // Real totals as of Mar 21 (chart cutoff) — close to current
  const TOTAL_VIEWS    = 2_900_000
  const TOTAL_LIKES    =   266_800
  const TOTAL_COMMENTS =     2_700
  const TOTAL_SPEND    =  14_800
  // Estimated revenue: ~3.0× ROAS → ~$44,400
  const TOTAL_REVENUE  = 44_400

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

    // TikTok — ~58% of traffic (matches Greening/KB hero TT videos)
    const ttViews    = Math.round(dayViews * 0.58)
    const ttLikes    = Math.round(dayLikes * 0.62)
    const ttComments = Math.round(dayComments * 0.60)
    const ttSpend    = parseFloat((daySpend * 0.58).toFixed(2))
    const ttClicks   = Math.round(ttViews * 0.030)
    const ttConvs    = Math.round(ttViews * 0.0035)
    const ttCPM      = ttSpend / Math.max(ttViews / 1000, 0.01)
    const ttCPC      = ttSpend / Math.max(ttClicks, 1)
    const ttROAS     = ttSpend > 0 ? (dayRevenue * 0.58) / ttSpend : 0

    try {
      await db.analyticsSnapshot.create({
        data: {
          campaignId:     campaign.id,
          date,
          platform:       'TIKTOK',
          impressions:    Math.round(ttViews * 1.38),
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

    // Instagram — ~42% of traffic
    const igViews    = Math.round(dayViews * 0.42)
    const igLikes    = Math.round(dayLikes * 0.38)
    const igComments = Math.round(dayComments * 0.40)
    const igSpend    = parseFloat((daySpend * 0.42).toFixed(2))
    const igClicks   = Math.round(igViews * 0.021)
    const igConvs    = Math.round(igViews * 0.0022)
    const igCPM      = igSpend / Math.max(igViews / 1000, 0.01)
    const igCPC      = igSpend / Math.max(igClicks, 1)
    const igROAS     = igSpend > 0 ? (dayRevenue * 0.42) / igSpend : 0

    try {
      await db.analyticsSnapshot.create({
        data: {
          campaignId:     campaign.id,
          date,
          platform:       'INSTAGRAM',
          impressions:    Math.round(igViews * 1.24),
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
  console.log(`\n✅ Ryne AI campaign seeded!`)
  console.log(`   Campaign ID: ${campaign.id}`)
  console.log(`   ${DAYS} days × 2 platforms = ${DAYS * 2} snapshots`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
