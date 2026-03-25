import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Campaign core data
  campaigns: defineTable({
    name: v.string(),
    brandName: v.optional(v.string()),
    brandLogoUrl: v.optional(v.string()),
    status: v.string(), // "active" | "paused" | "completed" | "draft"
    platforms: v.array(v.string()), // ["instagram", "tiktok"]
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    budget: v.optional(v.number()),
    spent: v.optional(v.number()),
    // Aggregate metrics (updated by background jobs)
    totalViews: v.optional(v.number()),
    totalLikes: v.optional(v.number()),
    totalComments: v.optional(v.number()),
    totalShares: v.optional(v.number()),
    avgEngagement: v.optional(v.number()),
    videoCount: v.optional(v.number()),
    // Owner
    clerkUserId: v.string(),
  }),

  // Creators assigned to campaigns
  campaignCreators: defineTable({
    campaignId: v.id("campaigns"),
    name: v.string(),
    handle: v.optional(v.string()),
    instagramHandle: v.optional(v.string()),
    tiktokHandle: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    status: v.string(), // "invited" | "confirmed" | "declined" | "completed"
    agreedFee: v.optional(v.number()),
    medianViews: v.optional(v.number()),
    campaignViews: v.optional(v.number()),
    campaignLikes: v.optional(v.number()),
    campaignComments: v.optional(v.number()),
    postCount: v.optional(v.number()),
    color: v.optional(v.string()), // for chart line color
  }).index("by_campaign", ["campaignId"]),

  // Video/post tracking
  videos: defineTable({
    campaignId: v.id("campaigns"),
    creatorId: v.optional(v.id("campaignCreators")),
    creatorHandle: v.optional(v.string()),
    platform: v.string(), // "instagram" | "tiktok"
    liveUrl: v.string(),
    title: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    thumbnailUrl: v.optional(v.string()),
    views: v.optional(v.number()),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
    shares: v.optional(v.number()),
    engagementRate: v.optional(v.number()),
    postedAt: v.optional(v.string()),
    lastSyncedAt: v.optional(v.string()),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_creator", ["creatorId"]),

  // Time-series metrics for charts
  metricTimeseries: defineTable({
    campaignId: v.id("campaigns"),
    date: v.string(), // "2026-03-15"
    views: v.optional(v.number()),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
    shares: v.optional(v.number()),
  }).index("by_campaign_date", ["campaignId", "date"]),

  // Creator-level time-series for comparison chart
  creatorTimeseries: defineTable({
    campaignId: v.id("campaigns"),
    creatorId: v.id("campaignCreators"),
    date: v.string(),
    views: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_creator", ["creatorId"]),
});
