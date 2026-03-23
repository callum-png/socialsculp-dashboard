import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { PreviewBanner } from '@/components/admin/PreviewBanner'
import { Eye, TrendingUp, DollarSign, Megaphone, CheckCircle2, Circle, Play, FileText, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ userId: string; campaignId: string }>
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_STATS = [
  { title: 'Total Reach', value: '2.4M', icon: Eye },
  { title: 'Total Spend', value: '$12,500', icon: DollarSign },
  { title: 'Avg ROAS', value: '3.2x', icon: TrendingUp },
  { title: 'Engagement Rate', value: '8.4%', icon: Megaphone },
]

const TIMELINE_PHASES = [
  { label: 'Brief', done: true },
  { label: 'Creator Selection', done: true },
  { label: 'Content Creation', done: true },
  { label: 'Live', done: true, active: true },
  { label: 'Reporting', done: false },
]

const DEMO_CREATORS = [
  { handle: '@kbtheginger', followers: '1.2M', platform: 'TikTok', status: 'ACTIVE' as const },
  { handle: '@echotalks', followers: '440K', platform: 'TikTok', status: 'ACTIVE' as const },
  { handle: '@zayynelly', followers: '233K', platform: 'TikTok', status: 'DELIVERED' as const },
]

const DEMO_POSTS = [
  { creator: '@kbtheginger', platform: 'TikTok', views: '1.4M', likes: '125K', status: 'Live' },
  { creator: '@echotalks', platform: 'TikTok', views: '890K', likes: '76K', status: 'Live' },
]

const CREATOR_STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-blue-50 text-[#008cff] border border-blue-200',
  DELIVERED: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CampaignDetailPage({ params }: PageProps) {
  const { userId: adminClerkId } = await auth()
  if (!adminClerkId) redirect('/sign-in')

  const db = getDb()
  const adminUser = await db.user.findUnique({ where: { clerkId: adminClerkId } })
  if (adminUser?.role !== 'ADMIN') redirect('/admin')

  const { userId, campaignId } = await params

  const targetUser = await db.user.findUnique({ where: { id: userId } })
  if (!targetUser || targetUser.role !== 'BRAND') notFound()

  // Only the demo campaign is handled here; real campaigns can be added later
  if (campaignId !== 'demo') notFound()

  return (
    <>
      <PreviewBanner userName={targetUser.name} role="Brand" />
      <div className="p-6 space-y-8">

        {/* ── Campaign Header ──────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-syne font-bold text-foreground">X Campaign</h1>
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest bg-blue-50 text-[#008cff] border border-blue-200">
                Active
              </span>
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest bg-muted text-muted-foreground border border-border">
                Demo
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-syne">Sample campaign — placeholder data for portal preview</p>
          </div>
        </div>

        {/* ── Stat Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {DEMO_STATS.map(({ title, value, icon: Icon }) => (
            <div key={title} className="bg-card p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] font-syne font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  {title}
                </span>
                <Icon size={15} className="text-muted-foreground shrink-0" />
              </div>
              <div className="font-syne text-[2.5rem] font-light leading-none text-foreground">
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Campaign Timeline ─────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-syne font-semibold text-white">Campaign Timeline</h2>
          </div>
          <div className="px-5 py-6">
            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {TIMELINE_PHASES.map((phase, i) => (
                <div key={phase.label} className="flex items-center shrink-0">
                  {/* Phase node */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                        phase.active
                          ? 'bg-[#008cff] border-[#008cff]'
                          : phase.done
                          ? 'bg-[#4ADE80] border-[#4ADE80]'
                          : 'bg-background border-border'
                      )}
                    >
                      {phase.done ? (
                        <CheckCircle2 size={14} className={phase.active ? 'text-white' : 'text-[#090909]'} />
                      ) : (
                        <Circle size={14} className="text-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-syne font-bold uppercase tracking-widest whitespace-nowrap',
                        phase.active
                          ? 'text-[#008cff]'
                          : phase.done
                          ? 'text-emerald-600'
                          : 'text-muted-foreground'
                      )}
                    >
                      {phase.label}
                    </span>
                  </div>
                  {/* Connector line (not after last) */}
                  {i < TIMELINE_PHASES.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 w-16 sm:w-24 mx-2 mb-5',
                        i < TIMELINE_PHASES.findIndex(p => p.active)
                          ? 'bg-[#4ADE80]'
                          : i === TIMELINE_PHASES.findIndex(p => p.active) - 1
                          ? 'bg-[#008cff]'
                          : 'bg-border'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Creators Assigned ─────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Users size={15} className="text-muted-foreground" />
            <h2 className="text-base font-syne font-semibold text-white">Creators Assigned</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs text-muted-foreground font-syne uppercase">Creator</th>
                <th className="px-5 py-3 text-left text-xs text-muted-foreground font-syne uppercase hidden sm:table-cell">Followers</th>
                <th className="px-5 py-3 text-left text-xs text-muted-foreground font-syne uppercase hidden sm:table-cell">Platform</th>
                <th className="px-5 py-3 text-left text-xs text-muted-foreground font-syne uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_CREATORS.map(creator => (
                <tr key={creator.handle} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-white font-syne font-medium">{creator.handle}</td>
                  <td className="px-5 py-3 text-muted-foreground font-syne hidden sm:table-cell">{creator.followers}</td>
                  <td className="px-5 py-3 text-muted-foreground font-syne hidden sm:table-cell">{creator.platform}</td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest',
                      CREATOR_STATUS_STYLES[creator.status]
                    )}>
                      {creator.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Posts Submitted ───────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Play size={15} className="text-muted-foreground" />
            <h2 className="text-base font-syne font-semibold text-white">Posts Submitted</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs text-muted-foreground font-syne uppercase">Creator</th>
                <th className="px-5 py-3 text-left text-xs text-muted-foreground font-syne uppercase hidden sm:table-cell">Platform</th>
                <th className="px-5 py-3 text-right text-xs text-muted-foreground font-syne uppercase">Views</th>
                <th className="px-5 py-3 text-right text-xs text-muted-foreground font-syne uppercase hidden sm:table-cell">Likes</th>
                <th className="px-5 py-3 text-left text-xs text-muted-foreground font-syne uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_POSTS.map(post => (
                <tr key={post.creator} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-white font-syne font-medium">{post.creator}</td>
                  <td className="px-5 py-3 text-muted-foreground font-syne hidden sm:table-cell">{post.platform}</td>
                  <td className="px-5 py-3 text-right text-foreground font-syne">{post.views}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground font-syne hidden sm:table-cell">{post.likes}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-syne font-bold uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#008cff] inline-block" />
                      <span className="text-[#008cff]">{post.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Reports ───────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <FileText size={15} className="text-muted-foreground" />
            <h2 className="text-base font-syne font-semibold text-white">Reports</h2>
          </div>
          <div className="px-5 py-10 flex flex-col items-center justify-center text-center gap-2">
            <FileText size={28} className="text-[#2A2A2A]" />
            <p className="text-sm text-muted-foreground font-syne">
              Campaign report will be published here when available.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
