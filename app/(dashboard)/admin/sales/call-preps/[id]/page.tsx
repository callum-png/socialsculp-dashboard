import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getDb } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionEditorShell } from '@/components/sales/SectionEditorShell'

interface PageProps {
  params: Promise<{ id: string }>
}

function formatDate(d: Date | null) {
  if (!d) return null
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function CallPrepDetailPage({ params }: PageProps) {
  const { id } = await params
  const db = getDb()

  const callPrep = await db.callPrep.findUnique({ where: { id } })
  if (!callPrep) notFound()

  const sections = (callPrep.sections ?? []) as { title: string; body: string }[]
  const scheduledAt = callPrep.scheduledAt?.toISOString() ?? null

  return (
    <div>
      <div className="px-6 pt-6 pb-2">
        <Link
          href="/admin/sales?tab=call-preps"
          className="inline-flex items-center gap-1.5 text-xs font-syne text-[#6B6860] hover:text-[#EDE8DE] transition-colors"
        >
          <ArrowLeft size={12} />
          Back to Sales
        </Link>
      </div>

      <PageHeader
        eyebrow={callPrep.callType}
        title={callPrep.prospect}
        description={
          [callPrep.company, formatDate(callPrep.scheduledAt)]
            .filter(Boolean)
            .join(' · ') || undefined
        }
      />

      <div className="px-6 pb-12">
        <SectionEditorShell
          patchUrl={`/api/sales/call-preps/${id}`}
          sections={sections}
          extraData={{
            prospect: callPrep.prospect,
            company: callPrep.company ?? undefined,
            callType: callPrep.callType,
            scheduledAt,
          }}
        />
      </div>
    </div>
  )
}
