---
title: ""
# Sort order among service pages — drives both the services index (Task 7)
# and the top-bar/footer "Services" menu entries (`exampleSite/config/
# _default/menus.{en,fr-fr}.toml`, kept in sync by hand, menus.toml stays
# the source of truth for nav). Shipped services use 10/20/30/40/50/60.
weight: 10
# Decorative glyph (emoji or a short symbol) — rendered `aria-hidden`,
# no icon font, no downloaded asset. Reuse the same icon across locales of
# the same service.
icon: ""
# Short subheading — shown under the H1 in the hero (single) and next to
# the icon on the services index row.
tagline: ""
# One or two sentences — the longer teaser shown on the services index row
# only, kept separate from `tagline` so the index row reads as
# heading + short line + teaser.
summary: ""
# 3-5 short checklist items ("who this is for") — each becomes one row of
# the audience checklist on the single page.
audience:
  - ""
  - ""
  - ""
# Exactly 5 items — rendered as a numbered 01-05 list ("what's covered").
# `title` is a short label, `body` one or two sentences.
coverage:
  - title: ""
    body: ""
  - title: ""
    body: ""
  - title: ""
    body: ""
  - title: ""
    body: ""
  - title: ""
    body: ""
# Exactly 4 items — passed straight to the shared `stats-band` partial,
# whose grid is a fixed 4-column layout (see Task 5 report).
stats:
  - value: ""
    unit: ""
    label: ""
  - value: ""
    unit: ""
    label: ""
  - value: ""
    unit: ""
    label: ""
  - value: ""
    unit: ""
    label: ""
# 3 items — rendered as native <details>/<summary> accordions (zero JS,
# same `.accordion` classes as the shortcode, but authored as data here
# rather than as Markdown content).
faq:
  - q: ""
    a: ""
  - q: ""
    a: ""
  - q: ""
    a: ""
---
