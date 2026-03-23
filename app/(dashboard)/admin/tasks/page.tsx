'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Plus, Circle, Loader2, CheckCircle2, Trash2 } from 'lucide-react'

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

interface AdminTask {
  id: string
  title: string
  notes: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assignee: { id: string; name: string } | null
  campaign: { id: string; name: string } | null
  createdBy: { id: string; name: string }
  createdAt: string
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: 'text-[#6B6860]',
  MEDIUM: 'text-[#fbbf24]',
  HIGH: 'text-orange-400',
  URGENT: 'text-red-400',
}

const STATUS_NEXT: Record<TaskStatus, TaskStatus> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
}

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  TODO: <Circle className="w-4 h-4 text-[#6B6860]" />,
  IN_PROGRESS: <Loader2 className="w-4 h-4 text-[#008cff] animate-spin" />,
  DONE: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
}

const FILTERS: { label: string; value: TaskStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'To Do', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' },
]

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<AdminTask[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch('/api/admin/tasks')
      .then(r => r.json())
      .then(data => { setTasks(data); setLoading(false) })
  }, [])

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    const res = await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim() }),
    })
    const task = await res.json()
    setTasks(prev => [task, ...prev])
    setNewTitle('')
    setAdding(false)
  }

  async function cycleStatus(task: AdminTask) {
    const nextStatus = STATUS_NEXT[task.status]
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t))
    const res = await fetch(`/api/admin/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (!res.ok) {
      // Rollback on failure
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t))
    }
  }

  async function deleteTask(id: string) {
    const snapshot = tasks.find(t => t.id === id)
    setTasks(prev => prev.filter(t => t.id !== id))
    const res = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok && snapshot) {
      setTasks(prev => [...prev, snapshot].sort((a, b) => a.createdAt > b.createdAt ? -1 : 1))
    }
  }

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter)
  const counts: Record<TaskStatus | 'ALL', number> = {
    ALL: tasks.length,
    TODO: tasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter(t => t.status === 'DONE').length,
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Tasks"
        description="Internal team to-do list"
      />

      <div className="p-6">

      {/* Quick-add form */}
      <form onSubmit={addTask} className="mb-6 flex gap-3">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 bg-[#111111] border border-[#222222] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#6B6860] font-syne focus:outline-none focus:border-[#008cff] transition-colors"
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#008cff] text-white text-sm font-syne rounded-lg hover:bg-[#0070cc] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-[#111111] border border-[#222222] rounded-lg p-1 w-fit">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 text-sm font-syne rounded-md transition-colors ${
              filter === f.value
                ? 'bg-[#008cff] text-white'
                : 'text-[#6B6860] hover:text-white'
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-60">({counts[f.value]})</span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="text-[#6B6860] text-sm font-syne">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#6B6860] font-syne text-sm">
          {filter === 'ALL' ? 'No tasks yet — add one above.' : `No ${STATUS_LABELS[filter as TaskStatus]} tasks.`}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(task => (
            <div
              key={task.id}
              className={`flex items-center gap-3 bg-[#111111] border border-[#222222] rounded-lg px-4 py-3 group transition-opacity ${
                task.status === 'DONE' ? 'opacity-50' : ''
              }`}
            >
              {/* Status toggle */}
              <button
                onClick={() => cycleStatus(task)}
                className="flex-shrink-0 hover:scale-110 transition-transform"
                title={`Mark as ${STATUS_LABELS[STATUS_NEXT[task.status]]}`}
              >
                {STATUS_ICON[task.status]}
              </button>

              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-syne ${task.status === 'DONE' ? 'line-through text-[#6B6860]' : 'text-white'}`}>
                  {task.title}
                </span>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className={`text-xs font-syne ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                  {task.campaign && (
                    <span className="text-xs text-[#6B6860] font-syne">
                      📌 {task.campaign.name}
                    </span>
                  )}
                  {task.assignee && (
                    <span className="text-xs text-[#6B6860] font-syne">
                      → {task.assignee.name}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="text-xs text-[#6B6860] font-syne">
                      Due {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <span className="text-xs text-[#6B6860] font-syne hidden sm:block">
                {STATUS_LABELS[task.status]}
              </span>

              {/* Delete (admin only, shows on hover) */}
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[#6B6860] hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      </div>
    </div>
  )
}
