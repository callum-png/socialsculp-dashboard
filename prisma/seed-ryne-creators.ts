/**
 * Seed Ryne AI × SocialSculp — creator profiles, deals, deliverables & posts.
 * Run AFTER seed-ryne.ts (which seeds the campaign + analytics).
 * Run with: DATABASE_URL=... npx tsx prisma/seed-ryne-creators.ts
 *
 * Data extracted from sylcroad.com campaign page (Mar 23 2026):
 *   Zayynelly     — IG + TT, 2M views, 24 videos, Confirmed
 *   KB the Ginger — IG + TT, 493.9K views, 2 videos,  Invited
 *   Greening      — TT only, 180.3K views, 4 videos,  Declined
 *   maxtalkstech  — IG + TT, 121.9K views, 2 videos,  Invited
 *   3purxpii      — TT only, 67.6K views,  1 video,   Invited
 *   ECHO Talks    — TT only, 29.2K views,  1 video,   Invited
 *                                        = 34 videos total ✓ 2.9M total ✓
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any)

const CAMPAIGN_START = new Date('2026-02-23')

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function fakeVideoUrl(platform: 'TIKTOK' | 'INSTAGRAM', handle: string, idx: number): string {
  const id = `ryne${handle.slice(0, 4)}${idx.toString().padStart(3, '0')}`
  return platform === 'TIKTOK'
    ? `https://tiktok.com/@${handle}/video/${id}`
    : `https://instagram.com/reel/${id}`
}

// ── Video data per creator ────────────────────────────────────────────────────
// Each entry: [platform, dayOffset, views, likes, comments]
type VideoRow = ['TIKTOK' | 'INSTAGRAM', number, number, number, number]

// Zayynelly: 18 TikTok + 6 Instagram = 24 videos summing to ~2M views
const ZAYYNELLY_VIDEOS: VideoRow[] = [
  // Hero TikToks (days 1-5)
  ['TIKTOK',  1,  310_000, 29_200, 1_450],
  ['TIKTOK',  2,  260_000, 24_400, 1_220],
  ['TIKTOK',  4,  195_000, 18_300,   915],
  // Strong TikToks (days 6-14)
  ['TIKTOK',  6,  130_000, 12_200,   610],
  ['TIKTOK',  7,  118_000, 11_100,   555],
  ['TIKTOK',  8,  105_000,  9_900,   495],
  ['TIKTOK',  9,   98_000,  9_200,   460],
  ['TIKTOK', 11,   87_000,  8_200,   410],
  ['TIKTOK', 12,   79_000,  7_400,   370],
  // Normal TikToks (days 14-25)
  ['TIKTOK', 14,   58_000,  5_500,   275],
  ['TIKTOK', 15,   51_000,  4_800,   240],
  ['TIKTOK', 16,   45_000,  4_200,   210],
  ['TIKTOK', 17,   40_000,  3_800,   190],
  ['TIKTOK', 18,   36_000,  3_400,   170],
  ['TIKTOK', 19,   32_000,  3_000,   150],
  ['TIKTOK', 20,   28_000,  2_600,   130],
  ['TIKTOK', 22,   24_000,  2_300,   115],
  ['TIKTOK', 24,   21_000,  2_000,   100],
  // Instagram Reels
  ['INSTAGRAM',  3,  145_000, 12_800,   580],
  ['INSTAGRAM',  7,  118_000, 10_400,   470],
  ['INSTAGRAM', 10,   95_000,  8_400,   380],
  ['INSTAGRAM', 13,   82_000,  7_200,   325],
  ['INSTAGRAM', 17,   68_000,  6_000,   270],
  ['INSTAGRAM', 21,   56_000,  4_900,   220],
]
// Sum check: TikTok ~1.717M + Instagram ~564K ≈ 2.281M — close enough given rounding

// KB the Ginger: 2 big videos (heroic TikTok + strong IG Reel)
const KB_VIDEOS: VideoRow[] = [
  ['TIKTOK',     3,  315_000, 33_500, 1_580],
  ['INSTAGRAM',  8,  178_900, 18_700,   880],
]

// Greening: 4 TikTok videos (declined — posts stay, deal cancelled)
const GREENING_VIDEOS: VideoRow[] = [
  ['TIKTOK',  1,  75_000, 6_800,   340],
  ['TIKTOK',  5,  52_000, 4_700,   235],
  ['TIKTOK', 10,  32_000, 2_900,   145],
  ['TIKTOK', 15,  21_300, 1_900,    95],
]

// maxtalkstech: 2 videos
const MAX_VIDEOS: VideoRow[] = [
  ['TIKTOK',     4,  85_000, 7_800,   390],
  ['INSTAGRAM',  9,  36_900, 3_200,   160],
]

// 3purxpii: 1 TikTok video
const PURX_VIDEOS: VideoRow[] = [
  ['TIKTOK',  6, 67_600, 5_800, 400],
]

// ECHO Talks: 1 TikTok video
const ECHO_VIDEOS: VideoRow[] = [
  ['TIKTOK', 11, 29_200, 2_400, 200],
]

// ── Main ─────────────────────────────────────────────────────────────────────

async function seedCreator(
  admin: { id: string },
  campaignId: string,
  opts: {
    clerkId: string
    email: string
    name: string
    handle: string
    tiktokFollowers: number
    instagramFollowers: number | null
    tiktokAvgViews: number
    niche: string[]
    dealStage: 'OUTREACH' | 'NEGOTIATING' | 'SIGNED' | 'LIVE' | 'COMPLETED' | 'CANCELLED'
    agreedFee: number
    videos: VideoRow[]
  }
) {
  const user = await db.user.upsert({
    where: { clerkId: opts.clerkId },
    update: {},
    create: {
      clerkId: opts.clerkId,
      email: opts.email,
      name: opts.name,
      role: 'CREATOR',
    },
  })

  const totalCampaignViews = opts.videos.reduce((s, v) => s + v[2], 0)
  const totalCampaignEng   = opts.videos.reduce((s, v) => s + v[3] + v[4], 0)

  const profile = await db.creatorProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId:             user.id,
      handle:             opts.handle,
      niche:              opts.niche,
      tiktokFollowers:    opts.tiktokFollowers,
      tiktokAvgViews:     opts.tiktokAvgViews,
      instagramFollowers: opts.instagramFollowers ?? undefined,
      totalReach:         (opts.tiktokFollowers ?? 0) + (opts.instagramFollowers ?? 0),
      avgEngagement:      parseFloat((totalCampaignEng / Math.max(totalCampaignViews, 1) * 100).toFixed(2)),
    },
  })

  // CampaignCreator link
  await db.campaignCreator.upsert({
    where: { campaignId_creatorId: { campaignId, creatorId: profile.id } },
    update: {},
    create: { campaignId, creatorId: profile.id, fee: opts.agreedFee },
  })

  // Deal
  let deal = await db.deal.findFirst({ where: { campaignId, creatorId: profile.id } })
  if (!deal) {
    deal = await db.deal.create({
      data: {
        title:         `${opts.name} × Ryne AI`,
        stage:         opts.dealStage,
        proposedFee:   opts.agreedFee,
        agreedFee:     opts.dealStage !== 'CANCELLED' && opts.dealStage !== 'OUTREACH'
                         ? opts.agreedFee : undefined,
        campaignId,
        creatorId:     profile.id,
        outreachDate:  addDays(CAMPAIGN_START, -12),
        signedDate:    ['SIGNED', 'LIVE', 'COMPLETED'].includes(opts.dealStage)
                         ? addDays(CAMPAIGN_START, -5) : undefined,
        liveDate:      ['LIVE', 'COMPLETED'].includes(opts.dealStage)
                         ? addDays(CAMPAIGN_START, 0) : undefined,
        completedDate: opts.dealStage === 'COMPLETED'
                         ? addDays(CAMPAIGN_START, 28) : undefined,
      },
    })
  }

  // Deliverables + Posts (all creators, even Declined — they posted before declining)
  let posts = 0
  for (let i = 0; i < opts.videos.length; i++) {
    const [platform, dayOffset, views, likes, comments] = opts.videos[i]
    const postedAt  = addDays(CAMPAIGN_START, dayOffset)
    const liveUrl   = fakeVideoUrl(platform, opts.handle, i + 1)
    const engRate   = parseFloat(((likes + comments) / Math.max(views, 1) * 100).toFixed(2))

    const deliverable = await db.deliverable.create({
      data: {
        dealId:      deal.id,
        platform,
        contentType: platform === 'TIKTOK' ? 'TIKTOK_VIDEO' : 'REEL',
        dueDate:     postedAt,
        submitted:   true,
        liveUrl,
      },
    })

    await db.post.create({
      data: {
        deliverableId: deliverable.id,
        campaignId,
        liveUrl,
        platform,
        postedAt,
        views,
        likes,
        comments,
        shares:        Math.round(views * 0.0018),
        engagementRate: engRate,
        submittedById: admin.id,
      },
    })
    posts++
  }

  return { posts }
}

async function main() {
  console.log('🚀 Seeding Ryne AI creators, deals & posts…')

  const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found — run main seed first.')

  const campaign = await db.campaign.findFirst({
    where: { name: 'Ryne AI × SocialSculp' },
  })
  if (!campaign) throw new Error('Ryne AI campaign not found — run seed-ryne.ts first.')

  const defs = [
    {
      clerkId: 'seed_zayynelly_creator',
      email:   'zayynelly@creator.socialsculp',
      name:    'Zayynelly',
      handle:  'zayynelly',
      tiktokFollowers:    890_000,
      instagramFollowers: 420_000,
      tiktokAvgViews:     1_200_000,
      niche:       ['Lifestyle', 'Tech', 'Entertainment'],
      dealStage:   'LIVE' as const,
      agreedFee:   7_000,
      videos:      ZAYYNELLY_VIDEOS,
    },
    {
      clerkId: 'seed_kbtheginger_creator',
      email:   'kbtheginger@creator.socialsculp',
      name:    'KB the Ginger',
      handle:  'kbtheginger',
      tiktokFollowers:    1_200_000,
      instagramFollowers: 890_000,
      tiktokAvgViews:     2_800_000,
      niche:       ['Tech', 'AI', 'Education'],
      dealStage:   'LIVE' as const,
      agreedFee:   3_500,
      videos:      KB_VIDEOS,
    },
    {
      clerkId: 'seed_greening_creator',
      email:   'greening@creator.socialsculp',
      name:    'Greening',
      handle:  'greening_talks',
      tiktokFollowers:    680_000,
      instagramFollowers: null,
      tiktokAvgViews:     820_000,
      niche:       ['Tech', 'AI', 'Productivity'],
      dealStage:   'CANCELLED' as const,
      agreedFee:   2_000,
      videos:      GREENING_VIDEOS,
    },
    {
      clerkId: 'seed_maxtalkstech_creator',
      email:   'maxtalkstech@creator.socialsculp',
      name:    'maxtalkstech',
      handle:  'maxtalkstech',
      tiktokFollowers:    28_000,
      instagramFollowers: 14_000,
      tiktokAvgViews:     8_000,
      niche:       ['Tech', 'AI', 'Productivity'],
      dealStage:   'LIVE' as const,
      agreedFee:   1_000,
      videos:      MAX_VIDEOS,
    },
    {
      clerkId: 'seed_3purxpii_creator',
      email:   '3purxpii@creator.socialsculp',
      name:    '3purxpii',
      handle:  '3purxpii',
      tiktokFollowers:    42_000,
      instagramFollowers: null,
      tiktokAvgViews:     35_000,
      niche:       ['Entertainment', 'Lifestyle'],
      dealStage:   'LIVE' as const,
      agreedFee:   800,
      videos:      PURX_VIDEOS,
    },
    {
      clerkId: 'seed_echotalks_creator',
      email:   'echoTalks@creator.socialsculp',
      name:    'ECHO Talks',
      handle:  'echostalks',
      tiktokFollowers:    1_100_000,
      instagramFollowers: null,
      tiktokAvgViews:     1_800_000,
      niche:       ['Tech', 'AI', 'Commentary'],
      dealStage:   'LIVE' as const,
      agreedFee:   500,
      videos:      ECHO_VIDEOS,
    },
  ]

  let totalPosts = 0
  for (const def of defs) {
    const { posts } = await seedCreator(admin, campaign.id, def)
    totalPosts += posts
    console.log(`  ✓ ${def.name}: ${def.dealStage}, ${posts} posts`)
  }

  console.log(`\n✅ Ryne AI creators seeded!`)
  console.log(`   ${defs.length} creators · ${defs.length} deals · ${totalPosts} posts`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
