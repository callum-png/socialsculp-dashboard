// ─── Deal Stages ─────────────────────────────────────────────────────────────

export const DEAL_STAGES = [
  'OUTREACH',
  'NEGOTIATING',
  'SIGNED',
  'LIVE',
  'COMPLETED',
  'CANCELLED',
] as const

export type DealStageValue = (typeof DEAL_STAGES)[number]

export const DEAL_STAGE_LABELS: Record<DealStageValue, string> = {
  OUTREACH: 'Outreach',
  NEGOTIATING: 'Negotiating',
  SIGNED: 'Signed',
  LIVE: 'Live',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

/**
 * Tailwind CSS classes for each deal stage badge.
 * Uses inline hex colors via arbitrary values to match the design system exactly.
 */
export const DEAL_STAGE_COLORS: Record<DealStageValue, string> = {
  OUTREACH: 'bg-[#1A1A1A] text-[#6B6860] border border-[#2A2A2A]',
  NEGOTIATING: 'bg-[#1A1200] text-[#FFB547] border border-[#3A2D00]',
  SIGNED: 'bg-[#0D1F3C] text-[#47AAFF] border border-[#1A3A6A]',
  LIVE: 'bg-[#001a33] text-[#008cff] border border-[#003366]',
  COMPLETED: 'bg-[#0A1F0A] text-[#4ADE80] border border-[#1A4A1A]',
  CANCELLED: 'bg-[#1F0A0A] text-[#FF4747] border border-[#4A1A1A]',
}

export const DEAL_STAGE_DOT_COLORS: Record<DealStageValue, string> = {
  OUTREACH: '#6B6860',
  NEGOTIATING: '#FFB547',
  SIGNED: '#47AAFF',
  LIVE: '#008cff',
  COMPLETED: '#4ADE80',
  CANCELLED: '#FF4747',
}

// ─── Campaign Status ──────────────────────────────────────────────────────────

export const CAMPAIGN_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
] as const

export type CampaignStatusValue = (typeof CAMPAIGN_STATUSES)[number]

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatusValue, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatusValue, string> = {
  DRAFT: 'bg-[#1A1A1A] text-[#6B6860] border border-[#2A2A2A]',
  ACTIVE: 'bg-[#001a33] text-[#008cff] border border-[#003366]',
  PAUSED: 'bg-[#1A1200] text-[#FFB547] border border-[#3A2D00]',
  COMPLETED: 'bg-[#0A1F0A] text-[#4ADE80] border border-[#1A4A1A]',
  CANCELLED: 'bg-[#1F0A0A] text-[#FF4747] border border-[#4A1A1A]',
}

export const CAMPAIGN_STATUS_DOT_COLORS: Record<CampaignStatusValue, string> = {
  DRAFT: '#6B6860',
  ACTIVE: '#008cff',
  PAUSED: '#FFB547',
  COMPLETED: '#4ADE80',
  CANCELLED: '#FF4747',
}

// ─── Niches ───────────────────────────────────────────────────────────────────

export const NICHES = [
  'Lifestyle',
  'Fashion',
  'Beauty',
  'Fitness',
  'Tech',
  'Gaming',
  'Food',
  'Travel',
  'Finance',
  'Education',
  'Entertainment',
  'Sports',
] as const

export type NicheValue = (typeof NICHES)[number]

// ─── Platforms ────────────────────────────────────────────────────────────────

export const PLATFORMS = ['TIKTOK', 'INSTAGRAM', 'BOTH'] as const

export type PlatformValue = (typeof PLATFORMS)[number]

export const PLATFORM_LABELS: Record<PlatformValue, string> = {
  TIKTOK: 'TikTok',
  INSTAGRAM: 'Instagram',
  BOTH: 'TikTok + Instagram',
}

export const PLATFORM_COLORS: Record<PlatformValue, string> = {
  TIKTOK: '#FF0050',
  INSTAGRAM: '#E1306C',
  BOTH: '#008cff',
}

// ─── Content Types ────────────────────────────────────────────────────────────

export const CONTENT_TYPES = [
  'REEL',
  'TIKTOK_VIDEO',
  'STORY',
  'POST',
  'CAROUSEL',
  'YOUTUBE_SHORT',
] as const

export type ContentTypeValue = (typeof CONTENT_TYPES)[number]

export const CONTENT_TYPE_LABELS: Record<ContentTypeValue, string> = {
  REEL: 'Instagram Reel',
  TIKTOK_VIDEO: 'TikTok Video',
  STORY: 'Story',
  POST: 'Feed Post',
  CAROUSEL: 'Carousel',
  YOUTUBE_SHORT: 'YouTube Short',
}

export const CONTENT_TYPE_PLATFORMS: Record<ContentTypeValue, PlatformValue> = {
  REEL: 'INSTAGRAM',
  TIKTOK_VIDEO: 'TIKTOK',
  STORY: 'BOTH',
  POST: 'INSTAGRAM',
  CAROUSEL: 'INSTAGRAM',
  YOUTUBE_SHORT: 'BOTH',
}

// ─── User Roles ───────────────────────────────────────────────────────────────

export const USER_ROLES = ['ADMIN', 'CREATOR', 'BRAND'] as const

export type UserRoleValue = (typeof USER_ROLES)[number]

export const ROLE_LABELS: Record<UserRoleValue, string> = {
  ADMIN: 'Admin',
  CREATOR: 'Creator',
  BRAND: 'Brand',
}

/**
 * Maps each user role to their home dashboard route.
 */
export const ROLE_HOME_ROUTES: Record<UserRoleValue, string> = {
  ADMIN: '/admin',
  CREATOR: '/creator',
  BRAND: '/brand',
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export const ADMIN_NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Campaigns', href: '/admin/campaigns', icon: 'Megaphone' },
  { label: 'Creators', href: '/admin/creators', icon: 'Users' },
  { label: 'Brands', href: '/admin/brands', icon: 'Building2' },
  { label: 'Deals', href: '/admin/deals', icon: 'Handshake' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
  { label: 'Users', href: '/admin/users', icon: 'UserCheck' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
] as const

export const CREATOR_NAV_ITEMS = [
  { label: 'Overview', href: '/creator', icon: 'LayoutDashboard' },
  { label: 'My Deals', href: '/creator/deals', icon: 'Handshake' },
  { label: 'Campaigns', href: '/creator/campaigns', icon: 'Megaphone' },
  { label: 'Analytics', href: '/creator/analytics', icon: 'BarChart3' },
  { label: 'Media Kit', href: '/creator/media-kit', icon: 'FileText' },
  { label: 'Settings', href: '/creator/settings', icon: 'Settings' },
] as const

export const BRAND_NAV_ITEMS = [
  { label: 'Overview', href: '/brand', icon: 'LayoutDashboard' },
  { label: 'Campaigns', href: '/brand/campaigns', icon: 'Megaphone' },
  { label: 'Creators', href: '/brand/creators', icon: 'Users' },
  { label: 'Deals', href: '/brand/deals', icon: 'Handshake' },
  { label: 'Analytics', href: '/brand/analytics', icon: 'BarChart3' },
  { label: 'Settings', href: '/brand/settings', icon: 'Settings' },
] as const

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

// ─── Chart / Analytics ───────────────────────────────────────────────────────

export const CHART_COLORS = {
  accent: '#008cff',
  blue: '#47AAFF',
  pink: '#FF47C9',
  warning: '#FFB547',
  danger: '#FF4747',
  green: '#4ADE80',
  muted: '#6B6860',
} as const

export const DATE_RANGE_OPTIONS = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Last 6 months', value: 180 },
  { label: 'Last year', value: 365 },
] as const
