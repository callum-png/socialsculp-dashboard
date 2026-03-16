'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  website: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

const INDUSTRIES = ['Fashion', 'Beauty', 'Tech', 'Food & Beverage', 'Fitness', 'Gaming', 'Finance', 'Travel', 'Entertainment', 'Retail', 'Healthcare', 'Other']

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-syne font-bold uppercase tracking-widest text-[#6B6860] mb-1.5">{children}</label>
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-[11px] font-syne text-[#FF4747]">{message}</p>
}

function inputCls(hasError?: boolean) {
  return cn(
    'w-full px-3 py-2.5 bg-[#1A1A1A] border text-sm font-syne text-[#EDE8DE] placeholder-[#6B6860] focus:outline-none transition-colors',
    hasError ? 'border-[#FF4747]' : 'border-[#222222] focus:border-[#008cff]'
  )
}

export interface NewBrandResult {
  id: string
  companyName: string
  industry: string | null
  website: string | null
}

interface Props {
  onClose: () => void
  onCreated: (brand: NewBrandResult) => void
}

export function NewBrandModal({ onClose, onCreated }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { companyName: '', industry: '', website: '', contactName: '', contactEmail: '' },
  })

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to create brand')
      const brand = await res.json()
      onCreated({ id: brand.id, companyName: brand.companyName, industry: brand.industry, website: brand.website })
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
        <div className="w-full max-w-md bg-[#0D0D0D] border border-[#222222] shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#222222]">
            <h2 className="text-sm font-syne font-bold text-[#EDE8DE] uppercase tracking-widest">New Brand</h2>
            <button onClick={onClose} className="text-[#6B6860] hover:text-[#EDE8DE] transition-colors"><X size={16} /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
            <div>
              <Label>Company Name</Label>
              <input {...register('companyName')} placeholder="e.g. Acme Co." className={inputCls(!!errors.companyName)} />
              <FieldError message={errors.companyName?.message} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Industry — optional</Label>
                <select {...register('industry')} className={inputCls()}>
                  <option value="">Select…</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <Label>Website — optional</Label>
                <input {...register('website')} placeholder="https://…" className={inputCls()} />
              </div>
            </div>

            <div className="pt-1 border-t border-[#1A1A1A]">
              <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-3">Contact — optional</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Name</Label>
                  <input {...register('contactName')} placeholder="Jane Smith" className={inputCls()} />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <input {...register('contactEmail')} placeholder="jane@…" className={inputCls(!!errors.contactEmail)} />
                  <FieldError message={errors.contactEmail?.message} />
                </div>
              </div>
            </div>

            {submitError && (
              <p className="text-xs font-syne text-[#FF4747] bg-[#1F0A0A] border border-[#4A1A1A] px-3 py-2">{submitError}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2.5 border border-[#222222] text-[#6B6860] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#EDE8DE] hover:text-[#EDE8DE] transition-colors disabled:opacity-40">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008cff] text-white text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors disabled:opacity-40">
                {submitting ? 'Adding…' : <><Check size={12} /> Add Brand</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
