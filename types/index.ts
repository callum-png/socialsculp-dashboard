// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'CREATOR' | 'BRAND'

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'

export type Platform = 'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE' | 'BOTH'

export type DealStage = 'OUTREACH' | 'NEGOTIATING' | 'SIGNED' | 'LIVE' | 'COMPLETED' | 'CANCELLED'

export type ContentType =
  | 'REEL'
  | 'TIKTOK_VIDEO'
  | 'STORY'
  | 'POST'
  | 'CAROUSEL'
  | 'YOUTUBE_SHORT'

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface User {
  id: string
  clerkId: string
  email: string
  name: string
  role: UserRole
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreatorProfile {
  id: string
  userId: string
  handle: string
  bio: string | null
  niche: string[]
  location: string | null
  mediaKitUrl: string | null

  // TikTok
  tiktokFollowers: number | null
  tiktokAvgViews: number | null
  tiktokEngRate: number | null

  // Instagram
  instagramFollowers: number | null
  instagramAvgLikes: number | null
  instagramEngRate: number | null

  // Aggregates
  totalReach: number
  avgEngagement: number

  createdAt: Date
  updatedAt: Date
}

export interface BrandProfile {
  id: string
  userId: string
  companyName: string
  industry: string | null
  logoUrl: string | null
  website: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Campaign {
  id: string
  name: string
  description: string | null
  status: CampaignStatus
  platform: Platform
  contentTypes: ContentType[]

  totalBudget: number
  spentBudget: number

  startDate: Date | null
  endDate: Date | null

  targetReach: number | null
  targetEngagement: number | null
  targetROAS: number | null

  brandId: string

  tags: string[]
  briefUrl: string | null
  createdById: string

  createdAt: Date
  updatedAt: Date
}

export interface CampaignCreator {
  id: string
  campaignId: string
  creatorId: string
  role: string | null
  fee: number | null
  notes: string | null
}

export interface Deal {
  id: string
  title: string
  stage: DealStage

  proposedFee: number | null
  agreedFee: number | null
  currency: string

  campaignId: string
  creatorId: string

  outreachDate: Date | null
  signedDate: Date | null
  liveDate: Date | null
  completedDate: Date | null

  notes: string | null
  contractUrl: string | null

  createdAt: Date
  updatedAt: Date
}

export interface Deliverable {
  id: string
  dealId: string
  platform: Platform
  contentType: ContentType
  dueDate: Date | null
  submitted: boolean
  liveUrl: string | null
}

export interface DealStageEvent {
  id: string
  dealId: string
  fromStage: DealStage | null
  toStage: DealStage
  note: string | null
  changedById: string
  createdAt: Date
}

export interface AnalyticsSnapshot {
  id: string
  campaignId: string
  date: Date
  platform: Platform

  impressions: number
  reach: number
  engagements: number
  clicks: number
  conversions: number
  engagementRate: number
  cpm: number
  cpc: number
  roas: number
  spend: number

  createdAt: Date
}

export interface PlatformStat {
  id: string
  creatorId: string
  platform: Platform
  date: Date

  followers: number
  avgViews: number | null
  avgLikes: number | null
  avgComments: number | null
  engRate: number

  createdAt: Date
}

// ─── Extended Types with Relations ────────────────────────────────────────────

export interface CampaignWithBrand extends Campaign {
  brand: BrandProfile
}

export interface CampaignWithBrandAndDeals extends Campaign {
  brand: BrandProfile
  deals: DealWithCreator[]
  campaignCreators: (CampaignCreator & { creator: CreatorProfile })[]
}

export interface DealWithCreator extends Deal {
  creator: CreatorProfile
}

export interface DealWithCampaign extends Deal {
  campaign: Campaign
}

export interface DealWithCreatorAndCampaign extends Deal {
  creator: CreatorProfile
  campaign: CampaignWithBrand
  deliverables: Deliverable[]
  stageHistory: DealStageEvent[]
}

export interface CreatorWithStats extends CreatorProfile {
  user: User
  deals: Deal[]
  platformStats: PlatformStat[]
}

export interface CreatorWithDealsAndCampaigns extends CreatorProfile {
  user: User
  deals: DealWithCampaign[]
  campaignCreators: (CampaignCreator & { campaign: CampaignWithBrand })[]
}

export interface BrandWithCampaigns extends BrandProfile {
  user: User
  campaigns: Campaign[]
}

// ─── Utility / UI Types ───────────────────────────────────────────────────────

export interface StatCardData {
  label: string
  value: string | number
  /** Formatted display value, e.g. "4.2M" */
  formatted?: string
  /** Percentage change vs previous period */
  change?: number
  /** Direction of desired change — determines color coding */
  trend?: 'up' | 'down' | 'neutral'
  /** Sparkline data for the mini chart */
  sparkline?: ChartDataPoint[]
  icon?: string
  description?: string
}

export interface ChartDataPoint {
  /** ISO date string or label */
  date: string
  value: number
  /** Optional secondary value for dual-axis charts */
  value2?: number
  label?: string
}

export interface DailyMetrics {
  date: string
  impressions: number
  reach: number
  engagements: number
  spend: number
  roas: number
  clicks?: number
  conversions?: number
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  success: true
}

export interface ApiError {
  error: string
  code?: string
  success: false
}

export type ApiResult<T> = ApiResponse<T> | ApiError

// ─── Filter / Sort Types ──────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CampaignFilters extends PaginationParams, SortParams {
  status?: CampaignStatus
  platform?: Platform
  brandId?: string
  search?: string
}

export interface CreatorFilters extends PaginationParams, SortParams {
  niche?: string
  platform?: Platform
  minFollowers?: number
  maxFollowers?: number
  location?: string
  search?: string
}

export interface DealFilters extends PaginationParams, SortParams {
  stage?: DealStage
  campaignId?: string
  creatorId?: string
  search?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
