---
title: "Why we switched our CI from cron jobs to event triggers"
date: 2025-09-14
categories: ["column"]
---

Our old CI setup polled every repository every five minutes, whether anything had changed or not. It worked, and it also quietly burned compute and added up to five minutes of dead time before a build even started.

<!--more-->

Switching to webhook-driven triggers cut our median time-to-first-build-log from just under six minutes to eight seconds. The migration itself took a single sprint, spread across a small internal tool and a shared library most of our client projects already depend on.

The lesson wasn't really about CI. It was a reminder to occasionally check whether an old default is still the right one, rather than the one nobody's questioned in three years.
