---
title: "Notes sur une migration de REST vers gRPC"
date: 2026-03-05
categories: ["column"]
---

Nous avons fait migrer le maillage de services interne d'un client de REST-sur-HTTP vers gRPC au cours des deux derniers trimestres. Le résultat qui se résume bien — une latence interne réduite de 35 % — est la partie facile à raconter ; tout ce qui l'entoure l'était beaucoup moins.

<!--more-->

L'évolution des schémas a demandé une vraie discipline : les règles de numérotation des champs de protobuf ne pardonnent aucun raccourci, et nous avons intercepté en revue deux changements potentiellement cassants, précisément parce que l'outillage refusait sinon de compiler.

Le coût le moins glamour a été l'observabilité — notre dispositif de tracing, pensé pour HTTP, a demandé un vrai travail de refonte pour comprendre les flux multiplexés de gRPC, et nous avions sous-estimé ce poste dans la proposition initiale.

Verdict net : pertinent pour les profils de trafic de ce client, pas une recommandation par défaut pour tous les services.
