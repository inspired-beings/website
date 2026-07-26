---
title: "Une année de postmortems d'incidents : ce que nous en avons retenu"
date: 2025-08-02
categories: ["information"]
---

Nous avons mené un postmortem sans recherche de coupable après chaque incident dépassant notre seuil interne de sévérité 2 cette dernière année — 34 au total. Les relire ensemble a fait apparaître un schéma qu'aucun de nous n'avait remarqué incident par incident.

<!--more-->

Près de la moitié remontait à un changement de configuration déployé sans test de staging correspondant, et non à un défaut de code à proprement parler. Nous avons depuis fait de la parité avec le staging une vérification bloquante à la mise en production, plutôt qu'une simple recommandation.

L'autre constante : les incidents résolus le plus vite étaient ceux où la personne intervenue avait réellement lu le runbook avant l'alerte, pas pendant. Ce qui explique à peu près pourquoi les runbooks ont eu droit à leur propre article cette année.
