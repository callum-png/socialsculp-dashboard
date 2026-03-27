'use client'

import type { OpenClawData } from './MissionControlClient'

interface TabProps {
  data: OpenClawData | null
  executeCommand: (cmd: string) => Promise<{ output: string; exitCode: number }>
  onRefresh: () => void
}

export function CronJobsTab({}: TabProps) {
  return (
    <div className="rounded-lg bg-[#111111] border border-[#222222] p-6">
      <p className="text-[#EDE8DE] font-syne font-semibold">Cron Jobs</p>
      <p className="text-[#6B6860] text-sm mt-1">Coming soon</p>
    </div>
  )
}
