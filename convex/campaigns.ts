import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: { clerkUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.clerkUserId) {
      return await ctx.db
        .query("campaigns")
        .filter((q) => q.eq(q.field("clerkUserId"), args.clerkUserId))
        .collect();
    }
    return await ctx.db.query("campaigns").collect();
  },
});

export const getMetrics = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return null;
    return {
      totalViews: campaign.totalViews ?? 0,
      totalLikes: campaign.totalLikes ?? 0,
      totalComments: campaign.totalComments ?? 0,
      totalShares: campaign.totalShares ?? 0,
      avgEngagement: campaign.avgEngagement ?? 0,
      videoCount: campaign.videoCount ?? 0,
    };
  },
});

export const getTimeseries = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("metricTimeseries")
      .withIndex("by_campaign_date", (q) => q.eq("campaignId", args.campaignId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    brandName: v.optional(v.string()),
    status: v.string(),
    platforms: v.array(v.string()),
    clerkUserId: v.string(),
    budget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("campaigns", {
      ...args,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      avgEngagement: 0,
      videoCount: 0,
    });
  },
});

export const updateMetrics = mutation({
  args: {
    id: v.id("campaigns"),
    totalViews: v.optional(v.number()),
    totalLikes: v.optional(v.number()),
    totalComments: v.optional(v.number()),
    totalShares: v.optional(v.number()),
    avgEngagement: v.optional(v.number()),
    videoCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});
