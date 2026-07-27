---
title: "Writing runbooks that survive a 3 a.m. page"
date: 2026-07-20
categories: ["information"]
---

No more runbooks written for an alert reader.

<!--more-->

## What a good runbook actually contains

A runbook is not documentation about the system — it's a script for a tired human under pressure. It needs to be skimmable, unambiguous, and safe to follow half-asleep.

### The non-negotiables

1. A one-line summary of what the alert means.
2. The blast radius — who and what is affected.
3. The first three commands to run, in order.
4. An explicit rollback path.

#### Example alert summary line

A well-written summary line reads like `db-proxy pool exhausted on shard-4 — writes degraded since 02:14 UTC`, not the bare `ALERT: PoolExhaustionCritical` our monitoring tool generates by default.

### Nice-to-haves

- Links to the relevant dashboard.
- A short glossary for domain-specific terms.
- Known false-positive triggers, so nobody chases a ghost.
  - Sub-note: this list is versioned alongside the alert rule itself.
  - Sub-note: stale entries get pruned every quarter.

## A worked example

Here's an abbreviated version of the runbook we use for a saturated database connection pool:

```bash
# 1. Confirm the pool is actually saturated (not just noisy)
kubectl exec -it db-proxy-0 -- pgbouncer-cli show pools

# 2. Identify the noisiest client
kubectl logs -l app=api --since=10m | grep "pool exhausted"
```

Running `pgbouncer-cli show pools` is always the first move — resist the urge to restart anything before the diagnosis is confirmed.

> The worst runbooks are the ones written the week after an incident and never touched again. A runbook nobody rehearses is a guess with good formatting.

## How we measure whether it worked

We track three numbers across every incident:

| Metric | Before rewrite | After rewrite |
| --- | --- | --- |
| Median time to first action | 14 min | 4 min |
| Runbooks followed without escalation | 41% | 78% |
| Postmortems flagging "update the runbook" | 63% of incidents | 12% of incidents |

Not every incident type has a mature runbook yet. Our rollout checklist for a new service:

<!-- Hand-authored as raw HTML rather than GFM `- [ ]` task-list syntax:
Goldmark's task-list extension renders a bare `<input disabled type=
"checkbox">` with no accessible name (a documented upstream gap), and no
Hugo render hook exists for list items to patch it at template level.
`unsafe = true` (site config) allows raw HTML blocks in Markdown, so each
item gets a real `<label for>`/`id` pair instead — accessible with zero
JS. -->
<ul class="task-list">
  <li class="task-list__item">
    <input class="task-list__checkbox" type="checkbox" id="task-alert-owner" checked disabled>
    <label class="task-list__label" for="task-alert-owner">Alert rule has a named owner</label>
  </li>
  <li class="task-list__item">
    <input class="task-list__checkbox" type="checkbox" id="task-runbook-drafted" checked disabled>
    <label class="task-list__label" for="task-runbook-drafted">Runbook drafted and linked from the alert</label>
  </li>
  <li class="task-list__item">
    <input class="task-list__checkbox" type="checkbox" id="task-game-day" checked disabled>
    <label class="task-list__label" for="task-game-day">Runbook rehearsed in a game day</label>
  </li>
  <li class="task-list__item">
    <input class="task-list__checkbox" type="checkbox" id="task-translation" disabled>
    <label class="task-list__label" for="task-translation">Runbook translated for the on-call rotation covering the Paris and Lisbon time zones</label>
  </li>
</ul>

---

None of this replaces judgment — a runbook is a starting point, not a substitute for understanding the system[^1]. But it buys back the first ten minutes, and the first ten minutes are usually the ones that decide how bad the rest of the night gets.

{{< figure src="images/studio-dashboard-placeholder.png" alt="Abstract illustration of a project dashboard, in the Inspired Beings interim palette" caption="Illustrative placeholder — not a real product screenshot." class="figure--spaced" >}}

[^1]: We keep a short, living list of judgment calls a runbook should never try to make for the reader — it lives in our internal engineering handbook, not in this post.
