'use client'

import { useState } from 'react'
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

interface Props {
  deliverableId: string
  platform: string
  onSuccess: () => void
}

export function SubmitPostModal({ deliverableId, platform, onSuccess }: Props) {
  const today = new Date().toISOString().slice(0, 10)

  const [open, setOpen] = useState(false)
  const [liveUrl, setLiveUrl] = useState('')
  const [postedAt, setPostedAt] = useState(today)
  const [views, setViews] = useState('')
  const [likes, setLikes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!liveUrl.trim()) {
      setError('Post URL is required.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliverableId,
          liveUrl: liveUrl.trim(),
          platform,
          postedAt,
          views: views !== '' ? Number(views) : undefined,
          likes: likes !== '' ? Number(likes) : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error ?? 'Submission failed. Please try again.')
        return
      }

      setOpen(false)
      setLiveUrl('')
      setPostedAt(today)
      setViews('')
      setLikes('')
      onSuccess()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#003366] bg-clip-padding px-2.5 h-7 text-[0.8rem] font-medium font-syne text-[#008cff] whitespace-nowrap transition-all hover:bg-[#001a33] select-none"
      >
        Submit Live Post
      </DialogTrigger>

      <DialogContent className="bg-[#111111] border-[#222222] text-[#EDE8DE] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-syne text-[#EDE8DE]">Submit Live Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
              Post URL <span className="text-[#FF4747]">*</span>
            </label>
            <Input
              type="url"
              placeholder={
                platform === 'TIKTOK'
                  ? 'https://www.tiktok.com/@user/video/...'
                  : 'https://www.instagram.com/p/...'
              }
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              required
              className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE8DE] placeholder:text-[#3A3A3A]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
              Date Posted
            </label>
            <Input
              type="date"
              value={postedAt}
              onChange={(e) => setPostedAt(e.target.value)}
              required
              className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE8DE]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
                Views (optional)
              </label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={views}
                onChange={(e) => setViews(e.target.value)}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE8DE] placeholder:text-[#3A3A3A]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
                Likes (optional)
              </label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE8DE] placeholder:text-[#3A3A3A]"
              />
            </div>
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
              {loading ? 'Submitting…' : 'Submit Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
