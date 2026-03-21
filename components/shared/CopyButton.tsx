'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-[#6B6860] hover:text-[#EDE8DE] transition-colors"
      title="Copy URL"
    >
      {copied ? <Check size={13} className="text-[#008cff]" /> : <Copy size={13} />}
    </button>
  )
}
