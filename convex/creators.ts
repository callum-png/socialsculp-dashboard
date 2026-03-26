import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("campaignCreators")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("campaignCreators") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getTimeseries = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("creatorTimeseries")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
  },
});

export const add = mutation({
  args: {
    campaignId: v.id("campaigns"),
    name: v.string(),
    handle: v.optional(v.string()),
    instagramHandle: v.optional(v.string()),
    tiktokHandle: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    status: v.string(),
    agreedFee: v.optional(v.number()),
    medianViews: v.optional(v.number()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("campaignCreators", {
      ...args,
      campaignViews: 0,
      campaignLikes: 0,
      campaignComments: 0,
      postCount: 0,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("campaignCreators"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateMetrics = mutation({
  args: {
    id: v.id("campaignCreators"),
    campaignViews: v.optional(v.number()),
    campaignLikes: v.optional(v.number()),
    campaignComments: v.optional(v.number()),
    postCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("campaignCreators") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
