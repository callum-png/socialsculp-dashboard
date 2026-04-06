#!/usr/bin/env node
/**
 * OpenClaw Command API — lightweight HTTP server on the VPS
 * Receives authenticated command requests from the dashboard and executes them locally.
 *
 * Deploy: scp this file to VPS, run with:
 *   API_KEY=your-secret-key node openclaw-command-api.mjs
 *
 * Or use systemd/pm2 to keep it running.
 */

import { createServer } from 'node:http'
import { execFile } from 'node:child_process'

const PORT = parseInt(process.env.PORT || '18790', 10)
const API_KEY = process.env.API_KEY
if (!API_KEY) {
  console.error('ERROR: API_KEY env var is required')
  process.exit(1)
}

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

function isAllowed(cmd) {
  return ALLOWED_PREFIXES.some(p => cmd.startsWith(p))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    req.on('error', reject)
  })
}

const server = createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'GET' && req.url === '/health') {
    return res.end(JSON.stringify({ ok: true }))
  }

  if (req.method !== 'POST' || req.url !== '/exec') {
    res.statusCode = 404
    return res.end(JSON.stringify({ error: 'Not found' }))
  }

  const auth = req.headers.authorization
  if (auth !== `Bearer ${API_KEY}`) {
    res.statusCode = 401
    return res.end(JSON.stringify({ error: 'Unauthorized' }))
  }

  let body
  try {
    body = JSON.parse(await readBody(req))
  } catch {
    res.statusCode = 400
    return res.end(JSON.stringify({ error: 'Invalid JSON' }))
  }

  const { command } = body
  if (!command || typeof command !== 'string') {
    res.statusCode = 400
    return res.end(JSON.stringify({ error: 'Missing command' }))
  }

  if (!isAllowed(command.trim())) {
    res.statusCode = 403
    return res.end(JSON.stringify({ error: 'Command not allowed' }))
  }

  execFile('bash', ['-c', command.trim()], { timeout: 30000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
    const code = err ? (typeof err.code === 'number' ? err.code : 1) : 0
    res.end(JSON.stringify({ stdout, stderr, code }))
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`OpenClaw Command API listening on :${PORT}`)
})
