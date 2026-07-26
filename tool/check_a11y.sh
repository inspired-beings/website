#!/usr/bin/env bash
# A11y gate: axe + htmlcs (WCAG2AA, pa11y config) over every built page.
#
# Args: [build-dir=public] [pa11y-config=.pa11yci.json] — both default to the
# live site's own values, so `./tool/check_a11y.sh` (no args) is behaviourally
# identical to the pre-Task-13 script. Call it twice with a light and a dark
# config (dark = `defaults.actions: ["click element [data-theme-toggle]"]`) to
# cover both colour schemes — see .pa11yci.template*.json.
set -euo pipefail
cd "$(dirname "$0")/.."

readonly BUILD_DIR="${1:-public}"
readonly PA11Y_CONFIG="${2:-.pa11yci.json}"
readonly PORT=4173
[[ -d "$BUILD_DIR" ]] || { echo "$BUILD_DIR missing — run the build first" >&2; exit 1; }

node tool/serve.mjs "$BUILD_DIR" "$PORT" &
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
  rel="${file#"$BUILD_DIR"/}"
  urls+=("http://localhost:$PORT/${rel%index.html}")
done < <(find "$BUILD_DIR" -name index.html | sort)

((${#urls[@]} >= 2)) || { echo "suspiciously few pages (${#urls[@]}) — build broken?" >&2; exit 1; }
printf 'Checking %d pages (config: %s)\n' "${#urls[@]}" "$PA11Y_CONFIG"
pnpm exec pa11y-ci --config "$PA11Y_CONFIG" "${urls[@]}"
