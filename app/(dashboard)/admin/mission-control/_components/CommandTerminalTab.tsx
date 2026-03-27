'use client'

import { useState, useRef, useEffect } from 'react'
import type { OpenClawData } from './MissionControlClient'
import {
  HeartPulse,
  Users,
  Clock,
  Radio,
  FileText,
  Cpu,
  List,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react'

interface TabProps {
  data: OpenClawData | null
  executeCommand: (cmd: string) => Promise<{ output: string; exitCode: number }>
  onRefresh: () => void
}

interface CommandEntry {
  command: string
  output: string
  exitCode: number
  timestamp: string
}

const QUICK_ACTIONS = [
  { label: 'Health Check', cmd: 'openclaw health', icon: HeartPulse },
  { label: 'Agent Status', cmd: 'openclaw agents list', icon: Users },
  { label: 'Cron Status', cmd: 'openclaw cron list --json', icon: Clock },
  { label: 'Gateway Status', cmd: 'openclaw gateway status', icon: Radio },
  { label: 'View Logs', cmd: 'tail /root/.openclaw/logs/config-audit.jsonl -n 20', icon: FileText },
  { label: 'System Info', cmd: 'uptime && free -h && df -h', icon: Cpu },
  { label: 'Process List', cmd: 'ps aux | grep openclaw', icon: List },
  { label: 'Restart Gateway', cmd: 'openclaw gateway restart', icon: RotateCcw },
]

export function CommandTerminalTab({ data, executeCommand }: TabProps) {
  const [history, setHistory] = useState<CommandEntry[]>([])
  const [input, setInput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent commands from data on mount
  useEffect(() => {
    if (data?.recentCommands?.length) {
      const loaded: CommandEntry[] = data.recentCommands.map((cmd: any) => ({
        command: cmd.command ?? cmd.cmd ?? '',
        output: cmd.output ?? cmd.result ?? '',
        exitCode: cmd.exitCode ?? cmd.exit_code ?? 0,
        timestamp: cmd.timestamp ?? cmd.receivedAt ?? new Date().toISOString(),
      }))
      setHistory(loaded)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on new output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const runCommand = async (cmd: string) => {
    if (!cmd.trim() || isExecuting) return
    setIsExecuting(true)
    const timestamp = new Date().toISOString()

    // Add a pending entry
    setHistory((prev) => [...prev, { command: cmd, output: '', exitCode: -1, timestamp }])

    try {
      const result = await executeCommand(cmd)
      setHistory((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          command: cmd,
          output: result.output,
          exitCode: result.exitCode,
          timestamp,
        }
        return updated
      })
    } catch (err: any) {
      setHistory((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          command: cmd,
          output: err.message || 'Command failed',
          exitCode: 1,
          timestamp,
        }
        return updated
      })
    } finally {
      setIsExecuting(false)
      setInput('')
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    runCommand(input)
  }

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch {
      return '--:--:--'
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions Grid */}
      <div className="rounded-lg bg-[#111111] border border-[#222222] p-4">
        <p className="text-[#EDE8DE] font-syne font-semibold text-sm mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => runCommand(action.cmd)}
                disabled={isExecuting}
                className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-[#0a0a0a] border border-[#222222]
                  text-[#EDE8DE] text-xs font-mono transition-all
                  hover:border-[#008cff]/50 hover:bg-[#008cff]/5 hover:text-[#008cff]
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#222222] disabled:hover:bg-[#0a0a0a] disabled:hover:text-[#EDE8DE]"
              >
                <Icon size={14} className="shrink-0" />
                <span className="truncate">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Terminal */}
      <div className="rounded-lg bg-[#111111] border border-[#222222] overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#222222]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[#6B6860] text-xs font-mono ml-2">openclaw@vps ~ terminal</span>
        </div>

        {/* Output area */}
        <div
          ref={scrollRef}
          className="bg-[#0a0a0a] px-4 py-3 h-[420px] overflow-y-auto font-mono text-sm scrollbar-thin"
        >
          {history.length === 0 && (
            <div className="text-[#6B6860] text-xs py-8 text-center select-none">
              No commands yet. Use a quick action or type a command below.
            </div>
          )}

          {history.map((entry, i) => (
            <div key={i} className="mb-4 last:mb-0">
              {/* Command line */}
              <div className="flex items-start gap-2">
                <span className="text-[#6B6860] text-xs shrink-0 mt-0.5 select-none">
                  [{formatTime(entry.timestamp)}]
                </span>
                <ChevronRight size={12} className="text-[#28c840] shrink-0 mt-1" />
                <span className="text-[#28c840] break-all">{entry.command}</span>

                {/* Status indicator */}
                <span className="shrink-0 ml-auto mt-0.5">
                  {entry.exitCode === -1 ? (
                    <Loader2 size={12} className="text-[#008cff] animate-spin" />
                  ) : entry.exitCode === 0 ? (
                    <CheckCircle2 size={12} className="text-[#28c840]" />
                  ) : (
                    <XCircle size={12} className="text-red-400" />
                  )}
                </span>
              </div>

              {/* Output */}
              {entry.output && (
                <pre className="text-[#c8c3b8] text-xs mt-1 ml-[calc(0.5rem+12px+0.5rem)] whitespace-pre-wrap break-all leading-relaxed">
                  {entry.output}
                </pre>
              )}

              {entry.exitCode === -1 && (
                <div className="flex items-center gap-1.5 mt-1 ml-[calc(0.5rem+12px+0.5rem)]">
                  <Loader2 size={10} className="text-[#008cff] animate-spin" />
                  <span className="text-[#6B6860] text-xs">Executing...</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Command input */}
        <form onSubmit={handleSubmit} className="border-t border-[#222222]">
          <div className="flex items-center bg-[#0a0a0a] px-4 py-2.5">
            <span className="text-[#28c840] font-mono text-sm mr-2 select-none">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isExecuting}
              placeholder="Type a command..."
              className="flex-1 bg-transparent text-[#EDE8DE] font-mono text-sm outline-none placeholder:text-[#333] disabled:opacity-50"
              autoComplete="off"
              spellCheck={false}
            />
            {isExecuting && (
              <Loader2 size={14} className="text-[#008cff] animate-spin ml-2 shrink-0" />
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
