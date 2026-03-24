import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { SalesTabBar } from './_components/SalesTabBar'
import { CallPrepsTab } from './_components/CallPrepsTab'
import { PlaybooksTab } from './_components/PlaybooksTab'

const VALID_TABS = ['call-preps', 'playbooks'] as const
type Tab = (typeof VALID_TABS)[number]

export default async function AdminSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab: rawTab } = await searchParams
  const tab: Tab = VALID_TABS.includes(rawTab as Tab)
    ? (rawTab as Tab)
    : 'call-preps'

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Sales" description="Call preps and playbooks" />

      <Suspense>
        <SalesTabBar />
      </Suspense>

      <div className="py-6">
        {tab === 'call-preps' && <CallPrepsTab />}
        {tab === 'playbooks' && <PlaybooksTab />}
      </div>
    </div>
  )
}
