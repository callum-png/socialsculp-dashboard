"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

export function useCampaign(id: Id<"campaigns">) {
  return useQuery(api.campaigns.get, { id })
}

export function useCampaignCreators(campaignId: Id<"campaigns">) {
  return useQuery(api.creators.listByCampaign, { campaignId })
}

export function useCampaignVideos(campaignId: Id<"campaigns">) {
  return useQuery(api.videos.listByCampaign, { campaignId })
}

export function useCampaignTimeseries(campaignId: Id<"campaigns">) {
  return useQuery(api.campaigns.getTimeseries, { campaignId })
}

export function useCreatorTimeseries(campaignId: Id<"campaigns">) {
  return useQuery(api.creators.getTimeseries, { campaignId })
}
