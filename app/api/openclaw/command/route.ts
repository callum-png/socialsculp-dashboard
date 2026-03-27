import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { execSSH } from '@/lib/openclaw-ssh'

// Whitelist of safe command prefixes
const ALLOWED_PREFIXES = [
  'openclaw',
  'systemctl status openclaw',
  'cat /root/.openclaw/',
  'ls /root/.openclaw/',
  'tail /root/.openclaw/',
  'uptime',
  'free -h',
  'df -h',
  'ps aux | grep openclaw',
  'journalctl -u openclaw',
]

function isCommandAllowed(cmd: string): boolean {
  return ALLOWED_PREFIXES.some(prefix => cmd.startsWith(prefix))
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { command } = await req.json()
    if (!command || typeof command !== 'string') {
      return NextResponse.json({ error: 'Missing command' }, { status: 400 })
    }

    if (!isCommandAllowed(command.trim())) {
      return NextResponse.json({ error: 'Command not allowed' }, { status: 403 })
    }

    const start = Date.now()
    const result = await execSSH(command.trim())
    const duration = Date.now() - start

    return NextResponse.json({
      command: command.trim(),
      output: result.stdout || result.stderr,
      exitCode: result.code,
      duration,
    })
  } catch (err: any) {
    console.error('[openclaw/command] Error:', err)
    return NextResponse.json({ error: err.message || 'Execution error' }, { status: 500 })
  }
}
