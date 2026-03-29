import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { MissionControlTabBar } from './_components/MissionControlTabBar'
import { MissionControlClient } from './_components/MissionControlClient'

const VALID_TABS = ['brief', 'overview', 'tasks', 'crons', 'tokens', 'revenue', 'workflows', 'terminal'] as const
type Tab = (typeof VALID_TABS)[number]

export default async function MissionControlPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab: rawTab } = await searchParams
  const tab: Tab = VALID_TABS.includes(rawTab as Tab)
    ? (rawTab as Tab)
    : 'brief'

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Mission Control"
        description="OpenClaw AI — real-time monitoring and command center"
      />

      <Suspense>
        <MissionControlTabBar />
      </Suspense>

      <div className="py-6">
        <MissionControlClient activeTab={tab} />
      </div>
    </div>
  )
}
