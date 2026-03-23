'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Globe, Briefcase, ArrowRight, Loader2 } from 'lucide-react'

const INDUSTRIES = [
  'AI / SaaS',
  'E-commerce',
  'Fitness & Wellness',
  'Fashion & Beauty',
  'Food & Beverage',
  'Gaming',
  'Finance & Fintech',
  'Entertainment',
  'Sports',
  'Travel',
  'Health & Wellness',
  'Tech',
  'Other',
]

export default function BrandOnboardingPage() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!companyName.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, industry, website }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
        setLoading(false)
        return
      }

      router.push('/brand')
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
            <Building2 className="w-5 h-5 text-[#008cff]" />
          </div>
          <h1 className="text-2xl font-syne font-bold text-white mb-2 tracking-tight">
            Set up your brand
          </h1>
          <p className="text-[#6B6860] font-syne text-sm leading-relaxed">
            Tell us a bit about your company so we can set up your portal correctly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company name */}
          <div>
            <label className="block text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860] mb-2">
              Company Name <span className="text-[#008cff]">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6860]" />
              <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
                required
                className="w-full bg-[#111111] border border-[#222222] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-[#6B6860] font-syne focus:outline-none focus:border-[#008cff] transition-colors"
              />
            </div>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860] mb-2">
              Industry
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6860]" />
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full bg-[#111111] border border-[#222222] rounded-lg pl-10 pr-4 py-3 text-sm text-white font-syne focus:outline-none focus:border-[#008cff] transition-colors appearance-none"
              >
                <option value="">Select industry…</option>
                {INDUSTRIES.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-syne font-semibold uppercase tracking-widest text-[#6B6860] mb-2">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6860]" />
              <input
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
                type="url"
                className="w-full bg-[#111111] border border-[#222222] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-[#6B6860] font-syne focus:outline-none focus:border-[#008cff] transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-syne">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !companyName.trim()}
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
