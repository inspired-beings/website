---
title: "Behind the scenes: how we chose our monitoring stack"
date: 2025-12-10
categories: ["column"]
---

We evaluated four monitoring platforms over six weeks before settling on our current stack. The deciding factor wasn't dashboards or pricing — it was how quickly each tool let an on-call engineer go from "an alert fired" to "here is the one query that explains why."

<!--more-->

Two of the four candidates required writing a custom query language fluently under pressure; we ruled both out for that reason alone, regardless of their other strengths.

The tool we picked isn't the most feature-rich on paper. It's the one whose defaults are already close to what a 3 a.m. engineer actually needs.
