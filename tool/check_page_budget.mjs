#!/usr/bin/env node
// Pillar gates over a built site, loaded in a real browser:
// - zero third-party requests: every request a page fires must stay on the local origin
//   (the site is adless and trackerless — that must stay provable, not claimed);
// - per-page weight: the sum of all response bodies must stay under the budget file's
//   `maxPageBytes` (or a page's own `overrides[route].maxPageBytes`, when justified —
//   budget numbers are product-owner decisions — propose, don't self-serve);
// - CSS bundle weight (only when the budget file sets `maxCssBundleBytes`): under a
//   single-bundle architecture every CSS byte multiplies across all pages, so the
//   built main.min.*.css is capped at its named cause, not just per-page symptoms.
//
// Args: [build-dir=public] [budget-file=tool/page-budget.json] — both default to the
// live site's own values, so `node tool/check_page_budget.mjs` (no args) is
// byte-identical to the pre-Task-13 behaviour.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import puppeteer from 'puppeteer'

import { createStaticServer } from './serve.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const publicDir = path.resolve(root, process.argv[2] || 'public')
const budgetPath = path.resolve(root, process.argv[3] || 'tool/page-budget.json')
const budget = JSON.parse(await fs.readFile(budgetPath, 'utf8'))
const overrides = budget.overrides || {}

function maxBytesFor(route) {
  return overrides[route]?.maxPageBytes ?? budget.maxPageBytes
}

const server = createStaticServer(publicDir)
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

const entries = await fs.readdir(publicDir, { recursive: true })

const routes = []
for (const entry of entries) {
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

let failed = false

if (budget.maxCssBundleBytes) {
  const bundles = entries.filter(entry => /^main\.min\..+\.css$/.test(path.basename(entry)))
  if (bundles.length === 0) {
    console.error('maxCssBundleBytes is set but no built main.min.*.css bundle was found — build broken?')
    failed = true
  }
  for (const bundle of bundles) {
    const size = (await fs.stat(path.join(publicDir, bundle))).size
    const over = size > budget.maxCssBundleBytes
    if (over) failed = true
    console.log(`${over ? 'OVER-BUDGET' : 'ok'} ${bundle} — ${size} bytes (bundle budget ${budget.maxCssBundleBytes})`)
  }
}

const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
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

  const maxBytes = maxBytesFor(route)
  const over = total > maxBytes
  if (over || external.length > 0) failed = true
  console.log(`${over ? 'OVER-BUDGET' : 'ok'} ${route} — ${total} bytes (budget ${maxBytes})`)
  for (const url of external) console.error(`  THIRD-PARTY REQUEST: ${route} → ${url}`)
}

await browser.close()
server.close()
process.exit(failed ? 1 : 0)
