---
title: "La checklist d'audit d'accessibilité que nous suivons désormais à chaque mise en production"
date: 2026-01-22
categories: ["information"]
---

L'outillage automatisé détecte environ un tiers des vrais problèmes d'accessibilité. Le reste demande un passage humain — nous avons donc ajouté une courte checklist manuelle à notre processus de mise en production, en plus de l'analyse axe/htmlcs déjà lancée à chaque build.

<!--more-->

Elle couvre la navigation au clavier seul sur le parcours principal, l'annonce par lecteur d'écran de tout contenu inséré dynamiquement, et une vérification que chaque état de focus reste visible sur fond clair comme sur fond sombre.

Cela ajoute environ vingt minutes par mise en production. Nous estimons que c'est un prix raisonnable pour ne pas livrer un piège au clavier.
