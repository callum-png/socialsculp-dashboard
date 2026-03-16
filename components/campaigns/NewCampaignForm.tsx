'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PLATFORMS, CONTENT_TYPES, CONTENT_TYPE_LABELS, PLATFORM_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

// ─── Brand type ───────────────────────────────────────────────────────────────

interface BrandOption {
  id: string
  companyName: string
}

// ─── Schemas per step ─────────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  brandId: z.string().min(1, 'Please select a brand'),
})

const step2Schema = z.object({
  platform: z.enum(['TIKTOK', 'INSTAGRAM', 'BOTH']),
  contentTypes: z.array(z.string()).min(1, 'Select at least one content type'),
  totalBudget: z.coerce.number().min(1000, 'Minimum budget is $1,000'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})

const step3Schema = z.object({
  targetROAS: z.coerce.number().min(0.1, 'Target ROAS must be at least 0.1'),
  targetReach: z.coerce.number().min(1000, 'Target reach must be at least 1,000'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>

const STEPS = ['Details', 'Setup', 'Goals', 'Review']

// ─── Field components ─────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  brands: BrandOption[]
}

export function NewCampaignForm({ brands }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Step 1 form
  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: '', description: '', brandId: '' },
  })

  // Step 2 form
  const form2 = useForm<Step2Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step2Schema) as any,
    defaultValues: {
      platform: 'BOTH',
      contentTypes: [],
      totalBudget: undefined,
      startDate: '',
      endDate: '',
    },
  })

  // Step 3 form
  const form3 = useForm<Step3Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step3Schema) as any,
    defaultValues: { targetROAS: undefined, targetReach: undefined },
  })

  function handleStep1(data: Step1Data) {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep(1)
  }

  function handleStep2(data: Step2Data) {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep(2)
  }

  function handleStep3(data: Step3Data) {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep(3)
  }

  async function handleCreate() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to create campaign')
      }
      router.push('/admin/campaigns')
      router.refresh()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  const brandName = brands.find((b) => b.id === formData.brandId)?.companyName ?? '—'

  return (
    <div className="p-6 max-w-2xl">
      {/* Progress steps */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-7 h-7 flex items-center justify-center text-xs font-syne font-bold border',
                  i < step
                    ? 'bg-[#008cff] border-[#008cff] text-[#090909]'
                    : i === step
                      ? 'bg-[#1A1A1A] border-[#008cff] text-[#008cff]'
                      : 'bg-[#1A1A1A] border-[#222222] text-[#6B6860]'
                )}
              >
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-[10px] font-syne uppercase tracking-widest hidden sm:block',
                  i === step ? 'text-[#EDE8DE]' : 'text-[#6B6860]'
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px mx-3',
                  i < step ? 'bg-[#008cff]' : 'bg-[#222222]'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Name + Brand */}
      {step === 0 && (
        <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-5">
          <div className="bg-[#111111] border border-[#222222] p-6 space-y-5">
            <div>
              <Label>Campaign Name</Label>
              <input
                {...form1.register('name')}
                placeholder="e.g. Cal AI — Q1 Growth Push"
                className={inputCls(!!form1.formState.errors.name)}
              />
              <FieldError message={form1.formState.errors.name?.message} />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                {...form1.register('description')}
                rows={4}
                placeholder="Describe the campaign goals, target audience, and key messaging..."
                className={cn(inputCls(!!form1.formState.errors.description), 'resize-none')}
              />
              <FieldError message={form1.formState.errors.description?.message} />
            </div>

            <div>
              <Label>Brand</Label>
              {brands.length === 0 ? (
                <p className="text-xs font-syne text-[#FFB547]">
                  No brands yet. Add a brand account first.
                </p>
              ) : (
                <>
                  <select
                    {...form1.register('brandId')}
                    className={inputCls(!!form1.formState.errors.brandId)}
                  >
                    <option value="">Select a brand…</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.companyName}
                      </option>
                    ))}
                  </select>
                  <FieldError message={form1.formState.errors.brandId?.message} />
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={brands.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008cff] text-[#090909] text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Platform + Budget */}
      {step === 1 && (
        <form onSubmit={form2.handleSubmit(handleStep2)} className="space-y-5">
          <div className="bg-[#111111] border border-[#222222] p-6 space-y-5">
            <div>
              <Label>Platform</Label>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map((p) => (
                  <label key={p} className="cursor-pointer">
                    <input
                      type="radio"
                      value={p}
                      {...form2.register('platform')}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'px-3 py-2.5 border text-center text-xs font-syne font-bold uppercase tracking-widest transition-colors',
                        form2.watch('platform') === p
                          ? 'border-[#008cff] text-[#008cff] bg-[#001a33]'
                          : 'border-[#222222] text-[#6B6860] hover:border-[#333333]'
                      )}
                    >
                      {PLATFORM_LABELS[p]}
                    </div>
                  </label>
                ))}
              </div>
              <FieldError message={form2.formState.errors.platform?.message} />
            </div>

            <div>
              <Label>Content Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map((ct) => {
                  const checked = form2.watch('contentTypes')?.includes(ct)
                  return (
                    <label key={ct} className="cursor-pointer flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        value={ct}
                        {...form2.register('contentTypes')}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          'w-4 h-4 border flex items-center justify-center shrink-0',
                          checked
                            ? 'bg-[#008cff] border-[#008cff]'
                            : 'bg-[#1A1A1A] border-[#222222]'
                        )}
                      >
                        {checked && <Check size={10} className="text-[#090909]" />}
                      </div>
                      <span className="text-xs font-syne text-[#EDE8DE]">
                        {CONTENT_TYPE_LABELS[ct]}
                      </span>
                    </label>
                  )
                })}
              </div>
              <FieldError message={form2.formState.errors.contentTypes?.message as string} />
            </div>

            <div>
              <Label>Total Budget (USD)</Label>
              <input
                type="number"
                {...form2.register('totalBudget')}
                placeholder="e.g. 50000"
                className={inputCls(!!form2.formState.errors.totalBudget)}
              />
              <FieldError message={form2.formState.errors.totalBudget?.message} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <input
                  type="date"
                  {...form2.register('startDate')}
                  className={inputCls(!!form2.formState.errors.startDate)}
                />
                <FieldError message={form2.formState.errors.startDate?.message} />
              </div>
              <div>
                <Label>End Date</Label>
                <input
                  type="date"
                  {...form2.register('endDate')}
                  className={inputCls(!!form2.formState.errors.endDate)}
                />
                <FieldError message={form2.formState.errors.endDate?.message} />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#222222] text-[#6B6860] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#EDE8DE] hover:text-[#EDE8DE] transition-colors"
            >
              <ChevronLeft size={13} /> Back
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008cff] text-[#090909] text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Goals */}
      {step === 2 && (
        <form onSubmit={form3.handleSubmit(handleStep3)} className="space-y-5">
          <div className="bg-[#111111] border border-[#222222] p-6 space-y-5">
            <div>
              <Label>Target ROAS</Label>
              <input
                type="number"
                step="0.1"
                {...form3.register('targetROAS')}
                placeholder="e.g. 4.0"
                className={inputCls(!!form3.formState.errors.targetROAS)}
              />
              <p className="mt-1 text-[11px] font-syne text-[#6B6860]">
                Return on ad spend target (e.g. 4.0 = $4 revenue per $1 spent)
              </p>
              <FieldError message={form3.formState.errors.targetROAS?.message} />
            </div>

            <div>
              <Label>Target Reach</Label>
              <input
                type="number"
                {...form3.register('targetReach')}
                placeholder="e.g. 5000000"
                className={inputCls(!!form3.formState.errors.targetReach)}
              />
              <p className="mt-1 text-[11px] font-syne text-[#6B6860]">
                Total unique accounts you aim to reach
              </p>
              <FieldError message={form3.formState.errors.targetReach?.message} />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#222222] text-[#6B6860] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#EDE8DE] hover:text-[#EDE8DE] transition-colors"
            >
              <ChevronLeft size={13} /> Back
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008cff] text-[#090909] text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors"
            >
              Review <ChevronRight size={13} />
            </button>
          </div>
        </form>
      )}

      {/* Step 4: Review */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="bg-[#111111] border border-[#222222] p-6 space-y-4">
            <h3 className="text-sm font-syne font-bold text-[#EDE8DE] mb-4">Review Campaign</h3>

            <div className="space-y-3">
              {[
                { label: 'Campaign Name', value: formData.name },
                { label: 'Brand', value: brandName },
                { label: 'Platform', value: formData.platform ? PLATFORM_LABELS[formData.platform] : '—' },
                { label: 'Budget', value: formData.totalBudget ? `$${Number(formData.totalBudget).toLocaleString()}` : '—' },
                { label: 'Start Date', value: formData.startDate || '—' },
                { label: 'End Date', value: formData.endDate || '—' },
                { label: 'Target ROAS', value: formData.targetROAS ? `${formData.targetROAS}×` : '—' },
                { label: 'Target Reach', value: formData.targetReach ? Number(formData.targetReach).toLocaleString() : '—' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2 border-b border-[#1A1A1A]">
                  <span className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860]">
                    {row.label}
                  </span>
                  <span className="text-sm font-syne font-bold text-[#EDE8DE]">{row.value}</span>
                </div>
              ))}
            </div>

            {formData.description && (
              <div className="pt-2">
                <div className="text-[10px] font-syne uppercase tracking-widest text-[#6B6860] mb-2">
                  Description
                </div>
                <p className="text-sm font-fraunces text-[#EDE8DE]">{formData.description}</p>
              </div>
            )}

            {submitError && (
              <p className="text-xs font-syne text-[#FF4747] bg-[#1F0A0A] border border-[#4A1A1A] px-3 py-2">
                {submitError}
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#222222] text-[#6B6860] text-xs font-syne font-bold uppercase tracking-widest hover:border-[#EDE8DE] hover:text-[#EDE8DE] transition-colors disabled:opacity-40"
            >
              <ChevronLeft size={13} /> Back
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#008cff] text-[#090909] text-xs font-syne font-bold uppercase tracking-widest hover:bg-[#0077dd] transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
              {submitting ? 'Creating…' : <><Check size={13} /> Create Campaign</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
