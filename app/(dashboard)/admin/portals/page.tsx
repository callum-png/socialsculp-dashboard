import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import { PageHeader } from '@/components/shared/PageHeader'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export default async function AdminPortalsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = getDb()
  const adminUser = await db.user.findUnique({ where: { clerkId: userId } })
  if (adminUser?.role !== 'ADMIN') redirect('/admin')

  const [brands, creators, agents] = await Promise.all([
    db.user.findMany({
      where: { role: 'BRAND' },
      include: { brandProfile: { select: { companyName: true } } },
      orderBy: { name: 'asc' },
    }),
    db.user.findMany({
      where: { role: 'CREATOR' },
      include: { creatorProfile: { select: { handle: true } } },
      orderBy: { name: 'asc' },
    }),
    db.user.findMany({
      where: { role: 'AGENT' },
      orderBy: { name: 'asc' },
    }),
  ])

  function UserTable({
    users,
    role,
    previewBasePath,
    subtitle,
  }: {
    users: { id: string; name: string; email: string }[]
    role: string
    previewBasePath: string
    subtitle?: string
  }) {
    return (
      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#222222]">
          <h2 className="text-base font-syne font-semibold text-white">{role} Portal</h2>
          {subtitle && <p className="text-xs text-[#6B6860] font-syne mt-0.5">{subtitle}</p>}
        </div>
        {users.length === 0 ? (
          <p className="px-5 py-6 text-sm text-[#6B6860] font-syne">No {role.toLowerCase()} users yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#161616] transition-colors">
                  <td className="px-5 py-3 text-white font-syne">{u.name}</td>
                  <td className="px-5 py-3 text-[#6B6860] font-syne hidden sm:table-cell">{u.email}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`${previewBasePath}/${u.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-syne text-[#008cff] hover:text-white transition-colors px-3 py-1.5 border border-[#222222] rounded-md hover:border-[#008cff]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Portal Previews"
        description="View any user's portal exactly as they see it"
      />
      <div className="grid gap-6">
        <UserTable users={brands} role="Brand" previewBasePath="/admin/portals/brand" subtitle="Client-facing campaign portal" />
        <UserTable users={creators} role="Creator" previewBasePath="/admin/portals/creator" subtitle="Creator campaign & analytics portal" />
        <UserTable users={agents} role="Agent" previewBasePath="/admin/portals/agent" subtitle="Sales agent CRM portal" />
      </div>
    </div>
  )
}
