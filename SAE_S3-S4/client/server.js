#!/usr/bin/env node
import { spawn } from 'node:child_process'

// lance le backend situe dans ../api/app.js
const server = spawn(process.execPath, ['../api/app.js'], { stdio: 'inherit' })

server.on('error', (err) => {
  console.error('Erreur lancement du backend:', err)
  process.exit(1)
})

process.on('SIGINT', () => {
  if (server && !server.killed) server.kill('SIGTERM')
  process.exit(0)
})
process.on('SIGTERM', () => {
  if (server && !server.killed) server.kill('SIGTERM')
  process.exit(0)
})
