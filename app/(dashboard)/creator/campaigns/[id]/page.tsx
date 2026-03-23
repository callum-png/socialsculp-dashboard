import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge'
import { SubmitPostButton } from '@/components/creator/SubmitPostButton'
import { getDb } from '@/lib/db'
import {
  PLATFORM_LABELS,
  CONTENT_TYPE_LABELS,
  CAMPAIGN_STATUS_LABELS,
} from '@/lib/constants'
import type { CampaignStatusValue, PlatformValue, ContentTypeValue } from '@/lib/constants'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CreatorCampaignDetailPage({ params }: Props) {
  const { id } = await params

  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = getDb()
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  })

  if (!user?.creatorProfile) redirect('/sign-in')
  const creatorProfile = user.creatorProfile

  // Fetch campaign
  const campaign = await db.campaign.findUnique({
    where: { id },
    include: { brand: true },
  })

  if (!campaign) notFound()

  // Fetch this creator's deals for the campaign, including deliverables + post
  const deals = await db.deal.findMany({
    where: {
      campaignId: id,
      creatorId: creatorProfile.id,
    },
    include: {
      deliverables: {
        include: { post: true },
        orderBy: { dueDate: 'asc' },
      },
    },
  })

  // Confirm the creator is assigned (via deal or campaignCreator)
  const isAssigned = deals.length > 0
  if (!isAssigned) {
    // Check campaignCreators as fallback
    const cc = await db.campaignCreator.findFirst({
      where: { campaignId: id, creatorId: creatorProfile.id },
    })
    if (!cc) notFound()
  }

  // Flatten deliverables across all deals
  const deliverables = deals.flatMap((deal) => deal.deliverables)

  return (
    <div>
      <PageHeader
        title={campaign.name}
        description={campaign.brand.companyName}
        breadcrumb={[
          { label: 'Campaigns', href: '/creator/campaigns' },
          { label: campaign.name },
        ]}
      >
        <CampaignStatusBadge status={campaign.status as CampaignStatusValue} />
      </PageHeader>

      {/* Campaign info row */}
      <div className="px-6 py-5 border-b border-border bg-background">
        <div className="flex flex-wrap gap-6">
          <div>
            <div className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground mb-0.5">Platform</div>
            <div className="text-xs font-syne text-foreground">
              {PLATFORM_LABELS[campaign.platform as PlatformValue] ?? campaign.platform}
            </div>
          </div>
          {campaign.startDate && (
            <div>
              <div className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground mb-0.5">Start Date</div>
              <div className="text-xs font-syne text-foreground">
                {new Date(campaign.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          )}
          {campaign.endDate && (
            <div>
              <div className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground mb-0.5">End Date</div>
              <div className="text-xs font-syne text-foreground">
                {new Date(campaign.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          )}
          <div>
            <div className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground mb-0.5">Status</div>
            <div className="text-xs font-syne text-foreground">
              {CAMPAIGN_STATUS_LABELS[campaign.status as CampaignStatusValue] ?? campaign.status}
            </div>
          </div>
        </div>
        {campaign.description && (
          <p className="mt-4 text-sm font-syne text-muted-foreground max-w-2xl leading-relaxed">
            {campaign.description}
          </p>
        )}
      </div>

      {/* Your Deliverables section */}
      <div className="p-6">
        <h2 className="text-xs font-syne font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Your Deliverables
        </h2>

        {deliverables.length === 0 ? (
          <div className="bg-card border border-border px-5 py-10 text-center text-foreground font-syne text-xs uppercase tracking-widest">
            No deliverables assigned yet
          </div>
        ) : (
          <div className="bg-card border border-border divide-y divide-border">
            {deliverables.map((deliverable) => {
              const isLive = deliverable.submitted && deliverable.post != null
              const platformLabel =
                PLATFORM_LABELS[deliverable.platform as PlatformValue] ?? deliverable.platform
              const contentTypeLabel =
                CONTENT_TYPE_LABELS[deliverable.contentType as ContentTypeValue] ??
                deliverable.contentType

              return (
                <div key={deliverable.id} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                  {/* Left: type + due date */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div>
                      <div className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground mb-0.5">
                        Platform
                      </div>
                      <div className="text-xs font-syne text-foreground">{platformLabel}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground mb-0.5">
                        Type
                      </div>
                      <div className="text-xs font-syne text-foreground">{contentTypeLabel}</div>
                    </div>
                    {deliverable.dueDate && (
                      <div>
                        <div className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground mb-0.5">
                          Due
                        </div>
                        <div className="text-xs font-syne text-foreground">
                          {new Date(deliverable.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    )}
                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest ${
                        isLive
                          ? 'bg-blue-50 text-[#008cff] border border-blue-200'
                          : 'bg-background text-muted-foreground border border-border'
                      }`}
                    >
                      {isLive ? 'Live' : 'Pending'}
                    </span>
                  </div>

                  {/* Right: post metrics or submit button */}
                  <div className="flex items-center gap-4 shrink-0">
                    {deliverable.post != null ? (
                      <>
                        {deliverable.post.views > 0 && (
                          <div className="text-right">
                            <div className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground mb-0.5">
                              Views
                            </div>
                            <div className="text-xs font-syne text-foreground">
                              {deliverable.post.views.toLocaleString()}
                            </div>
                          </div>
                        )}
                        {deliverable.post.engagementRate > 0 && (
                          <div className="text-right">
                            <div className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground mb-0.5">
                              Eng. Rate
                            </div>
                            <div className="text-xs font-syne text-foreground">
                              {deliverable.post.engagementRate.toFixed(2)}%
                            </div>
                          </div>
                        )}
                        <Link
                          href={deliverable.post.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-syne text-[#008cff] hover:text-[#47AAFF] transition-colors whitespace-nowrap"
                        >
                          View Post →
                        </Link>
                      </>
                    ) : (
                      <SubmitPostButton
                        deliverableId={deliverable.id}
                        platform={deliverable.platform}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
