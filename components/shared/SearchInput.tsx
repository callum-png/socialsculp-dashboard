'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  onSearch: (value: string) => void
  placeholder?: string
  defaultValue?: string
  className?: string
  debounce?: number
}

export function SearchInput({
  onSearch,
  placeholder = 'Search...',
  defaultValue = '',
  className,
  debounce = 300,
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onSearch(value)
    }, debounce)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, debounce, onSearch])

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search
        size={15}
        className="absolute left-3 text-[#6B6860] pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full pl-9 pr-8 py-2 bg-[#1A1A1A] border border-[#222222] text-sm font-syne text-[#EDE8DE] placeholder-[#6B6860]',
          'focus:outline-none focus:border-[#008cff] transition-colors'
        )}
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 text-[#6B6860] hover:text-[#EDE8DE] transition-colors"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
