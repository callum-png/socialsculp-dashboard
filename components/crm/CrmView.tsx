'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Upload, Download, Users, Building2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { CsvImportModal } from './CsvImportModal'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadType = 'BRAND' | 'CREATOR'
interface Lead { id: string; type: LeadType; name: string; company?: string | null; email?: string | null; phone?: string | null; notes?: string | null; source?: string | null; createdBy?: { name: string } }

type SalesDealStage = 'APPOINTMENT_SET' | 'QUALIFIED' | 'DECISION_MAKER' | 'PROPOSAL_SENT' | 'CLOSED_WON' | 'CLOSED_LOST'
interface SalesDeal { id: string; title: string; stage: SalesDealStage; value?: number | null; notes?: string | null; lead?: Lead | null; createdBy?: { name: string } }

const STAGES: { id: SalesDealStage; label: string; desc: string }[] = [
  { id: 'APPOINTMENT_SET', label: 'Appointment Set', desc: 'Initial meeting booked' },
  { id: 'QUALIFIED', label: 'Qualified', desc: 'Budget confirmed' },
  { id: 'DECISION_MAKER', label: 'Decision Maker', desc: 'Key person bought in' },
  { id: 'PROPOSAL_SENT', label: 'Proposal Sent', desc: 'Campaign proposal sent' },
  { id: 'CLOSED_WON', label: 'Closed Won', desc: 'Signed ✓' },
  { id: 'CLOSED_LOST', label: 'Closed Lost', desc: 'Not moving forward' },
]

const STAGE_COLORS: Record<SalesDealStage, string> = {
  APPOINTMENT_SET: 'text-[#6B6860] bg-[#1A1A1A] border-[#222222]',
  QUALIFIED: 'text-[#008cff] bg-[#001a33] border-[#003366]',
  DECISION_MAKER: 'text-[#FFB547] bg-[#1F1200] border-[#3D2400]',
  PROPOSAL_SENT: 'text-[#A78BFA] bg-[#1A1033] border-[#2D1F55]',
  CLOSED_WON: 'text-[#34D399] bg-[#001A0E] border-[#00331B]',
  CLOSED_LOST: 'text-[#FF4747] bg-[#1F0A0A] border-[#4A1A1A]',
}

function inputCls() { return 'w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#222222] text-sm font-syne text-[#EDE8DE] placeholder-[#6B6860] focus:outline-none focus:border-[#008cff] transition-colors' }
function Label({ children }: { children: React.ReactNode }) { return <label className="block text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860] mb-1.5">{children}</label> }

// ─── Export helper ────────────────────────────────────────────────────────────

function exportCsv(leads: Lead[], filename: string) {
  const headers = ['Name', 'Type', 'Company', 'Email', 'Phone', 'Notes', 'Source', 'Agent']
  const rows = leads.map(l => [l.name, l.type, l.company || '', l.email || '', l.phone || '', l.notes || '', l.source || '', l.createdBy?.name || ''].map(v => `"${v.replace(/"/g, '""')}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ─── New Lead Modal ───────────────────────────────────────────────────────────

function NewLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: (l: Lead) => void }) {
  const [type, setType] = useState<LeadType>('BRAND')
  const [name, setName] = useState(''); const [company, setCompany] = useState(''); const [email, setEmail] = useState('')
  const [phone, setPhone] = useState(''); const [notes, setNotes] = useState(''); const [source, setSource] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!name.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/crm/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, name, company, email, phone, notes, source }) })
    onCreated(await res.json()); onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0D0D0D] border border-[#222222] shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#222222]">
            <h2 className="text-sm font-syne font-bold text-[#EDE8DE] uppercase tracking-widest">New Lead</h2>
            <button onClick={onClose} className="text-[#6B6860] hover:text-[#EDE8DE]"><X size={16} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex gap-2">
              {(['BRAND', 'CREATOR'] as LeadType[]).map(t => (
                <button key={t} type="button" onClick={() => setType(t)} className={cn('px-3 py-1.5 text-[10px] font-syne font-bold uppercase tracking-widest border transition-colors', type === t ? 'bg-[#001a33] border-[#008cff] text-[#008cff]' : 'bg-[#1A1A1A] border-[#222222] text-[#6B6860]')}>{t}</button>
              ))}
            </div>
            <div><Label>Name</Label><input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className={inputCls()} /></div>
            {type === 'BRAND' && <div><Label>Company — optional</Label><input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name" className={inputCls()} /></div>}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email — optional</Label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@…" className={inputCls()} /></div>
              <div><Label>Phone — optional</Label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44…" className={inputCls()} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Source — optional</Label><input value={source} onChange={e => setSource(e.target.value)} placeholder="e.g. Instagram, Referral" className={inputCls()} /></div>
              <div><Label>Notes — optional</Label><input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Context…" className={inputCls()} /></div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={onClose} className="px-4 py-2.5 border border-[#222222] text-[#6B6860] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#EDE8DE] hover:text-[#EDE8DE] transition-colors">Cancel</button>
              <button onClick={submit} disabled={submitting || !name.trim()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008cff] text-white text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors disabled:opacity-40">
                {submitting ? 'Adding…' : 'Add Lead'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── New Sales Deal Modal ─────────────────────────────────────────────────────

function NewSalesDealModal({ leads, onClose, onCreated }: { leads: Lead[]; onClose: () => void; onCreated: (d: SalesDeal) => void }) {
  const [title, setTitle] = useState(''); const [value, setValue] = useState(''); const [leadId, setLeadId] = useState(''); const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!title.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/crm/sales-deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, value: value || undefined, leadId: leadId || undefined, notes }) })
    onCreated(await res.json()); onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0D0D0D] border border-[#222222] shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#222222]">
            <h2 className="text-sm font-syne font-bold text-[#EDE8DE] uppercase tracking-widest">New Sales Deal</h2>
            <button onClick={onClose} className="text-[#6B6860] hover:text-[#EDE8DE]"><X size={16} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div><Label>Deal Title</Label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Acme Brand — Q2 Campaign" className={inputCls()} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Value (£) — optional</Label><input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="20000" className={inputCls()} /></div>
              <div><Label>Link to Lead — optional</Label>
                <select value={leadId} onChange={e => setLeadId(e.target.value)} className={inputCls()}>
                  <option value="">No lead linked</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.name}{l.company ? ` — ${l.company}` : ''}</option>)}
                </select>
              </div>
            </div>
            <div><Label>Notes — optional</Label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={cn(inputCls(), 'resize-none')} /></div>
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={onClose} className="px-4 py-2.5 border border-[#222222] text-[#6B6860] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#EDE8DE] hover:text-[#EDE8DE] transition-colors">Cancel</button>
              <button onClick={submit} disabled={submitting || !title.trim()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008cff] text-white text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors disabled:opacity-40">
                {submitting ? 'Adding…' : 'Add Deal'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main CRM View ────────────────────────────────────────────────────────────

interface Props {
  isAdmin?: boolean
  title?: string
}

export function CrmView({ isAdmin = false, title = 'CRM' }: Props) {
  const [tab, setTab] = useState<'leads' | 'pipeline'>('leads')
  const [leadTab, setLeadTab] = useState<LeadType>('BRAND')
  const [leads, setLeads] = useState<Lead[]>([])
  const [deals, setDeals] = useState<SalesDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewLead, setShowNewLead] = useState(false)
  const [showNewDeal, setShowNewDeal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [agentFilter, setAgentFilter] = useState<string>('all')

  useEffect(() => {
    Promise.all([
      fetch('/api/crm/leads').then(r => r.json()),
      fetch('/api/crm/sales-deals').then(r => r.json()),
    ]).then(([l, d]) => { setLeads(Array.isArray(l) ? l : []); setDeals(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  async function moveStage(dealId: string, stage: SalesDealStage) {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage } : d))
    await fetch('/api/crm/sales-deals', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: dealId, stage }) })
  }

  function handleImported(count: number) {
    fetch('/api/crm/leads').then(r => r.json()).then(l => setLeads(Array.isArray(l) ? l : []))
  }

  // Unique agents for filter (admin only)
  const agents = isAdmin ? Array.from(new Map(leads.filter(l => l.createdBy).map(l => [l.createdBy!.name, l.createdBy!.name])).values()) : []

  const filteredLeads = leads.filter(l => {
    if (l.type !== leadTab) return false
    if (isAdmin && agentFilter !== 'all' && l.createdBy?.name !== agentFilter) return false
    return true
  })

  return (
    <div>
      <PageHeader title={title} description={`${leads.length} lead${leads.length === 1 ? '' : 's'}`}>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-2 px-3 py-2 border border-[#222222] text-[#6B6860] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#008cff] hover:text-[#008cff] transition-colors">
            <Upload size={12} /> Import CSV
          </button>
          <button onClick={() => exportCsv(leads, 'socialsculp-leads.csv')} className="inline-flex items-center gap-2 px-3 py-2 border border-[#222222] text-[#6B6860] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#008cff] hover:text-[#008cff] transition-colors">
            <Download size={12} /> Export CSV
          </button>
          {tab === 'leads' && <button onClick={() => setShowNewLead(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#008cff] text-white text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors"><Plus size={13} /> New Lead</button>}
          {tab === 'pipeline' && <button onClick={() => setShowNewDeal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#008cff] text-white text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors"><Plus size={13} /> New Deal</button>}
        </div>
      </PageHeader>

      {/* Tabs */}
      <div className="flex border-b border-[#222222] px-6">
        {(['leads', 'pipeline'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-3 text-xs font-syne font-bold uppercase tracking-widest border-b-2 transition-colors -mb-px', tab === t ? 'border-[#008cff] text-[#008cff]' : 'border-transparent text-[#6B6860] hover:text-[#EDE8DE]')}>{t}</button>
        ))}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-16 text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">Loading…</div>
        ) : tab === 'leads' ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-2">
                <button onClick={() => setLeadTab('BRAND')} className={cn('inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-syne font-bold uppercase tracking-widest border transition-colors', leadTab === 'BRAND' ? 'bg-[#001a33] border-[#008cff] text-[#008cff]' : 'bg-[#1A1A1A] border-[#222222] text-[#6B6860]')}>
                  <Building2 size={11} /> Brands ({leads.filter(l => l.type === 'BRAND').length})
                </button>
                <button onClick={() => setLeadTab('CREATOR')} className={cn('inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-syne font-bold uppercase tracking-widest border transition-colors', leadTab === 'CREATOR' ? 'bg-[#001a33] border-[#008cff] text-[#008cff]' : 'bg-[#1A1A1A] border-[#222222] text-[#6B6860]')}>
                  <Users size={11} /> Creators ({leads.filter(l => l.type === 'CREATOR').length})
                </button>
              </div>

              {/* Agent filter — admin only */}
              {isAdmin && agents.length > 0 && (
                <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} className="px-3 py-1.5 bg-[#1A1A1A] border border-[#222222] text-xs font-syne text-[#EDE8DE] focus:outline-none focus:border-[#008cff]">
                  <option value="all">All Agents</option>
                  {agents.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              )}
            </div>

            <div className="bg-[#111111] border border-[#222222]">
              {filteredLeads.length === 0 ? (
                <div className="px-5 py-14 text-center text-[#3A3A3A] font-syne text-xs uppercase tracking-widest">No leads yet</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1A1A1A]">
                      {['Name', leadTab === 'BRAND' ? 'Company' : 'Handle', 'Email', 'Phone', 'Source', 'Notes', ...(isAdmin ? ['Agent'] : [])].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]">
                    {filteredLeads.map(l => (
                      <tr key={l.id} className="hover:bg-[#0D0D0D] transition-colors">
                        <td className="px-4 py-3 text-sm font-syne font-bold text-[#EDE8DE]">{l.name}</td>
                        <td className="px-4 py-3 text-sm font-fraunces text-[#6B6860]">{l.company || '—'}</td>
                        <td className="px-4 py-3 text-sm font-fraunces text-[#6B6860]">{l.email || '—'}</td>
                        <td className="px-4 py-3 text-sm font-fraunces text-[#6B6860]">{l.phone || '—'}</td>
                        <td className="px-4 py-3 text-sm font-fraunces text-[#6B6860]">{l.source || '—'}</td>
                        <td className="px-4 py-3 text-sm font-fraunces text-[#6B6860] max-w-[160px] truncate">{l.notes || '—'}</td>
                        {isAdmin && <td className="px-4 py-3"><span className="text-[10px] font-syne uppercase tracking-widest text-[#008cff] bg-[#001a33] border border-[#003366] px-1.5 py-0.5">{l.createdBy?.name || 'Admin'}</span></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
            {STAGES.map(stage => {
              const colDeals = deals.filter(d => d.stage === stage.id)
              return (
                <div key={stage.id} className="flex flex-col flex-shrink-0 w-60 bg-[#0D0D0D] border border-[#222222]">
                  <div className="px-3.5 py-3 border-b border-[#222222]">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn('inline-flex items-center px-2 py-0.5 text-[10px] font-syne font-bold uppercase tracking-widest border', STAGE_COLORS[stage.id])}>{stage.label}</span>
                      <span className="text-[11px] font-syne font-bold text-[#6B6860] bg-[#1A1A1A] border border-[#222222] px-1.5 py-0.5">{colDeals.length}</span>
                    </div>
                    <p className="text-[10px] font-fraunces text-[#3A3A3A] mt-1">{stage.desc}</p>
                  </div>
                  <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto">
                    {colDeals.map(deal => (
                      <div key={deal.id} className="bg-[#111111] border border-[#222222] p-3.5">
                        <div className="font-syne font-bold text-sm text-[#EDE8DE] mb-1 truncate">{deal.title}</div>
                        {deal.lead && <div className="font-fraunces text-xs text-[#6B6860] truncate mb-1">{deal.lead.name}{deal.lead.company ? ` — ${deal.lead.company}` : ''}</div>}
                        {isAdmin && deal.createdBy && <div className="text-[10px] font-syne text-[#008cff] mb-1">{deal.createdBy.name}</div>}
                        {deal.value && <div className="text-xs font-syne font-bold text-[#008cff] mb-2">£{Number(deal.value).toLocaleString()}</div>}
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-[#1A1A1A]">
                          {STAGES.filter(s => s.id !== stage.id).slice(0, 2).map(s => (
                            <button key={s.id} onClick={() => moveStage(deal.id, s.id)} className="text-[9px] font-syne uppercase tracking-widest text-[#6B6860] hover:text-[#008cff] border border-[#1A1A1A] hover:border-[#008cff] px-1.5 py-0.5 transition-colors">→ {s.label.split(' ')[0]}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {colDeals.length === 0 && <div className="flex-1 flex items-center justify-center py-8"><span className="text-[11px] font-syne text-[#3A3A3A] uppercase tracking-widest">Empty</span></div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showNewLead && <NewLeadModal onClose={() => setShowNewLead(false)} onCreated={l => setLeads(prev => [l, ...prev])} />}
      {showNewDeal && <NewSalesDealModal leads={leads} onClose={() => setShowNewDeal(false)} onCreated={d => setDeals(prev => [d, ...prev])} />}
      {showImport && <CsvImportModal onClose={() => setShowImport(false)} onImported={handleImported} />}
    </div>
  )
}
