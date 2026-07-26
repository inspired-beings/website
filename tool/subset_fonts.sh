#!/usr/bin/env bash
# Reproducible font pipeline: download pinned Fraunces + Karla variable TTFs,
# instance Fraunces (SOFT=0 WONK=0 wght 300-600, opsz kept), subset both to
# Latin + French coverage, emit self-hosted woff2 into the theme's assets.
#
# Sources are pinned by immutable commit SHA (not a moving branch ref) and
# verified by sha256 before any processing touches them — the only network
# access this script makes. Re-run whenever the upstream fonts should be
# refreshed; commit the resulting woff2 files (the build itself needs no
# network — see Task 2 report).
set -euo pipefail
cd "$(dirname "$0")/.."

readonly VENV_DIR=".venv-fonts"
readonly FONTS_OUT_DIR="themes/inspired-beings/assets/fonts"
readonly FONTTOOLS_VERSION="4.63.0"
readonly BROTLI_VERSION="1.2.0"

# undercasetype/fraunces @ master, pinned commit — fonts/variable/Fraunces[SOFT,WONK,opsz,wght].ttf
readonly FRAUNCES_COMMIT="7ccdec31c6028118dce3e47fe864e3744460371d"
readonly FRAUNCES_URL="https://raw.githubusercontent.com/undercasetype/fraunces/${FRAUNCES_COMMIT}/fonts/variable/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf"
readonly FRAUNCES_SHA256="0776a870a0856b296e11639505ac0cf9be5e7800bb1849dfa21a1bd182455fc0"

# googlefonts/karla @ main, pinned commit — fonts/variable/Karla[wght].ttf
readonly KARLA_COMMIT="69b25f663101efb4113dd7ed416c120dd2dce56a"
readonly KARLA_URL="https://raw.githubusercontent.com/googlefonts/karla/${KARLA_COMMIT}/fonts/variable/Karla%5Bwght%5D.ttf"
readonly KARLA_SHA256="ed3ca4cd9bdd899c543927c30bf5ff50706b24b3f2b7328e64b25f7d2a9d23dc"

# Latin + French essentials: ASCII, Latin-1 supplement, œŒ, €, «», en/em dash,
# curly single/double quotes, ellipsis, single guillemets.
readonly UNICODES="U+0020-007E,U+00A0-00FF,U+0152-0153,U+20AC,U+00AB,U+00BB,U+2013-2014,U+2018-2019,U+201C-201D,U+2026,U+2039-203A"

readonly FRAUNCES_MAX_BYTES=81920 # 80 KB
readonly KARLA_MAX_BYTES=40960 # 40 KB

command -v python3 >/dev/null || {
  echo "python3 not found — activate mise first (eval \"\$(mise activate bash)\")" >&2
  exit 1
}

echo "== venv (${VENV_DIR}) =="
[[ -d "$VENV_DIR" ]] || python3 -m venv "$VENV_DIR"
# shellcheck disable=SC1091
source "${VENV_DIR}/bin/activate"
pip install --quiet "fonttools==${FONTTOOLS_VERSION}" "brotli==${BROTLI_VERSION}"

work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

fetch_and_verify() {
  local url="$1" expected_sha256="$2" out="$3"
  curl -fsSL -o "$out" "$url"
  local actual_sha256
  actual_sha256="$(sha256sum "$out" | cut -d' ' -f1)"
  if [[ "$actual_sha256" != "$expected_sha256" ]]; then
    echo "sha256 mismatch for $out: expected $expected_sha256, got $actual_sha256" >&2
    exit 1
  fi
}

echo "== downloading pinned sources =="
fetch_and_verify "$FRAUNCES_URL" "$FRAUNCES_SHA256" "${work_dir}/fraunces-vf.ttf"
fetch_and_verify "$KARLA_URL" "$KARLA_SHA256" "${work_dir}/karla-vf.ttf"

echo "== instancing Fraunces (SOFT=0 WONK=0 wght=300:600, opsz kept) =="
fonttools varLib.instancer \
  --output "${work_dir}/fraunces-instanced.ttf" \
  "${work_dir}/fraunces-vf.ttf" \
  SOFT=0 WONK=0 wght=300:600

echo "== subsetting (latin + french essentials) =="
mkdir -p "$FONTS_OUT_DIR"
pyftsubset "${work_dir}/fraunces-instanced.ttf" \
  --output-file="${FONTS_OUT_DIR}/fraunces-roman.woff2" \
  --flavor=woff2 \
  --unicodes="$UNICODES" \
  --layout-features+=kern,liga \
  --recalc-average-width

# Karla VF kept as-is (wght axis only); optional italic dropped — unused by
# the dummy copy (spec: drop if unused).
pyftsubset "${work_dir}/karla-vf.ttf" \
  --output-file="${FONTS_OUT_DIR}/karla-roman.woff2" \
  --flavor=woff2 \
  --unicodes="$UNICODES" \
  --layout-features+=kern,liga \
  --recalc-average-width

echo "== size gate =="
fraunces_size="$(stat -c%s "${FONTS_OUT_DIR}/fraunces-roman.woff2")"
karla_size="$(stat -c%s "${FONTS_OUT_DIR}/karla-roman.woff2")"
echo "fraunces-roman.woff2: ${fraunces_size} bytes (budget ${FRAUNCES_MAX_BYTES})"
echo "karla-roman.woff2:    ${karla_size} bytes (budget ${KARLA_MAX_BYTES})"
failed=0
((fraunces_size <= FRAUNCES_MAX_BYTES)) || {
  echo "OVER BUDGET: fraunces-roman.woff2" >&2
  failed=1
}
((karla_size <= KARLA_MAX_BYTES)) || {
  echo "OVER BUDGET: karla-roman.woff2" >&2
  failed=1
}

echo "== french glyph gate =="
python3 - "$FONTS_OUT_DIR" <<'PYEOF' || failed=1
import sys

from fontTools.ttLib import TTFont

out_dir = sys.argv[1]
required = {
    "œ": 0x153, "Œ": 0x152, "€": 0x20AC, "«": 0xAB, "»": 0xBB,
    "é": 0xE9, "à": 0xE0, "ç": 0xE7,
}
ok = True
for name in ("fraunces-roman.woff2", "karla-roman.woff2"):
    cmap = TTFont(f"{out_dir}/{name}").getBestCmap()
    missing = [ch for ch, cp in required.items() if cp not in cmap]
    if missing:
        ok = False
        print(f"MISSING glyphs in {name}: {missing}", file=sys.stderr)
    else:
        print(f"{name}: OK ({', '.join(required)} present)")
sys.exit(0 if ok else 1)
PYEOF

exit "$failed"
