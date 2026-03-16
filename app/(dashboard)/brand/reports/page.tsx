import { PageHeader } from '@/components/shared/PageHeader'
import { StatCardGrid } from '@/components/dashboard/StatCardGrid'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { ROASAreaChart } from '@/components/charts/ROASAreaChart'
import { generateAnalyticsData } from '@/lib/mock-data'
import { Eye, TrendingUp, DollarSign, BarChart3, Download } from 'lucide-react'

export default function BrandReportsPage() {
  const analytics = generateAnalyticsData('brand-cal-ai', 30)
  const roasData = analytics.map((d) => ({ date: d.date, roas: d.roas }))

  const stats = [
    { title: 'Total Reach', value: '8.2M', icon: Eye, delta: 14.3, deltaLabel: 'vs last month' },
    { title: 'Impressions', value: '18.6M', icon: BarChart3, delta: 9.2, deltaLabel: 'vs last month' },
    { title: 'Avg ROAS', value: '4.1×', icon: TrendingUp, delta: 3.2, deltaLabel: 'vs last month', accent: true },
    { title: 'Total Spend', value: '$137K', icon: DollarSign, delta: 8.1, deltaLabel: 'vs last month' },
  ]

  return (
    <div>
      <PageHeader title="Reports" description="Last 30 Days — Cal AI">
        <span className="inline-flex items-center px-3 py-1.5 text-[10px] font-syne font-bold uppercase tracking-widest bg-[#1A1A1A] border border-[#222222] text-[#6B6860]">
          Last 30 Days
        </span>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#222222] text-[#EDE8DE] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#008cff] hover:text-[#008cff] transition-colors">
          <Download size={13} />
          Export Report
        </button>
      </PageHeader>

      <div className="p-6 space-y-6">
        <StatCardGrid stats={stats} />

        <ChartContainer
          title="ROAS Trend — Last 30 Days"
          description="Return on ad spend for your campaigns"
        >
          <ROASAreaChart data={roasData} />
        </ChartContainer>

        {/* Export notice */}
        <div className="bg-[#111111] border border-[#222222] p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-syne font-bold text-[#EDE8DE] mb-1">Full Performance Report</h3>
            <p className="text-xs font-fraunces text-[#6B6860]">
              Download a detailed PDF report with all campaign metrics, creator performance, and ROAS breakdown.
            </p>
          </div>
          <button className="shrink-0 ml-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#008cff] text-[#090909] text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors">
            <Download size={13} />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  )
}
