"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

/**
 * Convex IDs are 32-char alphanumeric strings.
 * Prisma cuid2 IDs start with "c" and are longer — they're not valid Convex IDs.
 * When we get a non-Convex ID (e.g. from Prisma), skip the query gracefully
 * and return null so callers know to use fallback data.
 */
function isConvexId(id: string): boolean {
  // Convex IDs are lowercase alphanumeric, don't start with "c" (cuid2 prefix)
  return /^[a-z0-9]{20,40}$/.test(id) && !id.startsWith("c")
}

export function useCampaign(id: string) {
  const valid = isConvexId(id)
  const result = useQuery(api.campaigns.get, valid ? { id: id as Id<"campaigns"> } : "skip")
  // When skipped, return null (not undefined) so callers don't show loading forever
  return valid ? result : null
}

export function useCampaignCreators(campaignId: string) {
  const valid = isConvexId(campaignId)
  const result = useQuery(api.creators.listByCampaign, valid ? { campaignId: campaignId as Id<"campaigns"> } : "skip")
  return valid ? result : null
}

export function useCampaignVideos(campaignId: string) {
  const valid = isConvexId(campaignId)
  const result = useQuery(api.videos.listByCampaign, valid ? { campaignId: campaignId as Id<"campaigns"> } : "skip")
  return valid ? result : null
}

export function useCampaignTimeseries(campaignId: string) {
  const valid = isConvexId(campaignId)
  const result = useQuery(api.campaigns.getTimeseries, valid ? { campaignId: campaignId as Id<"campaigns"> } : "skip")
  return valid ? result : null
}

export function useCreatorTimeseries(campaignId: string) {
  const valid = isConvexId(campaignId)
  const result = useQuery(api.creators.getTimeseries, valid ? { campaignId: campaignId as Id<"campaigns"> } : "skip")
  return valid ? result : null
}
