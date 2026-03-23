import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { EngagementLineChart } from '@/components/charts/EngagementLineChart'
import { getDb } from '@/lib/db'
import { formatNumber, formatPercent } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

export default async function CreatorAnalyticsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = getDb()

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      creatorProfile: {
        include: {
          platformStats: {
            where: {
              date: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
            orderBy: { date: 'asc' },
          },
        },
      },
    },
  })

  if (!user?.creatorProfile) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground font-syne text-sm">Creator profile not set up yet.</p>
      </div>
    )
  }

  const creator = user.creatorProfile

  // Fetch this creator's submitted posts
  const posts = await db.post.findMany({
    where: { submittedById: user.id },
    select: { views: true },
  })

  const postsSubmitted = posts.length
  const avgViews =
    postsSubmitted > 0
      ? Math.round(posts.reduce((sum, p) => sum + p.views, 0) / postsSubmitted)
      : 0

  // Build chart data: group PlatformStats by date, pairing tiktok + instagram eng rates
  const statsByDate = new Map<string, { tiktok?: number; instagram?: number }>()

  for (const stat of creator.platformStats) {
    const dateKey = stat.date.toISOString().slice(0, 10)
    const existing = statsByDate.get(dateKey) ?? {}
    if (stat.platform === 'TIKTOK') {
      statsByDate.set(dateKey, { ...existing, tiktok: stat.engRate })
    } else if (stat.platform === 'INSTAGRAM') {
      statsByDate.set(dateKey, { ...existing, instagram: stat.engRate })
    }
  }

  const engData = Array.from(statsByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rates]) => ({
      date,
      tiktok: parseFloat((rates.tiktok ?? 0).toFixed(2)),
      instagram: parseFloat((rates.instagram ?? 0).toFixed(2)),
    }))

  const hasStats = engData.length > 0

  return (
    <div>
      <PageHeader
        eyebrow="Creator"
        title="My Analytics"
        description="Last 30 days performance overview"
      />

      <div className="p-6 space-y-6">
        {/* Follower totals banner */}
        {(creator.tiktokFollowers != null || creator.instagramFollowers != null) && (
          <div className="bg-blue-50 border border-blue-200 p-4 flex items-center gap-3">
            <TrendingUp size={16} className="text-[#008cff] shrink-0" />
            <span className="text-sm font-syne font-bold text-[#008cff]">
              {formatNumber(
                (creator.tiktokFollowers ?? 0) + (creator.instagramFollowers ?? 0)
              )}{' '}
              total followers
            </span>
            <span className="text-xs font-syne text-muted-foreground">
              Combined TikTok + Instagram
            </span>
          </div>
        )}

        {/* Platform stats grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* TikTok */}
          <div className="bg-card border border-border p-5">
            <h3 className="text-sm font-syne font-bold text-foreground mb-4">TikTok</h3>
            <div className="space-y-3">
              {[
                {
                  label: 'Followers',
                  value: creator.tiktokFollowers != null ? formatNumber(creator.tiktokFollowers) : '—',
                },
                {
                  label: 'Posts Submitted',
                  value: formatNumber(postsSubmitted),
                },
                {
                  label: 'Engagement Rate',
                  value: creator.tiktokEngRate != null ? formatPercent(creator.tiktokEngRate) : '—',
                  accent: true,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center py-2 border-b border-border"
                >
                  <span className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground">
                    {row.label}
                  </span>
                  <span
                    className={`text-sm font-syne font-bold ${
                      row.accent ? 'text-[#008cff]' : 'text-foreground'
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instagram */}
          <div className="bg-card border border-border p-5">
            <h3 className="text-sm font-syne font-bold text-foreground mb-4">Instagram</h3>
            <div className="space-y-3">
              {[
                {
                  label: 'Followers',
                  value: creator.instagramFollowers != null ? formatNumber(creator.instagramFollowers) : '—',
                },
                {
                  label: 'Avg Views per Post',
                  value: avgViews > 0 ? formatNumber(avgViews) : '—',
                },
                {
                  label: 'Engagement Rate',
                  value: creator.instagramEngRate != null ? formatPercent(creator.instagramEngRate) : '—',
                  accent: true,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center py-2 border-b border-border"
                >
                  <span className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground">
                    {row.label}
                  </span>
                  <span
                    className={`text-sm font-syne font-bold ${
                      row.accent ? 'text-[#008cff]' : 'text-foreground'
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement line chart */}
        <ChartContainer
          title="Engagement Rate — Last 30 Days"
          description="Daily TikTok and Instagram engagement"
        >
          {hasStats ? (
            <EngagementLineChart data={engData} />
          ) : (
            <div className="flex items-center justify-center h-[260px]">
              <p className="text-sm font-syne text-foreground text-center">
                No analytics data yet — stats will appear as your content performs
              </p>
            </div>
          )}
        </ChartContainer>
      </div>
    </div>
  )
}
