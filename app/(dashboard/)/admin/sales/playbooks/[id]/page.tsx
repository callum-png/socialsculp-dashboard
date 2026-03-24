import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import { PlaybookEditorShell } from './_components/PlaybookEditorShell'
import type { Section } from '@/types/sales'

export default async function PlaybookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = getDb()

  const playbook = await db.playbook.findUnique({ where: { id } })
  if (!playbook) notFound()

  const sections = playbook.sections as Section[]

  return (
    <div>
      <PageHeader
        eyebrow="Sales"
        title={playbook.name}
        description={playbook.description ?? undefined}
        breadcrumb={[
          { label: 'Sales', href: '/admin/sales?tab=playbooks' },
          { label: playbook.name },
        ]}
      />

      <div className="p-6 max-w-3xl">
        <PlaybookEditorShell
          id={id}
          initialName={playbook.name}
          initialDescription={playbook.description ?? ''}
          initialSections={sections}
        />
      </div>
    </div>
  )
}
