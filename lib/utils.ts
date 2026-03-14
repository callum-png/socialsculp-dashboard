import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Class Name Utility ───────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Number Formatting ────────────────────────────────────────────────────────

/**
 * Formats a large number into a human-readable abbreviated string.
 * @example formatNumber(1234567) → "1.2M"
 * @example formatNumber(45000)   → "45K"
 * @example formatNumber(999)     → "999"
 */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) {
    const val = n / 1_000_000
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`
  }
  if (n >= 1_000) {
    const val = n / 1_000
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`
  }
  return String(n)
}

// ─── Currency Formatting ──────────────────────────────────────────────────────

/**
 * Formats a number as a currency string.
 * @example formatCurrency(1234)     → "$1,234"
 * @example formatCurrency(1234, 'EUR') → "€1,234"
 */
export function formatCurrency(n: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

// ─── Percent Formatting ───────────────────────────────────────────────────────

/**
 * Formats a number as a percentage string.
 * @example formatPercent(4.2)  → "4.2%"
 * @example formatPercent(100)  → "100%"
 */
export function formatPercent(n: number): string {
  const fixed = n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)
  return `${fixed}%`
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

/**
 * Formats a Date or ISO date string to a readable short date.
 * @example formatDate(new Date('2025-03-12')) → "Mar 12, 2025"
 */
export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

/**
 * Formats a date range into a compact human-readable string.
 * Shares the year when both dates are in the same year.
 * @example formatDateRange(new Date('2025-03-12'), new Date('2025-04-08')) → "Mar 12 – Apr 8, 2025"
 * @example formatDateRange(new Date('2024-12-01'), new Date('2025-01-31')) → "Dec 1, 2024 – Jan 31, 2025"
 */
export function formatDateRange(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear()

  const startStr = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  }).format(start)

  const endStr = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(end)

  return `${startStr} – ${endStr}`
}

// ─── ROAS Formatting ──────────────────────────────────────────────────────────

/**
 * Formats a ROAS value.
 * @example formatROAS(4.2) → "4.2x"
 */
export function formatROAS(n: number): string {
  return `${n.toFixed(1)}x`
}

// ─── Relative Time ────────────────────────────────────────────────────────────

/**
 * Returns a relative time string.
 * @example timeAgo(new Date(Date.now() - 3600000)) → "1 hour ago"
 */
export function timeAgo(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [604800, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ]

  for (const [interval, label] of intervals) {
    const count = Math.floor(seconds / interval)
    if (count >= 1) {
      return `${count} ${label}${count !== 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}

// ─── Slug / Handle Utilities ──────────────────────────────────────────────────

/**
 * Normalizes a creator handle by ensuring it starts with @.
 */
export function normalizeHandle(handle: string): string {
  return handle.startsWith('@') ? handle : `@${handle}`
}

// ─── Clamp ────────────────────────────────────────────────────────────────────

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ─── Budget Progress ─────────────────────────────────────────────────────────

/**
 * Returns budget utilization as a percentage (0–100).
 */
export function budgetPercent(spent: number, total: number): number {
  if (total <= 0) return 0
  return clamp(Math.round((spent / total) * 100), 0, 100)
}
