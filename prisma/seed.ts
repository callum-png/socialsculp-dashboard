/**
 * Seed the database with demo data matching the mock data set.
 *
 * Run with:  npx tsx prisma/seed.ts
 *
 * This is idempotent — it skips records that already exist (matched by handle / companyName).
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any)

// ─── Seed data ────────────────────────────────────────────────────────────────

const BRAND_SEED = [
  { companyName: 'Cal AI', industry: 'Technology', website: 'https://cal.ai' },
  { companyName: 'Alpha Lion', industry: 'Fitness', website: 'https://alphalion.com' },
  { companyName: 'Whop', industry: 'E-commerce', website: 'https://whop.com' },
  { companyName: 'Sweatcoin', industry: 'Health & Wellness', website: 'https://sweatco.in' },
  { companyName: 'PrizePicks', industry: 'Sports & Entertainment', website: 'https://prizepicks.com' },
]

const CREATOR_SEED = [
  { handle: '@ashtonhall', name: 'Ashton Hall', niche: ['Fitness', 'Lifestyle'], tiktokFollowers: 4_200_000, tiktokAvgViews: 850_000, tiktokEngRate: 6.2, instagramFollowers: 1_800_000, instagramAvgLikes: 45_000, instagramEngRate: 2.5, totalReach: 6_000_000, avgEngagement: 4.35, location: 'Los Angeles, CA' },
  { handle: '@chloewatts', name: 'Chloe Watts', niche: ['Fashion', 'Beauty'], tiktokFollowers: 2_100_000, tiktokAvgViews: 320_000, tiktokEngRate: 4.8, instagramFollowers: 890_000, instagramAvgLikes: 28_000, instagramEngRate: 3.1, totalReach: 2_990_000, avgEngagement: 3.95, location: 'New York, NY' },
  { handle: '@jakemontana', name: 'Jake Montana', niche: ['Gaming', 'Tech'], tiktokFollowers: 1_450_000, tiktokAvgViews: 280_000, tiktokEngRate: 5.4, instagramFollowers: 420_000, instagramAvgLikes: 12_000, instagramEngRate: 2.9, totalReach: 1_870_000, avgEngagement: 4.15, location: 'Austin, TX' },
  { handle: '@miasanchez', name: 'Mia Sanchez', niche: ['Food', 'Lifestyle'], tiktokFollowers: 890_000, tiktokAvgViews: 195_000, tiktokEngRate: 7.1, instagramFollowers: 540_000, instagramAvgLikes: 18_000, instagramEngRate: 3.3, totalReach: 1_430_000, avgEngagement: 5.2, location: 'Miami, FL' },
  { handle: '@liamfoster', name: 'Liam Foster', niche: ['Sports', 'Fitness'], tiktokFollowers: 3_100_000, tiktokAvgViews: 620_000, tiktokEngRate: 5.8, instagramFollowers: 1_200_000, instagramAvgLikes: 38_000, instagramEngRate: 3.2, totalReach: 4_300_000, avgEngagement: 4.5, location: 'London, UK' },
  { handle: '@emmawilliams', name: 'Emma Williams', niche: ['Beauty', 'Fashion'], tiktokFollowers: 760_000, tiktokAvgViews: 142_000, tiktokEngRate: 4.2, instagramFollowers: 680_000, instagramAvgLikes: 22_000, instagramEngRate: 3.2, totalReach: 1_440_000, avgEngagement: 3.7, location: 'London, UK' },
  { handle: '@ryanchen', name: 'Ryan Chen', niche: ['Tech', 'Finance'], tiktokFollowers: 520_000, tiktokAvgViews: 98_000, tiktokEngRate: 3.9, instagramFollowers: 290_000, instagramAvgLikes: 8_500, instagramEngRate: 2.9, totalReach: 810_000, avgEngagement: 3.4, location: 'San Francisco, CA' },
  { handle: '@sophiabrook', name: 'Sophia Brook', niche: ['Travel', 'Lifestyle'], tiktokFollowers: 1_800_000, tiktokAvgViews: 380_000, tiktokEngRate: 6.5, instagramFollowers: 2_100_000, instagramAvgLikes: 65_000, instagramEngRate: 3.1, totalReach: 3_900_000, avgEngagement: 4.8, location: 'Dubai, UAE' },
  { handle: '@marcusking', name: 'Marcus King', niche: ['Entertainment', 'Comedy'], tiktokFollowers: 5_200_000, tiktokAvgViews: 1_200_000, tiktokEngRate: 8.2, instagramFollowers: 980_000, instagramAvgLikes: 32_000, instagramEngRate: 3.3, totalReach: 6_180_000, avgEngagement: 5.75, location: 'Atlanta, GA' },
  { handle: '@isabellaross', name: 'Isabella Ross', niche: ['Fashion', 'Travel'], tiktokFollowers: 950_000, tiktokAvgViews: 185_000, tiktokEngRate: 4.6, instagramFollowers: 1_450_000, instagramAvgLikes: 48_000, instagramEngRate: 3.3, totalReach: 2_400_000, avgEngagement: 3.95, location: 'Paris, France' },
]

const CAMPAIGN_SEED = [
  { brandName: 'Cal AI', name: 'Cal AI — Q1 Growth Push', status: 'ACTIVE' as const, platform: 'BOTH' as const, contentTypes: ['TIKTOK_VIDEO', 'REEL'] as const, totalBudget: 85_000, spentBudget: 52_000, targetROAS: 4.0, description: 'Drive app installs and paid upgrades for Cal AI calorie tracking app via TikTok and Instagram.' },
  { brandName: 'Alpha Lion', name: 'Alpha Lion — Pre-Workout Launch', status: 'ACTIVE' as const, platform: 'TIKTOK' as const, contentTypes: ['TIKTOK_VIDEO'] as const, totalBudget: 120_000, spentBudget: 78_000, targetROAS: 5.5, description: 'Launch campaign for new SUPERHUMAN pre-workout formula targeting fitness creators.' },
  { brandName: 'Whop', name: 'Whop — Creator Economy Series', status: 'COMPLETED' as const, platform: 'BOTH' as const, contentTypes: ['TIKTOK_VIDEO', 'REEL', 'STORY'] as const, totalBudget: 65_000, spentBudget: 65_000, targetROAS: 3.5, description: 'Series of 12 creator features highlighting Whop marketplace success stories.' },
  { brandName: 'Sweatcoin', name: 'Sweatcoin — Summer Challenge', status: 'ACTIVE' as const, platform: 'INSTAGRAM' as const, contentTypes: ['REEL', 'STORY'] as const, totalBudget: 45_000, spentBudget: 28_000, targetROAS: 3.0, description: '8-week step challenge campaign across fitness and lifestyle creators.' },
  { brandName: 'PrizePicks', name: 'PrizePicks — NFL Season Opener', status: 'COMPLETED' as const, platform: 'TIKTOK' as const, contentTypes: ['TIKTOK_VIDEO'] as const, totalBudget: 200_000, spentBudget: 200_000, targetROAS: 6.0, description: 'Massive NFL season opener push with sports creators.' },
  { brandName: 'Cal AI', name: 'Cal AI — Retention Campaign', status: 'DRAFT' as const, platform: 'INSTAGRAM' as const, contentTypes: ['REEL', 'CAROUSEL'] as const, totalBudget: 40_000, spentBudget: 0, targetROAS: 3.5, description: 'Re-engagement campaign targeting lapsed users with lifestyle creators.' },
  { brandName: 'Alpha Lion', name: 'Alpha Lion — BCAA Series', status: 'PAUSED' as const, platform: 'BOTH' as const, contentTypes: ['TIKTOK_VIDEO', 'REEL'] as const, totalBudget: 75_000, spentBudget: 22_000, targetROAS: 4.5, description: 'Multi-creator BCAA product series, paused pending new packaging.' },
]

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database…')

  // ── 1. Admin user ──────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'callum@socialsculp.io'
  const adminClerkId = process.env.SEED_ADMIN_CLERK_ID ?? 'seed_admin_placeholder'

  let adminUser = await db.user.findUnique({ where: { email: adminEmail } })
  if (!adminUser) {
    adminUser = await db.user.create({
      data: {
        clerkId: adminClerkId,
        email: adminEmail,
        name: 'Callum',
        role: 'ADMIN',
      },
    })
    console.log(`  ✓ Admin user: ${adminEmail}`)
  } else {
    console.log(`  · Admin user already exists: ${adminEmail}`)
  }

  // ── 2. Brands ──────────────────────────────────────────────────────────────
  const brandMap: Record<string, string> = {}

  for (const b of BRAND_SEED) {
    let brand = await db.brandProfile.findFirst({ where: { companyName: b.companyName } })
    if (!brand) {
      // Create a placeholder user for the brand
      const brandUser = await db.user.create({
        data: {
          clerkId: `seed_brand_${b.companyName.toLowerCase().replace(/\s/g, '_')}`,
          email: `${b.companyName.toLowerCase().replace(/\s/g, '')}@demo.socialsculp.io`,
          name: b.companyName,
          role: 'BRAND',
        },
      })
      brand = await db.brandProfile.create({
        data: {
          userId: brandUser.id,
          companyName: b.companyName,
          industry: b.industry,
          website: b.website,
        },
      })
      console.log(`  ✓ Brand: ${b.companyName}`)
    } else {
      console.log(`  · Brand already exists: ${b.companyName}`)
    }
    brandMap[b.companyName] = brand.id
  }

  // ── 3. Creators ────────────────────────────────────────────────────────────
  const creatorMap: Record<string, string> = {}

  for (const c of CREATOR_SEED) {
    let creator = await db.creatorProfile.findUnique({ where: { handle: c.handle } })
    if (!creator) {
      const creatorUser = await db.user.create({
        data: {
          clerkId: `seed_creator_${c.handle.replace('@', '')}`,
          email: `${c.handle.replace('@', '')}@demo.socialsculp.io`,
          name: c.name,
          role: 'CREATOR',
        },
      })
      creator = await db.creatorProfile.create({
        data: {
          userId: creatorUser.id,
          handle: c.handle,
          niche: c.niche,
          location: c.location,
          tiktokFollowers: c.tiktokFollowers,
          tiktokAvgViews: c.tiktokAvgViews,
          tiktokEngRate: c.tiktokEngRate,
          instagramFollowers: c.instagramFollowers,
          instagramAvgLikes: c.instagramAvgLikes,
          instagramEngRate: c.instagramEngRate,
          totalReach: c.totalReach,
          avgEngagement: c.avgEngagement,
        },
      })
      console.log(`  ✓ Creator: ${c.handle}`)
    } else {
      console.log(`  · Creator already exists: ${c.handle}`)
    }
    creatorMap[c.handle] = creator.id
  }

  // ── 4. Campaigns ───────────────────────────────────────────────────────────
  const campaignMap: Record<string, string> = {}

  for (const c of CAMPAIGN_SEED) {
    const brandId = brandMap[c.brandName]
    if (!brandId) continue

    let campaign = await db.campaign.findFirst({ where: { name: c.name } })
    if (!campaign) {
      campaign = await db.campaign.create({
        data: {
          name: c.name,
          description: c.description,
          status: c.status,
          platform: c.platform,
          contentTypes: [...c.contentTypes],
          totalBudget: c.totalBudget,
          spentBudget: c.spentBudget,
          targetROAS: c.targetROAS,
          brandId,
          createdById: adminUser.id,
        },
      })
      console.log(`  ✓ Campaign: ${c.name}`)
    } else {
      console.log(`  · Campaign already exists: ${c.name}`)
    }
    campaignMap[c.name] = campaign.id
  }

  // ── 5. Deals ───────────────────────────────────────────────────────────────
  const dealDefs = [
    { handle: '@ashtonhall', campaign: 'Cal AI — Q1 Growth Push', stage: 'LIVE' as const, agreedFee: 12000 },
    { handle: '@liamfoster', campaign: 'Alpha Lion — Pre-Workout Launch', stage: 'LIVE' as const, agreedFee: 18500 },
    { handle: '@chloewatts', campaign: 'Sweatcoin — Summer Challenge', stage: 'NEGOTIATING' as const, proposedFee: 8000 },
    { handle: '@marcusking', campaign: 'PrizePicks — NFL Season Opener', stage: 'COMPLETED' as const, agreedFee: 25000 },
    { handle: '@sophiabrook', campaign: 'Whop — Creator Economy Series', stage: 'COMPLETED' as const, agreedFee: 9500 },
    { handle: '@jakemontana', campaign: 'Cal AI — Q1 Growth Push', stage: 'SIGNED' as const, agreedFee: 9500 },
    { handle: '@miasanchez', campaign: 'Alpha Lion — Pre-Workout Launch', stage: 'NEGOTIATING' as const, proposedFee: 14000 },
    { handle: '@emmawilliams', campaign: 'Cal AI — Q1 Growth Push', stage: 'OUTREACH' as const, proposedFee: 6500 },
  ]

  for (const def of dealDefs) {
    const creatorId = creatorMap[def.handle]
    const campaignId = campaignMap[def.campaign]
    if (!creatorId || !campaignId) continue

    const existing = await db.deal.findFirst({
      where: { creatorId, campaignId },
    })

    if (!existing) {
      await db.deal.create({
        data: {
          title: `${def.handle} × ${def.campaign.split('—')[0].trim()}`,
          stage: def.stage,
          creatorId,
          campaignId,
          agreedFee: 'agreedFee' in def ? def.agreedFee : null,
          proposedFee: 'proposedFee' in def ? def.proposedFee : null,
          outreachDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          ...(def.stage !== 'OUTREACH' && def.stage !== 'NEGOTIATING' && {
            signedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          }),
          ...(def.stage === 'LIVE' && {
            liveDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          }),
          ...(def.stage === 'COMPLETED' && {
            liveDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          }),
        },
      })
      console.log(`  ✓ Deal: ${def.handle} × ${def.campaign.split('—')[0].trim()} [${def.stage}]`)
    } else {
      console.log(`  · Deal already exists: ${def.handle} × ${def.campaign.split('—')[0].trim()}`)
    }
  }

  console.log('\n✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
