import { execFile } from 'child_process'
import { writeFileSync, unlinkSync, mkdirSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'

const VPS_HOST = process.env.OPENCLAW_SSH_HOST || '167.172.237.104'
const VPS_USER = 'root'
const VPS_PORT = 22

function writeKeyToTmpFile(): string {
  const keyBase64 = process.env.OPENCLAW_SSH_KEY
  if (!keyBase64) throw new Error('OPENCLAW_SSH_KEY env var not set')
  const keyContent = Buffer.from(keyBase64, 'base64').toString('utf-8')
  const dir = join(tmpdir(), 'openclaw-ssh')
  mkdirSync(dir, { recursive: true })
  const keyPath = join(dir, `key-${randomBytes(8).toString('hex')}`)
  writeFileSync(keyPath, keyContent, { mode: 0o600 })
  return keyPath
}

export async function execSSH(
  command: string,
  timeoutMs = 30000
): Promise<{ stdout: string; stderr: string; code: number }> {
  const keyPath = writeKeyToTmpFile()

  try {
    return await new Promise((resolve, reject) => {
      const proc = execFile(
        'ssh',
        [
          '-i', keyPath,
          '-o', 'StrictHostKeyChecking=accept-new',
          '-o', 'ConnectTimeout=10',
          '-o', 'BatchMode=yes',
          '-p', String(VPS_PORT),
          `${VPS_USER}@${VPS_HOST}`,
          command,
        ],
        { timeout: timeoutMs, maxBuffer: 1024 * 1024 },
        (err, stdout, stderr) => {
          if (err && 'code' in err && typeof err.code === 'number') {
            resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code: err.code })
          } else if (err) {
            reject(err)
          } else {
            resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code: 0 })
          }
        }
      )
    })
  } finally {
    try { unlinkSync(keyPath) } catch {}
  }
}
