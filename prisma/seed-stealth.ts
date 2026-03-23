/**
 * Seed StealthGPT × SocialSculp campaign with real analytics data.
 * Run with: DATABASE_URL=... npx tsx prisma/seed-stealth.ts
 *
 * Real campaign stats:
 * - 36 creator videos (TikTok + Instagram)
 * - 7.4M total views
 * - 938.8K total likes
 * - 6K total comments
 * - 8.82% avg engagement rate
 * - Campaign period: Feb 5 – Mar 21 2026
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

// Generate a realistic daily weight curve: spike in first 2 weeks, taper off
function buildWeights(days: number): number[] {
  const raw: number[] = []
  for (let i = 0; i < days; i++) {
    if (i < 7) raw.push(3.0 - i * 0.1)          // spike week 1
    else if (i < 14) raw.push(2.3 - (i - 7) * 0.06) // strong week 2
    else if (i < 28) raw.push(1.7 - (i - 14) * 0.03) // gradual taper
    else raw.push(1.2 - (i - 28) * 0.02)          // plateau tail
  }
  const total = raw.reduce((a, b) => a + b, 0)
  return raw.map(w => w / total)
}

async function main() {
  console.log('🚀 Seeding StealthGPT × SocialSculp campaign…')

  // ── 1. Find admin user ──────────────────────────────────────────────────────
  const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found — run main seed first.')

  // ── 2. Create StealthGPT brand user + profile ───────────────────────────────
  const brandUser = await db.user.upsert({
    where: { clerkId: 'seed_stealthgpt_brand' },
    update: {},
    create: {
      clerkId: 'seed_stealthgpt_brand',
      email: 'hello@stealthgpt.ai',
      name: 'StealthGPT',
      role: 'BRAND',
    },
  })

  const brand = await db.brandProfile.upsert({
    where: { userId: brandUser.id },
    update: {},
    create: {
      userId: brandUser.id,
      companyName: 'StealthGPT',
      industry: 'AI / SaaS',
      website: 'https://stealthgpt.ai',
    },
  })
  console.log(`  ✓ Brand: StealthGPT`)

  // ── 3. Create campaign ──────────────────────────────────────────────────────
  let campaign = await db.campaign.findFirst({
    where: { name: 'StealthGPT × SocialSculp' },
  })

  if (!campaign) {
    campaign = await db.campaign.create({
      data: {
        name: 'StealthGPT × SocialSculp',
        description:
          '36-creator TikTok & Instagram campaign for StealthGPT AI writing assistant. ' +
          'Delivered 7.4M views, 938.8K likes, 8.82% avg engagement.',
        status: 'COMPLETED',
        platform: 'BOTH',
        contentTypes: ['TIKTOK_VIDEO', 'REEL'],
        totalBudget: 15_000,
        spentBudget: 14_200,
        startDate: new Date('2026-02-05'),
        endDate: new Date('2026-03-21'),
        targetReach: 5_000_000,
        targetEngagement: 8.0,
        targetROAS: 3.5,
        brandId: brand.id,
        createdById: admin.id,
        tags: ['AI', 'SaaS', 'TikTok', 'Instagram', 'StealthGPT'],
      },
    })
    console.log(`  ✓ Campaign created: ${campaign.name}`)
  } else {
    console.log(`  · Campaign already exists: ${campaign.name}`)
  }

  // ── 4. Daily analytics snapshots ───────────────────────────────────────────
  const START = new Date('2026-02-05')
  const END   = new Date('2026-03-21')
  const DAYS  = Math.round((END.getTime() - START.getTime()) / 86_400_000) + 1 // 45

  // Real totals from campaign
  const TOTAL_VIEWS    = 7_400_000
  const TOTAL_LIKES    = 938_800
  const TOTAL_COMMENTS = 6_000
  const TOTAL_SPEND    = 14_200
  // Estimated revenue: ~3.8× ROAS → ~$53,960
  const TOTAL_REVENUE  = 53_960

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

    // TikTok — ~60% of traffic
    const ttViews    = Math.round(dayViews * 0.60)
    const ttLikes    = Math.round(dayLikes * 0.65)
    const ttComments = Math.round(dayComments * 0.62)
    const ttSpend    = parseFloat((daySpend * 0.60).toFixed(2))
    const ttClicks   = Math.round(ttViews * 0.028)
    const ttConvs    = Math.round(ttViews * 0.0032)
    const ttCPM      = ttSpend / Math.max(ttViews / 1000, 0.01)
    const ttCPC      = ttSpend / Math.max(ttClicks, 1)
    const ttROAS     = ttSpend > 0 ? (dayRevenue * 0.60) / ttSpend : 0

    try {
      await db.analyticsSnapshot.create({
        data: {
          campaignId:    campaign.id,
          date,
          platform:      'TIKTOK',
          impressions:   Math.round(ttViews * 1.35),
          reach:         ttViews,
          engagements:   ttLikes + ttComments,
          clicks:        ttClicks,
          conversions:   ttConvs,
          engagementRate: parseFloat((engRate * 1.08).toFixed(2)),
          cpm:            parseFloat(ttCPM.toFixed(2)),
          cpc:            parseFloat(ttCPC.toFixed(2)),
          roas:           parseFloat(ttROAS.toFixed(2)),
          spend:          ttSpend,
        },
      })
      created++
    } catch {
      skipped++ // unique constraint — already exists
    }

    // Instagram — ~40% of traffic
    const igViews    = Math.round(dayViews * 0.40)
    const igLikes    = Math.round(dayLikes * 0.35)
    const igComments = Math.round(dayComments * 0.38)
    const igSpend    = parseFloat((daySpend * 0.40).toFixed(2))
    const igClicks   = Math.round(igViews * 0.019)
    const igConvs    = Math.round(igViews * 0.0021)
    const igCPM      = igSpend / Math.max(igViews / 1000, 0.01)
    const igCPC      = igSpend / Math.max(igClicks, 1)
    const igROAS     = igSpend > 0 ? (dayRevenue * 0.40) / igSpend : 0

    try {
      await db.analyticsSnapshot.create({
        data: {
          campaignId:    campaign.id,
          date,
          platform:      'INSTAGRAM',
          impressions:   Math.round(igViews * 1.25),
          reach:         igViews,
          engagements:   igLikes + igComments,
          clicks:        igClicks,
          conversions:   igConvs,
          engagementRate: parseFloat((engRate * 0.82).toFixed(2)),
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
  console.log(`\n✅ StealthGPT campaign seeded!`)
  console.log(`   Campaign ID: ${campaign.id}`)
  console.log(`   ${DAYS} days × 2 platforms = ${DAYS * 2} snapshots`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
