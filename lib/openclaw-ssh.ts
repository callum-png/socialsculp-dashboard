import { execFile } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const VPS_HOST = process.env.OPENCLAW_SSH_HOST || '167.172.237.104'
const VPS_USER = 'root'
const VPS_PORT = 22

function getPrivateKeyPath(): string {
  const keyBase64 = process.env.OPENCLAW_SSH_KEY
  if (!keyBase64) throw new Error('OPENCLAW_SSH_KEY env var not set')
  const keyContent = Buffer.from(keyBase64, 'base64').toString('utf-8')
  const tmpPath = join(tmpdir(), `openclaw_key_${Date.now()}`)
  writeFileSync(tmpPath, keyContent, { mode: 0o600 })
  return tmpPath
}

export async function execSSH(
  command: string,
  timeoutMs = 30000
): Promise<{ stdout: string; stderr: string; code: number }> {
  const keyPath = getPrivateKeyPath()

  const args = [
    '-i', keyPath,
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'UserKnownHostsFile=/dev/null',
    '-o', `ConnectTimeout=${Math.floor(timeoutMs / 1000)}`,
    '-p', String(VPS_PORT),
    `${VPS_USER}@${VPS_HOST}`,
    command,
  ]

  return new Promise((resolve) => {
    execFile('ssh', args, { timeout: timeoutMs }, (error, stdout, stderr) => {
      // Clean up temp key
      try { unlinkSync(keyPath) } catch {}

      resolve({
        stdout: (stdout || '').trim(),
        stderr: (stderr || '').trim(),
        code: error ? (error as any).code ?? 1 : 0,
      })
    })
  })
}
