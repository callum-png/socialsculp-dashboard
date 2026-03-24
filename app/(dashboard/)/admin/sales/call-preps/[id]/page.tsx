import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionEditorShell } from '@/components/sales/SectionEditorShell'
import type { Section } from '@/types/sales'

export default async function CallPrepDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = getDb()

  const callPrep = await db.callPrep.findUnique({ where: { id } })
  if (!callPrep) notFound()

  const sections = callPrep.sections as Section[]

  function formatDate(d: Date | null) {
    if (!d) return null
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Sales"
        title={callPrep.prospect}
        description={
          [callPrep.callType, formatDate(callPrep.scheduledAt)]
            .filter(Boolean)
            .join(' · ') || undefined
        }
        breadcrumb={[
          { label: 'Sales', href: '/admin/sales' },
          { label: callPrep.prospect },
        ]}
      />

      <div className="p-6 max-w-3xl">
        {callPrep.company && (
          <p className="text-xs font-syne text-[#6B6860] mb-6">
            {callPrep.company}
          </p>
        )}

        <SectionEditorShell
          patchUrl={`/api/sales/call-preps/${id}`}
          sections={sections}
        />
      </div>
    </div>
  )
}
