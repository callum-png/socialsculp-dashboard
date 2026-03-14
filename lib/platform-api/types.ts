// ─── Creator Platform Stats ───────────────────────────────────────────────────

export interface CreatorPlatformStats {
  platform: 'TIKTOK' | 'INSTAGRAM'
  followers: number
  avgViews: number
  avgLikes: number
  avgComments: number
  engagementRate: number
  topPosts: {
    url: string
    views: number
    likes: number
  }[]
  followerGrowth: {
    date: string
    count: number
  }[]
}

// ─── Campaign Metrics ─────────────────────────────────────────────────────────

export interface CampaignMetrics {
  campaignId: string
  platform: 'TIKTOK' | 'INSTAGRAM' | 'BOTH'
  impressions: number
  reach: number
  engagements: number
  clicks: number
  conversions: number
  engagementRate: number
  cpm: number
  roas: number
  spend: number
  dailyBreakdown: {
    date: string
    impressions: number
    reach: number
    engagements: number
    spend: number
    roas: number
  }[]
}

// ─── Platform Adapter Interface ───────────────────────────────────────────────

export interface PlatformAdapter {
  getCreatorStats(
    handle: string,
    platform: 'TIKTOK' | 'INSTAGRAM',
  ): Promise<CreatorPlatformStats>

  getCampaignMetrics(campaignId: string): Promise<CampaignMetrics>
}
