'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { CheckCircle2, Clock, Users, Loader2 } from 'lucide-react'

type Role = 'BRAND' | 'CREATOR' | 'AGENT'

interface PendingUser {
  clerkId: string
  email: string
  name: string
  createdAt: string
}

interface ActiveUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function AdminUsersPage() {
  const [pending, setPending] = useState<PendingUser[]>([])
  const [active, setActive] = useState<ActiveUser[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const [roleSelect, setRoleSelect] = useState<Record<string, Role>>({})

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => {
        setPending(data.pending ?? [])
        setActive(data.active ?? [])
        setLoading(false)
      })
  }, [])

  async function approve(clerkId: string) {
    const role = roleSelect[clerkId] ?? 'CREATOR'
    setApproving(clerkId)
    const res = await fetch(`/api/admin/users/${clerkId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (res.ok) {
      setPending(prev => prev.filter(u => u.clerkId !== clerkId))
    }
    setApproving(null)
  }

  const ROLE_COLORS: Record<string, string> = {
    ADMIN: 'text-[#008cff] bg-blue-50 border-blue-200',
    BRAND: 'text-amber-600 bg-amber-50 border-amber-200',
    CREATOR: 'text-emerald-400 bg-emerald-50 border-emerald-200',
    AGENT: 'text-purple-600 bg-purple-50 border-purple-200',
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage access approvals and user roles"
      />

      <div className="p-6 space-y-6">

        {/* Pending Approvals */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-syne font-semibold text-white">
              Pending Approval
            </h2>
            {pending.length > 0 && (
              <span className="ml-auto text-xs font-syne bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-md">
                {pending.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 px-5 py-6 text-muted-foreground text-sm font-syne">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : pending.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground font-syne">
              No pending approvals.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-syne font-semibold uppercase tracking-widest text-muted-foreground">User</th>
                  <th className="px-5 py-3 text-left text-xs font-syne font-semibold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Signed up</th>
                  <th className="px-5 py-3 text-right text-xs font-syne font-semibold uppercase tracking-widest text-muted-foreground">Approve as</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(u => (
                  <tr key={u.clerkId} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-syne text-white text-sm">{u.name}</div>
                      <div className="font-syne text-muted-foreground text-xs">{u.email}</div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground font-syne text-xs hidden sm:table-cell">
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <select
                          value={roleSelect[u.clerkId] ?? 'CREATOR'}
                          onChange={e => setRoleSelect(prev => ({ ...prev, [u.clerkId]: e.target.value as Role }))}
                          className="bg-[#0a0a0a] border border-border rounded-md px-3 py-1.5 text-xs font-syne text-white focus:outline-none focus:border-[#008cff] transition-colors"
                        >
                          <option value="CREATOR">Creator</option>
                          <option value="BRAND">Brand</option>
                          <option value="AGENT">Agent</option>
                        </select>
                        <button
                          onClick={() => approve(u.clerkId)}
                          disabled={approving === u.clerkId}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-syne rounded-md hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
                        >
                          {approving === u.clerkId ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Active Users */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-syne font-semibold text-white">
              Active Users
            </h2>
            {active.length > 0 && (
              <span className="ml-auto text-xs font-syne text-muted-foreground">
                {active.length} total
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 px-5 py-6 text-muted-foreground text-sm font-syne">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : active.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground font-syne">No users yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-syne font-semibold uppercase tracking-widest text-muted-foreground">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-syne font-semibold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 text-right text-xs font-syne font-semibold uppercase tracking-widest text-muted-foreground">Role</th>
                </tr>
              </thead>
              <tbody>
                {active.map(u => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted transition-colors">
                    <td className="px-5 py-3 font-syne text-white">{u.name}</td>
                    <td className="px-5 py-3 font-syne text-muted-foreground text-xs hidden sm:table-cell">{u.email}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-syne font-bold uppercase tracking-widest rounded-md border ${ROLE_COLORS[u.role] ?? 'text-muted-foreground bg-muted border-border'}`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}
