---
title: "Notes on migrating from REST to gRPC"
date: 2026-03-05
categories: ["column"]
---

We moved the internal service mesh for one client's platform from REST-over-HTTP to gRPC over the last two quarters. The headline result — 35% lower internal latency — is the easy part to report; the harder part was everything around it.

<!--more-->

Schema evolution needed real discipline: protobuf's field-numbering rules are unforgiving of shortcuts, and we caught two would-be breaking changes in review specifically because the tooling refused to compile otherwise.

The unglamorous cost was observability — our existing HTTP-centric tracing setup needed real rework to understand gRPC's multiplexed streams, and we underestimated that line item in the original proposal.

Net verdict: worth it for this client's traffic patterns, not a default recommendation for every service.
