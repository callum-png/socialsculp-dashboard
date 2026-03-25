import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("videos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    campaignId: v.id("campaigns"),
    creatorId: v.optional(v.id("campaignCreators")),
    creatorHandle: v.optional(v.string()),
    platform: v.string(),
    liveUrl: v.string(),
    title: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    views: v.optional(v.number()),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
    shares: v.optional(v.number()),
    engagementRate: v.optional(v.number()),
    postedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("videos", args);
  },
});

export const updateMetrics = mutation({
  args: {
    id: v.id("videos"),
    views: v.optional(v.number()),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
    shares: v.optional(v.number()),
    engagementRate: v.optional(v.number()),
    lastSyncedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("videos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
