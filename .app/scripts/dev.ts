// Run: bun run dev
// Starts Vite dev server + Bun API server in one process. Hit http://localhost:5173
// (Vite handles SPA + HMR and proxies /api and /raw to the Bun server on :5174).

const vite = Bun.spawn(['bunx', 'vite'], {
  stdio: ['inherit', 'inherit', 'inherit'],
  cwd: import.meta.dir + '/..',
})

function shutdown() {
  try {
    vite.kill()
  } catch {
    /* noop */
  }
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('beforeExit', () => {
  try {
    vite.kill()
  } catch {
    /* noop */
  }
})

// Run the API server in the same process.
await import('../server/index')

// Keep the process alive until vite dies.
const code = await vite.exited
process.exit(code ?? 0)
