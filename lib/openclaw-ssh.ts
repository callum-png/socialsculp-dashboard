import { Client } from 'ssh2'

const VPS_HOST = '167.172.237.104'
const VPS_USER = 'root'
const VPS_PORT = 22

function getPrivateKey(): Buffer {
  const keyBase64 = process.env.OPENCLAW_SSH_KEY
  if (!keyBase64) throw new Error('OPENCLAW_SSH_KEY env var not set')
  return Buffer.from(keyBase64, 'base64')
}

export async function execSSH(command: string, timeoutMs = 30000): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    let stdout = ''
    let stderr = ''

    const timer = setTimeout(() => {
      conn.end()
      reject(new Error(`SSH command timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          clearTimeout(timer)
          conn.end()
          reject(err)
          return
        }
        stream.on('close', (code: number) => {
          clearTimeout(timer)
          conn.end()
          resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code: code ?? 0 })
        })
        stream.on('data', (data: Buffer) => { stdout += data.toString() })
        stream.stderr.on('data', (data: Buffer) => { stderr += data.toString() })
      })
    })

    conn.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })

    conn.connect({
      host: VPS_HOST,
      port: VPS_PORT,
      username: VPS_USER,
      privateKey: getPrivateKey(),
    })
  })
}
