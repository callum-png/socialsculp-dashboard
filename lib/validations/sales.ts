import { z } from 'zod'

export const SectionSchema = z.object({
  title: z.string().min(1),
  body: z.string(),
})

export const CreateCallPrepSchema = z.object({
  prospect: z.string().min(1),
  company: z.string().optional(),
  callType: z.string().min(1),
  scheduledAt: z.string().datetime().optional(),
})

export const UpdateCallPrepSchema = z.object({
  prospect: z.string().min(1).optional(),
  company: z.string().nullable().optional(),
  callType: z.string().min(1).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  sections: z.array(SectionSchema).optional(),
})

export const CreatePlaybookSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export const UpdatePlaybookSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  sections: z.array(SectionSchema).optional(),
})
