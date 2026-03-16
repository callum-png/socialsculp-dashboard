'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NICHES } from '@/lib/constants'

const schema = z.object({
  handle: z.string().min(1, 'Handle is required').startsWith('@', 'Handle must start with @'),
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
  location: z.string().optional(),
  niche: z.array(z.string()).min(1, 'Select at least one niche'),
  tiktokFollowers: z.coerce.number().min(0).optional().or(z.literal('')),
  tiktokAvgViews: z.coerce.number().min(0).optional().or(z.literal('')),
  tiktokEngRate: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  instagramFollowers: z.coerce.number().min(0).optional().or(z.literal('')),
  instagramAvgLikes: z.coerce.number().min(0).optional().or(z.literal('')),
  instagramEngRate: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860] mb-1.5">
      {children}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-[11px] font-syne text-[#FF4747]">{message}</p>
}

function inputCls(hasError?: boolean) {
  return cn(
    'w-full px-3 py-2.5 bg-[#1A1A1A] border text-sm font-syne text-[#EDE8DE] placeholder-[#6B6860]',
    'focus:outline-none transition-colors',
    hasError ? 'border-[#FF4747] focus:border-[#FF4747]' : 'border-[#222222] focus:border-[#008cff]'
  )
}

export interface NewCreatorResult {
  id: string
  handle: string
  name: string
  niche: string[]
  tiktokFollowers: number | null
  instagramFollowers: number | null
  tiktokEngRate: number | null
  location: string | null
}

interface Props {
  onClose: () => void
  onCreated: (creator: NewCreatorResult) => void
}

export function NewCreatorModal({ onClose, onCreated }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [step, setStep] = useState<'details' | 'stats'>('details')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { handle: '@', name: '', bio: '', location: '', niche: [] },
  })

  const selectedNiches = watch('niche') ?? []

  function toggleNiche(n: string) {
    const current = selectedNiches
    setValue(
      'niche',
      current.includes(n) ? current.filter((x) => x !== n) : [...current, n],
      { shouldValidate: true }
    )
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tiktokFollowers: data.tiktokFollowers !== '' ? data.tiktokFollowers : undefined,
          tiktokAvgViews: data.tiktokAvgViews !== '' ? data.tiktokAvgViews : undefined,
          tiktokEngRate: data.tiktokEngRate !== '' ? data.tiktokEngRate : undefined,
          instagramFollowers: data.instagramFollowers !== '' ? data.instagramFollowers : undefined,
          instagramAvgLikes: data.instagramAvgLikes !== '' ? data.instagramAvgLikes : undefined,
          instagramEngRate: data.instagramEngRate !== '' ? data.instagramEngRate : undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to create creator')
      }
      const creator = await res.json()
      onCreated({
        id: creator.id,
        handle: creator.handle,
        name: creator.user.name,
        niche: creator.niche,
        tiktokFollowers: creator.tiktokFollowers,
        instagramFollowers: creator.instagramFollowers,
        tiktokEngRate: creator.tiktokEngRate,
        location: creator.location,
      })
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#0D0D0D] border border-[#222222] shadow-2xl max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#222222] shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-syne font-bold text-[#EDE8DE] uppercase tracking-widest">
                New Creator
              </h2>
              <div className="flex items-center gap-1">
                {(['details', 'stats'] as const).map((s, i) => (
                  <div key={s} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setStep(s)}
                      className={cn(
                        'text-[10px] font-syne font-bold uppercase tracking-widest px-2 py-0.5 transition-colors',
                        step === s ? 'text-[#008cff]' : 'text-[#3A3A3A]'
                      )}
                    >
                      {i + 1}. {s}
                    </button>
                    {i === 0 && <span className="text-[#3A3A3A]">/</span>}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="text-[#6B6860] hover:text-[#EDE8DE] transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              {step === 'details' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Handle</Label>
                      <input {...register('handle')} placeholder="@username" className={inputCls(!!errors.handle)} />
                      <FieldError message={errors.handle?.message} />
                    </div>
                    <div>
                      <Label>Full Name</Label>
                      <input {...register('name')} placeholder="Jane Smith" className={inputCls(!!errors.name)} />
                      <FieldError message={errors.name?.message} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Location — optional</Label>
                      <input {...register('location')} placeholder="London, UK" className={inputCls()} />
                    </div>
                    <div>
                      <Label>Bio — optional</Label>
                      <input {...register('bio')} placeholder="Short bio…" className={inputCls()} />
                    </div>
                  </div>

                  <div>
                    <Label>Niche</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {NICHES.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => toggleNiche(n)}
                          className={cn(
                            'px-2.5 py-1 text-[10px] font-syne font-bold uppercase tracking-widest border transition-colors',
                            selectedNiches.includes(n)
                              ? 'bg-[#001a33] border-[#008cff] text-[#008cff]'
                              : 'bg-[#1A1A1A] border-[#222222] text-[#6B6860] hover:border-[#333333]'
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <FieldError message={errors.niche?.message as string | undefined} />
                  </div>
                </>
              )}

              {step === 'stats' && (
                <>
                  {/* TikTok */}
                  <div>
                    <div className="text-[10px] font-syne font-bold uppercase tracking-widest text-[#008cff] mb-3">
                      TikTok
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Followers</Label>
                        <input type="number" {...register('tiktokFollowers')} placeholder="1200000" className={inputCls()} />
                      </div>
                      <div>
                        <Label>Avg Views</Label>
                        <input type="number" {...register('tiktokAvgViews')} placeholder="500000" className={inputCls()} />
                      </div>
                      <div>
                        <Label>Eng Rate %</Label>
                        <input type="number" step="0.1" {...register('tiktokEngRate')} placeholder="4.2" className={inputCls()} />
                      </div>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div>
                    <div className="text-[10px] font-syne font-bold uppercase tracking-widest text-[#008cff] mb-3">
                      Instagram
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Followers</Label>
                        <input type="number" {...register('instagramFollowers')} placeholder="800000" className={inputCls()} />
                      </div>
                      <div>
                        <Label>Avg Likes</Label>
                        <input type="number" {...register('instagramAvgLikes')} placeholder="40000" className={inputCls()} />
                      </div>
                      <div>
                        <Label>Eng Rate %</Label>
                        <input type="number" step="0.1" {...register('instagramEngRate')} placeholder="5.1" className={inputCls()} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {submitError && (
                <p className="text-xs font-syne text-[#FF4747] bg-[#1F0A0A] border border-[#4A1A1A] px-3 py-2">
                  {submitError}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#222222] shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 border border-[#222222] text-[#6B6860] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#EDE8DE] hover:text-[#EDE8DE] transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                {step === 'details' && (
                  <button
                    type="button"
                    onClick={() => setStep('stats')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008cff] text-white text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors"
                  >
                    Next: Stats
                  </button>
                )}
                {step === 'stats' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="px-4 py-2.5 border border-[#222222] text-[#6B6860] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#EDE8DE] hover:text-[#EDE8DE] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008cff] text-white text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Adding…' : <><Check size={12} /> Add Creator</>}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
