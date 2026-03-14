import type { PlatformAdapter, CreatorPlatformStats, CampaignMetrics } from './platform-api/types'
import { MOCK_CREATORS, generateAnalyticsData, generateFollowerGrowth } from './mock-data'

// ─── Mock Adapter ─────────────────────────────────────────────────────────────

class MockAdapter implements PlatformAdapter {
  async getCreatorStats(
    handle: string,
    platform: 'TIKTOK' | 'INSTAGRAM',
  ): Promise<CreatorPlatformStats> {
    // Normalize handle for lookup
    const normalizedHandle = handle.startsWith('@') ? handle : `@${handle}`

    const creator = MOCK_CREATORS.find(
      (c) => c.handle.toLowerCase() === normalizedHandle.toLowerCase(),
    )

    // Fall back to a generic creator if handle not found
    const followers =
      platform === 'TIKTOK'
        ? creator?.tiktokFollowers ?? 500_000
        : creator?.instagramFollowers ?? 250_000

    const avgViews =
      platform === 'TIKTOK' ? creator?.tiktokAvgViews ?? 80_000 : 0

    const avgLikes =
      platform === 'INSTAGRAM' ? creator?.instagramAvgLikes ?? 10_000 : 0

    const engagementRate =
      platform === 'TIKTOK'
        ? creator?.tiktokEngRate ?? 4.5
        : creator?.instagramEngRate ?? 3.0

    // Generate 5 mock top posts
    const topPosts = Array.from({ length: 5 }, (_, i) => ({
      url: `https://${platform === 'TIKTOK' ? 'tiktok.com' : 'instagram.com'}/${normalizedHandle}/post/${i + 1}`,
      views: Math.round(avgViews * (0.8 + Math.random() * 0.8)),
      likes: Math.round(avgLikes * (0.7 + Math.random() * 0.9)),
    }))

    const followerGrowth = generateFollowerGrowth(followers, 90, `${handle}-${platform}`)

    return {
      platform,
      followers,
      avgViews,
      avgLikes,
      avgComments: Math.round((avgLikes || Math.round(followers * 0.02)) * 0.08),
      engagementRate,
      topPosts,
      followerGrowth,
    }
  }

  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    const snapshots = generateAnalyticsData(campaignId, 90)

    // Aggregate totals from the daily snapshots
    const totals = snapshots.reduce(
      (acc, snap) => ({
        impressions: acc.impressions + snap.impressions,
        reach: acc.reach + snap.reach,
        engagements: acc.engagements + snap.engagements,
        clicks: acc.clicks + snap.clicks,
        conversions: acc.conversions + snap.conversions,
        spend: acc.spend + snap.spend,
      }),
      { impressions: 0, reach: 0, engagements: 0, clicks: 0, conversions: 0, spend: 0 },
    )

    const engagementRate = totals.reach > 0
      ? parseFloat(((totals.engagements / totals.reach) * 100).toFixed(2))
      : 0

    const cpm = totals.impressions > 0
      ? parseFloat(((totals.spend / totals.impressions) * 1000).toFixed(2))
      : 0

    // Average ROAS across all days (weighted by spend)
    const weightedROAS = snapshots.reduce((acc, snap) => acc + snap.roas * snap.spend, 0)
    const roas = totals.spend > 0
      ? parseFloat((weightedROAS / totals.spend).toFixed(2))
      : 0

    const dailyBreakdown = snapshots.map((snap) => ({
      date: snap.date.split('T')[0],
      impressions: snap.impressions,
      reach: snap.reach,
      engagements: snap.engagements,
      spend: snap.spend,
      roas: snap.roas,
    }))

    return {
      campaignId,
      platform: 'BOTH',
      ...totals,
      engagementRate,
      cpm,
      roas,
      dailyBreakdown,
    }
  }
}

// ─── Real Adapters (stubbed) ──────────────────────────────────────────────────

class TikTokAdapter implements PlatformAdapter {
  async getCreatorStats(
    _handle: string,
    _platform: 'TIKTOK' | 'INSTAGRAM',
  ): Promise<CreatorPlatformStats> {
    throw new Error(
      'TikTok API not yet configured. Set PLATFORM_DATA_SOURCE=mock or configure TikTok API credentials.',
    )
  }

  async getCampaignMetrics(_campaignId: string): Promise<CampaignMetrics> {
    throw new Error(
      'TikTok API not yet configured. Set PLATFORM_DATA_SOURCE=mock or configure TikTok API credentials.',
    )
  }
}

class InstagramAdapter implements PlatformAdapter {
  async getCreatorStats(
    _handle: string,
    _platform: 'TIKTOK' | 'INSTAGRAM',
  ): Promise<CreatorPlatformStats> {
    throw new Error(
      'Instagram API not yet configured. Set PLATFORM_DATA_SOURCE=mock or configure Instagram Graph API credentials.',
    )
  }

  async getCampaignMetrics(_campaignId: string): Promise<CampaignMetrics> {
    throw new Error(
      'Instagram API not yet configured. Set PLATFORM_DATA_SOURCE=mock or configure Instagram Graph API credentials.',
    )
  }
}

// ─── Export Active Adapter ────────────────────────────────────────────────────

/**
 * The active platform adapter, selected by the PLATFORM_DATA_SOURCE env var.
 *
 * - 'mock'  (default) — uses generated data, no API keys needed
 * - 'live'  — uses real TikTok/Instagram APIs (requires credentials)
 */
export const platformAdapter: PlatformAdapter =
  process.env.PLATFORM_DATA_SOURCE === 'live'
    ? new TikTokAdapter()
    : new MockAdapter()

// Export adapter classes for use in tests or custom instantiation
export { MockAdapter, TikTokAdapter, InstagramAdapter }
