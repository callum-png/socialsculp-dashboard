// ─── OpenClaw Mission Control Types ─────────────────────────────────────────

export interface OpenClawHeartbeat {
  id: string
  receivedAt: Date
  data: OpenClawStatus
}

export interface OpenClawStatus {
  timestamp: string
  system: SystemVitals
  gateway: GatewayStatus
  services: ServiceInfo
  agents: AgentInfo[]
  sessions: SessionEntry[]
  models: ModelInfo[]
  crons: CronData
  cronScheduler: CronSchedulerStatus
  heartbeatConfig: any
  channels: any[]
  os: OSInfo
  workspace: WorkspaceStats
  // Legacy fields (may still appear in old heartbeats)
  recentTasks?: TaskEntry[]
  tokenUsage?: TokenUsage
}

export interface SystemVitals {
  uptime: string | number
  cpu: number
  memoryUsed: number
  memoryTotal: number
  diskUsed: number
  diskTotal: number
  loadAvg: number[]
}

export interface GatewayStatus {
  running: boolean
  pid: number | null
  port: number
  version: string
  latencyMs: number
  mode: string
  url: string
}

export interface ServiceStatus {
  label: string
  installed: boolean
  runtime: string
}

export interface ServiceInfo {
  gateway: ServiceStatus
  node: ServiceStatus
}

export interface AgentInfo {
  name: string
  model: string
  sessionsCount: number
  workspace: string
  status: 'active' | 'idle' | 'offline'
  lastActiveAgeMs: number | null
  // Legacy fields
  fallbackModels?: string[]
  currentTask?: string | null
  maxConcurrent?: number
  maxSubagents?: number
}

export interface SessionEntry {
  key: string
  agentId: string
  kind: string
  model: string
  modelProvider: string
  inputTokens: number
  outputTokens: number
  cacheRead: number
  totalTokens: number
  contextTokens: number
  percentUsed: number
  remainingTokens: number
  updatedAt: number
  ageMs: number
}

export interface ModelInfo {
  key: string
  name: string
  local: boolean
  available: boolean
  contextWindow: number
  tags: string[]
}

export interface CronData {
  jobs: CronJob[]
  total: number
}

export interface CronJob {
  id: string
  name: string
  schedule: string
  enabled: boolean
  lastRun: string | null
  lastStatus: 'success' | 'error' | 'running' | null
  nextRun: string | null
  runCount: number
}

export interface CronRunEntry {
  timestamp: string
  status: 'success' | 'error'
  duration: number
  tokensUsed: number
  error?: string
}

export interface CronSchedulerStatus {
  enabled: boolean
}

export interface OSInfo {
  platform: string
  arch: string
  release: string
  label: string
}

export interface TaskEntry {
  id: string
  agent: string
  description: string
  status: 'running' | 'completed' | 'failed'
  startedAt: string
  completedAt: string | null
  duration: number | null
  tokensUsed: number
  model: string
  error?: string
}

export interface WorkspaceStats {
  targets: string[]
  emailsSent: number
  emailsQueued: number
  leadsTotal: number
  trackerEntries: number
}

export interface TokenUsage {
  today: TokenPeriod
  week: TokenPeriod
  month: TokenPeriod
}

export interface TokenPeriod {
  input: number
  output: number
  total: number
  estimatedCost: number
}

export interface OpenClawCommand {
  command: string
  output: string
  exitCode: number
  executedAt: string
  duration: number
}

// Tab types for Mission Control
export const MISSION_CONTROL_TABS = [
  'overview',
  'tasks',
  'crons',
  'tokens',
  'revenue',
  'workflows',
  'terminal',
] as const

export type MissionControlTab = (typeof MISSION_CONTROL_TABS)[number]

export const TAB_LABELS: Record<MissionControlTab, string> = {
  overview: 'Status',
  tasks: 'Tasks',
  crons: 'Cron Jobs',
  tokens: 'Token Burn',
  revenue: 'Revenue',
  workflows: 'Workflows',
  terminal: 'Terminal',
}
