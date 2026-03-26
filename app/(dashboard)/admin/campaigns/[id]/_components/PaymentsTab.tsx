"use client"

import { CreditCard, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Creator {
  _id?: any
  name: string
  agreedFee?: number
  status?: string
  paymentStatus?: string
  paymentDate?: string
  [key: string]: any
}

interface Campaign {
  _id?: any
  name?: string
  budget?: number
  spent?: number
  [key: string]: any
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/* ------------------------------------------------------------------ */
/*  Payment status badge                                               */
/* ------------------------------------------------------------------ */
function PaymentStatusBadge({
  status,
}: {
  status: string
}) {
  const map: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500",
    paid: "bg-emerald-500/10 text-emerald-500",
    overdue: "bg-destructive/10 text-destructive",
  }
  const label = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        map[status] ?? "bg-secondary text-secondary-foreground"
      )}
    >
      {label}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface PaymentsTabProps {
  creators: Creator[] | null | undefined
  campaign: Campaign | null | undefined
}

export function PaymentsTab({ creators, campaign }: PaymentsTabProps) {
  const budget = campaign?.budget ?? 10000
  const spent = campaign?.spent ?? 0
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0

  const paymentRows = (creators ?? []).filter(
    (c) => c.agreedFee !== undefined && c.agreedFee > 0
  )

  return (
    <div className="space-y-5">
      {/* ---- Budget overview ---- */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="size-4 text-muted-foreground" />
            Budget Overview
          </h3>
          <p className="text-xs text-muted-foreground">
            <span className="stat-number tabular-nums">
              {formatCurrency(spent)}
            </span>{" "}
            of{" "}
            <span className="stat-number tabular-nums">
              {formatCurrency(budget)}
            </span>
          </p>
        </div>

        {/* progress bar */}
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="stat-number tabular-nums">
            {percentage.toFixed(0)}%
          </span>{" "}
          of budget used
        </p>
      </div>

      {/* ---- Payment table ---- */}
      {paymentRows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
          <CreditCard className="mx-auto size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No payment records
          </p>
          <p className="text-xs text-muted-foreground/60">
            Payment information will appear once creator fees are set.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* header */}
          <div className="hidden sm:grid grid-cols-4 gap-4 px-4 py-2.5 border-b border-border text-xs font-medium text-muted-foreground">
            <span>Creator</span>
            <span className="text-right">Agreed Fee</span>
            <span className="text-center">Status</span>
            <span className="text-right">Date</span>
          </div>

          {/* rows */}
          {paymentRows.map((creator, idx) => (
            <div
              key={creator._id ?? idx}
              className={cn(
                "grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 px-4 py-3 items-center",
                idx < paymentRows.length - 1 && "border-b border-border"
              )}
            >
              {/* creator */}
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
                  {creator.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <span className="text-sm font-medium truncate">
                  {creator.name}
                </span>
              </div>

              {/* fee */}
              <p className="stat-number text-sm tabular-nums sm:text-right">
                {formatCurrency(creator.agreedFee ?? 0)}
              </p>

              {/* status */}
              <div className="sm:text-center">
                <PaymentStatusBadge
                  status={creator.paymentStatus ?? "pending"}
                />
              </div>

              {/* date */}
              <p className="text-xs text-muted-foreground sm:text-right">
                {creator.paymentDate
                  ? formatDate(creator.paymentDate)
                  : "--"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
