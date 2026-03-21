'use client'

import { useRouter } from 'next/navigation'
import { SubmitPostModal } from './SubmitPostModal'

interface Props {
  deliverableId: string
  platform: string
}

export function SubmitPostButton({ deliverableId, platform }: Props) {
  const router = useRouter()

  return (
    <SubmitPostModal
      deliverableId={deliverableId}
      platform={platform}
      onSuccess={() => router.refresh()}
    />
  )
}
