// ─── Mock Creators ────────────────────────────────────────────────────────────

export const MOCK_CREATORS = [
  {
    handle: '@ashtonhall',
    name: 'Ashton Hall',
    niche: ['Fitness', 'Lifestyle'],
    tiktokFollowers: 4_200_000,
    tiktokAvgViews: 850_000,
    tiktokEngRate: 6.2,
    instagramFollowers: 1_800_000,
    instagramAvgLikes: 45_000,
    instagramEngRate: 2.5,
    location: 'Los Angeles, CA',
  },
  {
    handle: '@chloewatts',
    name: 'Chloe Watts',
    niche: ['Fashion', 'Beauty'],
    tiktokFollowers: 2_100_000,
    tiktokAvgViews: 320_000,
    tiktokEngRate: 4.8,
    instagramFollowers: 890_000,
    instagramAvgLikes: 28_000,
    instagramEngRate: 3.1,
    location: 'New York, NY',
  },
  {
    handle: '@jakemontana',
    name: 'Jake Montana',
    niche: ['Gaming', 'Tech'],
    tiktokFollowers: 1_450_000,
    tiktokAvgViews: 280_000,
    tiktokEngRate: 5.4,
    instagramFollowers: 420_000,
    instagramAvgLikes: 12_000,
    instagramEngRate: 2.9,
    location: 'Austin, TX',
  },
  {
    handle: '@miasanchez',
    name: 'Mia Sanchez',
    niche: ['Food', 'Lifestyle'],
    tiktokFollowers: 890_000,
    tiktokAvgViews: 195_000,
    tiktokEngRate: 7.1,
    instagramFollowers: 540_000,
    instagramAvgLikes: 18_000,
    instagramEngRate: 3.3,
    location: 'Miami, FL',
  },
  {
    handle: '@liamfoster',
    name: 'Liam Foster',
    niche: ['Sports', 'Fitness'],
    tiktokFollowers: 3_100_000,
    tiktokAvgViews: 620_000,
    tiktokEngRate: 5.8,
    instagramFollowers: 1_200_000,
    instagramAvgLikes: 38_000,
    instagramEngRate: 3.2,
    location: 'London, UK',
  },
  {
    handle: '@emmawilliams',
    name: 'Emma Williams',
    niche: ['Beauty', 'Fashion'],
    tiktokFollowers: 760_000,
    tiktokAvgViews: 142_000,
    tiktokEngRate: 4.2,
    instagramFollowers: 680_000,
    instagramAvgLikes: 22_000,
    instagramEngRate: 3.2,
    location: 'London, UK',
  },
  {
    handle: '@ryanchen',
    name: 'Ryan Chen',
    niche: ['Tech', 'Finance'],
    tiktokFollowers: 520_000,
    tiktokAvgViews: 98_000,
    tiktokEngRate: 3.9,
    instagramFollowers: 290_000,
    instagramAvgLikes: 8_500,
    instagramEngRate: 2.9,
    location: 'San Francisco, CA',
  },
  {
    handle: '@sophiabrook',
    name: 'Sophia Brook',
    niche: ['Travel', 'Lifestyle'],
    tiktokFollowers: 1_800_000,
    tiktokAvgViews: 380_000,
    tiktokEngRate: 6.5,
    instagramFollowers: 2_100_000,
    instagramAvgLikes: 65_000,
    instagramEngRate: 3.1,
    location: 'Dubai, UAE',
  },
  {
    handle: '@marcusking',
    name: 'Marcus King',
    niche: ['Entertainment', 'Comedy'],
    tiktokFollowers: 5_200_000,
    tiktokAvgViews: 1_200_000,
    tiktokEngRate: 8.2,
    instagramFollowers: 980_000,
    instagramAvgLikes: 32_000,
    instagramEngRate: 3.3,
    location: 'Atlanta, GA',
  },
  {
    handle: '@isabellaross',
    name: 'Isabella Ross',
    niche: ['Fashion', 'Travel'],
    tiktokFollowers: 950_000,
    tiktokAvgViews: 185_000,
    tiktokEngRate: 4.6,
    instagramFollowers: 1_450_000,
    instagramAvgLikes: 48_000,
    instagramEngRate: 3.3,
    location: 'Paris, France',
  },
  {
    handle: '@danielpark',
    name: 'Daniel Park',
    niche: ['Gaming', 'Entertainment'],
    tiktokFollowers: 2_800_000,
    tiktokAvgViews: 560_000,
    tiktokEngRate: 6.8,
    instagramFollowers: 480_000,
    instagramAvgLikes: 15_000,
    instagramEngRate: 3.1,
    location: 'Seoul, South Korea',
  },
  {
    handle: '@avagrace',
    name: 'Ava Grace',
    niche: ['Fitness', 'Wellness'],
    tiktokFollowers: 680_000,
    tiktokAvgViews: 128_000,
    tiktokEngRate: 5.2,
    instagramFollowers: 820_000,
    instagramAvgLikes: 26_000,
    instagramEngRate: 3.2,
    location: 'Sydney, Australia',
  },
  {
    handle: '@noahbrent',
    name: 'Noah Brent',
    niche: ['Sports', 'Lifestyle'],
    tiktokFollowers: 1_200_000,
    tiktokAvgViews: 245_000,
    tiktokEngRate: 5.6,
    instagramFollowers: 390_000,
    instagramAvgLikes: 11_000,
    instagramEngRate: 2.8,
    location: 'Chicago, IL',
  },
  {
    handle: '@oliviamoon',
    name: 'Olivia Moon',
    niche: ['Beauty', 'Education'],
    tiktokFollowers: 440_000,
    tiktokAvgViews: 85_000,
    tiktokEngRate: 4.9,
    instagramFollowers: 560_000,
    instagramAvgLikes: 19_000,
    instagramEngRate: 3.4,
    location: 'Toronto, Canada',
  },
  {
    handle: '@ethanjames',
    name: 'Ethan James',
    niche: ['Finance', 'Tech'],
    tiktokFollowers: 320_000,
    tiktokAvgViews: 62_000,
    tiktokEngRate: 4.1,
    instagramFollowers: 185_000,
    instagramAvgLikes: 5_800,
    instagramEngRate: 3.1,
    location: 'New York, NY',
  },
] as const

// ─── Mock Brands ──────────────────────────────────────────────────────────────

export const MOCK_BRANDS = [
  {
    companyName: 'Cal AI',
    industry: 'Technology',
    website: 'https://cal.ai',
  },
  {
    companyName: 'Alpha Lion',
    industry: 'Fitness',
    website: 'https://alphalion.com',
  },
  {
    companyName: 'Whop',
    industry: 'E-commerce',
    website: 'https://whop.com',
  },
  {
    companyName: 'Sweatcoin',
    industry: 'Health & Wellness',
    website: 'https://sweatco.in',
  },
  {
    companyName: 'PrizePicks',
    industry: 'Sports & Entertainment',
    website: 'https://prizepicks.com',
  },
] as const

// ─── Mock Campaigns ───────────────────────────────────────────────────────────

export const MOCK_CAMPAIGNS = [
  {
    name: 'Cal AI — Q1 Growth Push',
    brandIndex: 0,
    status: 'ACTIVE',
    platform: 'BOTH',
    totalBudget: 85_000,
    spentBudget: 52_000,
    targetROAS: 4.0,
    description:
      'Drive app installs and paid upgrades for Cal AI calorie tracking app via TikTok and Instagram.',
  },
  {
    name: 'Alpha Lion — Pre-Workout Launch',
    brandIndex: 1,
    status: 'ACTIVE',
    platform: 'TIKTOK',
    totalBudget: 120_000,
    spentBudget: 78_000,
    targetROAS: 5.5,
    description:
      'Launch campaign for new SUPERHUMAN pre-workout formula targeting fitness creators.',
  },
  {
    name: 'Whop — Creator Economy Series',
    brandIndex: 2,
    status: 'COMPLETED',
    platform: 'BOTH',
    totalBudget: 65_000,
    spentBudget: 65_000,
    targetROAS: 3.5,
    description:
      'Series of 12 creator features highlighting Whop marketplace success stories.',
  },
  {
    name: 'Sweatcoin — Summer Challenge',
    brandIndex: 3,
    status: 'ACTIVE',
    platform: 'INSTAGRAM',
    totalBudget: 45_000,
    spentBudget: 28_000,
    targetROAS: 3.0,
    description:
      '8-week step challenge campaign across fitness and lifestyle creators.',
  },
  {
    name: 'PrizePicks — NFL Season Opener',
    brandIndex: 4,
    status: 'COMPLETED',
    platform: 'TIKTOK',
    totalBudget: 200_000,
    spentBudget: 200_000,
    targetROAS: 6.0,
    description: 'Massive NFL season opener push with sports creators.',
  },
  {
    name: 'Cal AI — Retention Campaign',
    brandIndex: 0,
    status: 'DRAFT',
    platform: 'INSTAGRAM',
    totalBudget: 40_000,
    spentBudget: 0,
    targetROAS: 3.5,
    description:
      'Re-engagement campaign targeting lapsed users with lifestyle creators.',
  },
  {
    name: 'Alpha Lion — BCAA Series',
    brandIndex: 1,
    status: 'PAUSED',
    platform: 'BOTH',
    totalBudget: 75_000,
    spentBudget: 22_000,
    targetROAS: 4.5,
    description:
      'Multi-creator BCAA product series, paused pending new packaging.',
  },
  {
    name: 'Sweatcoin — New Year Push',
    brandIndex: 3,
    status: 'DRAFT',
    platform: 'BOTH',
    totalBudget: 55_000,
    spentBudget: 0,
    targetROAS: 3.8,
    description: 'January resolution campaign for Q1.',
  },
] as const

// ─── Analytics Data Generator ─────────────────────────────────────────────────

/**
 * Seeded pseudo-random number generator (LCG) for reproducible mock data.
 * Using the campaign ID as a seed ensures the same campaign always gets
 * the same data shape, while different campaigns get different shapes.
 */
function seededRandom(seed: string) {
  let s = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return ((s >>> 0) / 0xffffffff)
  }
}

/**
 * Returns an array of daily analytics snapshots for a campaign.
 * All metrics are realistic:
 *   - ROAS: 2–7
 *   - CPM: $4–$18
 *   - Engagement rate: 2–8%
 */
export function generateAnalyticsData(
  campaignId: string,
  days: number = 90,
) {
  const rand = seededRandom(campaignId)

  // Campaign "character" — pick base values once so the campaign feels consistent
  const baseROAS = 2 + rand() * 5              // 2–7
  const baseCPM = 4 + rand() * 14              // 4–18
  const baseEngRate = 2 + rand() * 6           // 2–8
  const baseDailyBudget = 500 + rand() * 2000  // $500–$2,500/day
  const baseImpressions = Math.round(baseDailyBudget / (baseCPM / 1000))

  const snapshots: any[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    // Add day-to-day variance (±15%)
    const variance = () => 0.85 + rand() * 0.3

    const spend = parseFloat((baseDailyBudget * variance()).toFixed(2))
    const cpm = parseFloat((baseCPM * variance()).toFixed(2))
    const impressions = Math.round(spend / (cpm / 1000))
    const reach = Math.round(impressions * (0.6 + rand() * 0.25))
    const engagementRate = parseFloat((baseEngRate * variance()).toFixed(2))
    const engagements = Math.round(reach * (engagementRate / 100))
    const cpc = parseFloat((cpm * (2 + rand() * 3) / 100).toFixed(2))
    const clicks = Math.round(spend / cpc)
    const conversions = Math.round(clicks * (0.02 + rand() * 0.06))
    const roas = parseFloat((baseROAS * variance()).toFixed(2))

    snapshots.push({
      campaignId,
      date: date.toISOString(),
      platform: 'BOTH' as const,
      impressions,
      reach,
      engagements,
      clicks,
      conversions,
      engagementRate,
      cpm,
      cpc,
      roas,
      spend,
    })
  }

  return snapshots
}

// ─── Follower Growth Generator ────────────────────────────────────────────────

/**
 * Generates a realistic follower growth curve over the past N days.
 * Starts from a calculated baseline and grows with daily variance.
 */
export function generateFollowerGrowth(
  currentFollowers: number,
  days: number = 90,
  seed: string = 'default',
) {
  const rand = seededRandom(seed)
  const monthlyGrowthRate = 0.02 + rand() * 0.06  // 2–8% monthly growth

  const dailyRate = monthlyGrowthRate / 30
  const startFollowers = Math.round(currentFollowers / (1 + dailyRate * days))

  const growth: any[] = []
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const daysElapsed = days - i
    const trend = startFollowers * (1 + dailyRate * daysElapsed)
    // Add noise: ±0.5% daily
    const noise = 1 + (rand() - 0.5) * 0.01
    const count = Math.round(trend * noise)

    growth.push({
      date: date.toISOString().split('T')[0],
      count,
    })
  }

  return growth
}

// ─── Mock Deal Stage History ──────────────────────────────────────────────────

export const MOCK_DEAL_STAGE_EVENTS = [
  { fromStage: null, toStage: 'OUTREACH', daysAgo: 30 },
  { fromStage: 'OUTREACH', toStage: 'NEGOTIATING', daysAgo: 22 },
  { fromStage: 'NEGOTIATING', toStage: 'SIGNED', daysAgo: 14 },
  { fromStage: 'SIGNED', toStage: 'LIVE', daysAgo: 7 },
] as const
