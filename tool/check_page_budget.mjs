#!/usr/bin/env node
// Pillar gates over the built site, loaded in a real browser:
// - zero third-party requests: every request a page fires must stay on the local origin
//   (the site is adless and trackerless — that must stay provable, not claimed);
// - per-page weight: the sum of all response bodies must stay under tool/page-budget.json
//   (budget numbers are product-owner decisions — propose, don't self-serve).
import { promises as fs } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import puppeteer from 'puppeteer'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const publicDir = path.join(root, 'public')
const budget = JSON.parse(await fs.readFile(path.join(root, 'tool', 'page-budget.json'), 'utf8'))

const MIME = {
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

const server = createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    if (pathname.endsWith('/')) pathname += 'index.html'
    const file = path.normalize(path.join(publicDir, pathname))
    if (!file.startsWith(publicDir + path.sep)) throw new Error('traversal')
    const body = await fs.readFile(file)
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end()
  }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

const routes = []
for (const entry of await fs.readdir(publicDir, { recursive: true })) {
  if (path.basename(entry) !== 'index.html') continue
  const html = await fs.readFile(path.join(publicDir, entry), 'utf8')
  if (/http-equiv=.?refresh/i.test(html)) continue // Hugo alias stubs, not pages
  const dir = path.dirname(entry)
  routes.push(dir === '.' ? '/' : `/${dir.replaceAll(path.sep, '/')}/`)
}
routes.sort()

if (routes.length < 2 || !routes.some(route => route.startsWith('/fr-fr/'))) {
  console.error(`suspiciously few pages or missing FR locale (${routes.length}) — build broken?`)
  process.exit(1)
}

const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
let failed = false
for (const route of routes) {
  const page = await browser.newPage()
  await page.setCacheEnabled(false)
  const external = []
  const bodies = []
  page.on('request', request => {
    const url = request.url()
    if (!url.startsWith(origin) && !url.startsWith('data:')) external.push(url)
  })
  page.on('response', response => {
    bodies.push(response.buffer().then(buffer => buffer.length).catch(() => 0))
  })
  await page.goto(origin + route, { waitUntil: 'networkidle0' })
  const total = (await Promise.all(bodies)).reduce((sum, size) => sum + size, 0)
  await page.close()

  const over = total > budget.maxPageBytes
  if (over || external.length > 0) failed = true
  console.log(`${over ? 'OVER-BUDGET' : 'ok'} ${route} — ${total} bytes (budget ${budget.maxPageBytes})`)
  for (const url of external) console.error(`  THIRD-PARTY REQUEST: ${route} → ${url}`)
}

await browser.close()
server.close()
process.exit(failed ? 1 : 0)
