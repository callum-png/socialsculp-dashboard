'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AtSign, FileText, ArrowRight, Loader2 } from 'lucide-react'

const NICHES = [
  'Lifestyle', 'Fashion', 'Beauty', 'Fitness', 'Tech', 'Gaming',
  'Food', 'Travel', 'Finance', 'Education', 'Entertainment', 'Sports',
]

export default function CreatorOnboardingPage() {
  const router = useRouter()
  const [handle, setHandle] = useState('')
  const [bio, setBio] = useState('')
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [tiktokHandle, setTiktokHandle] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleNiche(n: string) {
    setSelectedNiches(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!handle.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle,
          bio,
          niche: selectedNiches,
          tiktokHandle,
          instagramHandle,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
        setLoading(false)
        return
      }

      router.push('/creator')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-10">
          <div className="w-12 h-12 rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-center mb-6">
            <AtSign className="w-5 h-5 text-[#008cff]" />
          </div>
          <h1 className="text-2xl font-syne font-bold text-white mb-2 tracking-tight">
            Set up your creator profile
          </h1>
          <p className="text-[#6B6860] font-syne text-sm leading-relaxed">
            Help us understand your audience so we can match you with the right campaigns.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Handle */}
          <div>
            <label className="block text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860] mb-2">
              Your Handle <span className="text-[#008cff]">*</span>
            </label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6860]" />
              <input
                value={handle}
                onChange={e => setHandle(e.target.value)}
                placeholder="yourusername"
                required
                className="w-full bg-[#111111] border border-[#222222] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-[#6B6860] font-syne focus:outline-none focus:border-[#008cff] transition-colors"
              />
            </div>
          </div>

          {/* TikTok + Instagram */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860] mb-2">
                TikTok
              </label>
              <input
                value={tiktokHandle}
                onChange={e => setTiktokHandle(e.target.value)}
                placeholder="@handle"
                className="w-full bg-[#111111] border border-[#222222] rounded-lg px-4 py-3 text-sm text-white placeholder-[#6B6860] font-syne focus:outline-none focus:border-[#008cff] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860] mb-2">
                Instagram
              </label>
              <input
                value={instagramHandle}
                onChange={e => setInstagramHandle(e.target.value)}
                placeholder="@handle"
                className="w-full bg-[#111111] border border-[#222222] rounded-lg px-4 py-3 text-sm text-white placeholder-[#6B6860] font-syne focus:outline-none focus:border-[#008cff] transition-colors"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860] mb-2">
              Bio
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-[#6B6860]" />
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell brands about yourself…"
                rows={3}
                className="w-full bg-[#111111] border border-[#222222] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-[#6B6860] font-syne focus:outline-none focus:border-[#008cff] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Niches */}
          <div>
            <label className="block text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860] mb-2">
              Your Niche
            </label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleNiche(n)}
                  className={`px-3 py-1.5 text-xs font-syne rounded-md border transition-colors ${
                    selectedNiches.includes(n)
                      ? 'bg-[#008cff]/10 border-[#008cff]/40 text-[#008cff]'
                      : 'bg-[#111111] border-[#222222] text-[#6B6860] hover:border-[#333] hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-syne">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !handle.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[#008cff] hover:bg-[#0070cc] text-white text-sm font-syne font-semibold py-3 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
