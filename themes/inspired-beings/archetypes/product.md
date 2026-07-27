---
title: ""
# Products section (`content/products/<slug>.{en,fr-fr}.md`), sibling of
# `_index.{en,fr-fr}.md` (title + `lead` only, same shape as `services/
# _index.md`). This archetype is the per-app single-page contract (Task 11
# spec contract: `tagline`, `screenshots[]`, `features[]{title,body}`,
# `store_links{}`, `privacy_summary`) — rehearses the future Fossling app
# page shape.

# Sort order among product cards on the products index (same convention as
# `services/single.html`'s `weight`).
weight: 10
# Decorative glyph (emoji) shown in the hero and on the index card —
# same convention as `services/single.html`'s `icon` (no icon font, no
# downloaded asset; a real app icon image is a later, real-content concern).
icon: ""
# Short subheading — hero (single) + index card body.
tagline: ""
# 2-3 locally-generated phone-aspect screenshots. `alt` is required (empty
# string only for a genuinely decorative shot) — see `partials/figure.html`.
screenshots:
  - src: ""
    alt: ""
  - src: ""
    alt: ""
# 3-5 items — rendered via the shared `card.html` partial (title/body only,
# no icon/link).
features:
  - title: ""
    body: ""
  - title: ""
    body: ""
  - title: ""
    body: ""
# Fixed two-key dict (`ios`/`android`) — a short status string, e.g.
# "Coming soon", rendered as a `facts-table` (term = store name, value =
# this string). Omit a key entirely if that platform isn't planned; no
# real store badge artwork, ever (legal/security constraint).
store_links:
  ios: ""
  android: ""
# One short paragraph — plain-language summary of what data the app does
# (or, ideally, does not) collect. Links out to `/legal/` on the single
# page; the real privacy policy content lives there, not here.
privacy_summary: ""
---
