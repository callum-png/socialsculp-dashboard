'use client'

export default function FinancePage() {
  return (
    <div className="h-[calc(100vh-2rem)] w-full">
      <iframe
        src="/finance-tracker.html"
        className="w-full h-full border-0 rounded-lg"
        title="Finance Tracker"
      />
    </div>
  )
}
