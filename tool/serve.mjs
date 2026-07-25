#!/usr/bin/env node
// Dependency-free static server for the built site — CI gates and `pnpm start`.
// Replaced the `serve` package: its transitive tree carried Dependabot alerts
// (brace-expansion DoS with no compatible patch) that this repo doesn't need to own.
import { promises as fs } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'

export const MIME = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
}

export function createStaticServer(rootDir) {
  return createServer(async (req, res) => {
    try {
      let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
      if (pathname.endsWith('/')) pathname += 'index.html'
      const file = path.normalize(path.join(rootDir, pathname))
      if (!file.startsWith(rootDir + path.sep)) throw new Error('traversal')
      const body = await fs.readFile(file)
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404)
      res.end()
    }
  })
}

if (process.argv[1] && import.meta.url === `file://${await fs.realpath(process.argv[1])}`) {
  const [dir = 'public', port = '3000'] = process.argv.slice(2)
  const root = path.resolve(dir)
  createStaticServer(root).listen(Number(port), '127.0.0.1', () => {
    console.log(`serving ${root} at http://127.0.0.1:${port}`)
  })
}
