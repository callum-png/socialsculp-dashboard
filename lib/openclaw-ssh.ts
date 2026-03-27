import { getDb } from '@/lib/db'

const POLL_INTERVAL = 500
const MAX_WAIT = 30000

export async function execSSH(
  command: string,
  _timeoutMs = 30000
): Promise<{ stdout: string; stderr: string; code: number }> {
  const db = getDb()

  // Queue the command
  const row = await db.openClawCommand.create({
    data: { command, status: 'pending' },
  })

  // Poll until the reporter picks it up and returns results
  const deadline = Date.now() + MAX_WAIT
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL))
    const updated = await db.openClawCommand.findUnique({ where: { id: row.id } })
    if (updated && (updated.status === 'completed' || updated.status === 'failed')) {
      return {
        stdout: updated.output || '',
        stderr: '',
        code: updated.exitCode,
      }
    }
  }

  // Timeout — mark as failed
  await db.openClawCommand.update({
    where: { id: row.id },
    data: { status: 'failed', output: 'Timed out waiting for VPS to execute command' },
  })

  return { stdout: '', stderr: 'Timed out waiting for VPS to execute command', code: 1 }
}
