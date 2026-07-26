---
title: "A year of incident postmortems: what we learned"
date: 2025-08-02
categories: ["information"]
---

We ran a blameless postmortem after every incident above our internal severity-2 threshold this past year — 34 in total. Reading them back together surfaced a pattern none of us had noticed incident by incident.

<!--more-->

Nearly half traced back to a configuration change deployed without a corresponding staging test, not to a code defect at all. We've since made staging parity a release-blocking check rather than a recommendation.

The other consistent theme: incidents resolved fastest when the responding engineer had actually read the runbook before, not during, the page. Which is roughly why runbooks got their own piece this year.
