#!/usr/bin/env bash
# A11y gate: axe + htmlcs (WCAG2AA, .pa11yci.json) over every built page, both locales.
set -euo pipefail
cd "$(dirname "$0")/.."

readonly PORT=4173
[[ -d public ]] || { echo "public/ missing — run pnpm build first" >&2; exit 1; }

node tool/serve.mjs public "$PORT" &
readonly SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
for _ in $(seq 1 60); do
  curl -fsS "http://localhost:$PORT/" >/dev/null 2>&1 && break
  sleep 0.5
done

# Hugo alias stubs are pure meta-refresh redirects, not pages.
urls=()
while IFS= read -r file; do
  grep -qi 'http-equiv=.\?refresh' "$file" && continue
  rel="${file#public/}"
  urls+=("http://localhost:$PORT/${rel%index.html}")
done < <(find public -name index.html | sort)

((${#urls[@]} >= 2)) || { echo "suspiciously few pages (${#urls[@]}) — build broken?" >&2; exit 1; }
printf 'Checking %d pages\n' "${#urls[@]}"
pnpm exec pa11y-ci "${urls[@]}"
