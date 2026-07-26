---
title: "The accessibility audit checklist we now run on every release"
date: 2026-01-22
categories: ["information"]
---

Automated tooling catches roughly a third of real accessibility issues. The rest needs a human pass — so we added a short manual checklist to our release process, on top of the axe/htmlcs run every build already gets.

<!--more-->

It covers keyboard-only navigation through the primary user flow, screen-reader announcement of any dynamically inserted content, and a check that every focus state is visible against both light and dark backgrounds.

It adds roughly twenty minutes per release. We think that's a reasonable price for not shipping a keyboard trap.
