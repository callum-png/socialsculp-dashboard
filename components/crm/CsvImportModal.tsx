'use client'

import { useState, useRef } from 'react'
import { X, Upload, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ParsedRow { name: string; type: string; company: string; email: string; phone: string; notes: string; source: string }

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''))
  return lines.slice(1).map(line => {
    // Handle quoted fields
    const fields: string[] = []
    let cur = '', inQ = false
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ }
      else if (ch === ',' && !inQ) { fields.push(cur.trim()); cur = '' }
      else cur += ch
    }
    fields.push(cur.trim())

    const get = (keys: string[]) => {
      for (const k of keys) {
        const idx = headers.findIndex(h => h.includes(k))
        if (idx !== -1) return fields[idx] || ''
      }
      return ''
    }

    return {
      name: get(['name', 'fullname', 'contact']),
      type: get(['type', 'leadtype', 'category']),
      company: get(['company', 'brand', 'organisation', 'organization']),
      email: get(['email', 'mail']),
      phone: get(['phone', 'mobile', 'tel']),
      notes: get(['notes', 'note', 'comments']),
      source: get(['source', 'origin']),
    }
  }).filter(r => r.name)
}

interface Props {
  onClose: () => void
  onImported: (count: number) => void
}

export function CsvImportModal({ onClose, onImported }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setError(null)
    if (!file.name.endsWith('.csv')) { setError('Please upload a .csv file'); return }
    const reader = new FileReader()
    reader.onload = e => {
      const parsed = parseCSV(e.target?.result as string)
      if (parsed.length === 0) { setError('No valid rows found. Make sure your CSV has a header row with a "name" column.'); return }
      setRows(parsed)
      setFileName(file.name)
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    setImporting(true)
    const res = await fetch('/api/crm/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows),
    })
    const data = await res.json()
    onImported(data.imported ?? rows.length)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-background border border-border shadow-2xl max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <h2 className="text-sm font-syne font-bold text-foreground uppercase tracking-widest">Import CSV</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
          </div>

          <div className="p-5 flex flex-col gap-4 overflow-hidden flex-1">
            {/* Expected format */}
            <div className="bg-card border border-border p-3">
              <div className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground mb-2">Expected CSV columns</div>
              <code className="text-xs font-mono text-[#008cff]">name, type, company, email, phone, notes, source</code>
              <p className="text-[11px] font-syne text-muted-foreground mt-1">Only <strong className="text-foreground">name</strong> is required. Type should be BRAND or CREATOR (defaults to BRAND).</p>
            </div>

            {/* Drop zone */}
            {rows.length === 0 && (
              <div
                className="border-2 border-dashed border-border hover:border-[#008cff] transition-colors p-10 text-center cursor-pointer"
                onClick={() => inputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              >
                <Upload size={24} className="mx-auto mb-3 text-foreground" />
                <p className="text-sm font-syne text-muted-foreground">Drop your CSV here or <span className="text-[#008cff]">click to browse</span></p>
                <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-xs font-syne text-red-600 bg-red-50 border border-red-200 px-3 py-2">
                <AlertCircle size={13} /> {error}
              </div>
            )}

            {/* Preview */}
            {rows.length > 0 && (
              <div className="flex flex-col gap-3 overflow-hidden flex-1">
                <div className="flex items-center justify-between shrink-0">
                  <div className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground">
                    Preview — {rows.length} rows from <span className="text-foreground">{fileName}</span>
                  </div>
                  <button onClick={() => { setRows([]); setFileName('') }} className="text-[10px] font-syne text-muted-foreground hover:text-red-600 uppercase tracking-widest">Clear</button>
                </div>
                <div className="overflow-auto flex-1 border border-border">
                  <table className="w-full text-xs font-syne min-w-[600px]">
                    <thead className="bg-card sticky top-0">
                      <tr>{['Name', 'Type', 'Company', 'Email', 'Phone', 'Notes'].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.slice(0, 50).map((r, i) => (
                        <tr key={i} className="hover:bg-card">
                          <td className="px-3 py-2 text-foreground font-bold">{r.name}</td>
                          <td className="px-3 py-2"><span className={cn('px-1.5 py-0.5 text-[9px] uppercase tracking-widest border', r.type?.toUpperCase() === 'CREATOR' ? 'text-[#008cff] bg-blue-50 border-blue-200' : 'text-amber-600 bg-[#1F1200] border-[#3D2400]')}>{r.type || 'BRAND'}</span></td>
                          <td className="px-3 py-2 text-muted-foreground">{r.company || '—'}</td>
                          <td className="px-3 py-2 text-muted-foreground">{r.email || '—'}</td>
                          <td className="px-3 py-2 text-muted-foreground">{r.phone || '—'}</td>
                          <td className="px-3 py-2 text-muted-foreground max-w-[150px] truncate">{r.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rows.length > 50 && <p className="px-3 py-2 text-[10px] font-syne text-muted-foreground">…and {rows.length - 50} more rows</p>}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border shrink-0">
            <button onClick={onClose} className="px-4 py-2.5 border border-border text-muted-foreground text-xs font-syne font-bold uppercase tracking-widest hover:border-[#EDE8DE] hover:text-foreground transition-colors">Cancel</button>
            {rows.length > 0 && (
              <button onClick={handleImport} disabled={importing} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008cff] text-white text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors disabled:opacity-40">
                {importing ? 'Importing…' : <><Check size={12} /> Import {rows.length} Leads</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
