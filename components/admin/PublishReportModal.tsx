'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  campaignId: string
}

export function PublishReportModal({ campaignId }: Props) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/campaign-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          title: title.trim(),
          notes: notes.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error ?? 'Failed to publish report. Please try again.')
        return
      }

      setOpen(false)
      setTitle('')
      setNotes('')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-clip-padding px-3 h-8 text-[0.8rem] font-medium font-syne text-[#008cff] whitespace-nowrap transition-all hover:bg-blue-50 select-none">
        Publish Report
      </DialogTrigger>

      <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-syne text-foreground">Publish Report</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground">
              Title <span className="text-[#FF4747]">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Week 4 Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-background border-border text-foreground placeholder:text-foreground"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-syne uppercase tracking-widest text-muted-foreground">
              Notes (optional)
            </label>
            <Textarea
              placeholder="Add any notes or summary for this report..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="bg-background border-border text-foreground placeholder:text-foreground resize-none"
            />
          </div>

          {error && (
            <p className="text-xs font-syne text-[#FF4747]">{error}</p>
          )}

          <DialogFooter className="bg-transparent border-t-0 -mx-0 -mb-0 p-0 mt-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#008cff] hover:bg-[#0078d4] text-white border-transparent w-full"
            >
              {loading ? 'Publishing…' : 'Publish Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
