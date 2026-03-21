import Link from 'next/link'
import { Eye, ArrowLeft } from 'lucide-react'

interface PreviewBannerProps {
  userName: string
  role: string
}

export function PreviewBanner({ userName, role }: PreviewBannerProps) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-2.5 bg-amber-500/20 border-b border-amber-500/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-amber-400 text-sm font-syne">
        <Eye className="w-4 h-4" />
        <span>Admin Preview — viewing as <strong>{userName}</strong> ({role})</span>
      </div>
      <Link
        href="/admin/portals"
        className="flex items-center gap-1.5 text-amber-400 text-sm font-syne hover:text-amber-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Exit Preview
      </Link>
    </div>
  )
}
