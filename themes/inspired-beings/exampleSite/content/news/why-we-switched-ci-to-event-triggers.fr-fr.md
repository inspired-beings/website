---
title: "Pourquoi nous sommes passés d'une CI en cron jobs à des déclencheurs événementiels"
date: 2025-09-14
categories: ["column"]
---

Notre ancienne configuration de CI interrogeait chaque dépôt toutes les cinq minutes, qu'il y ait eu un changement ou non. Cela fonctionnait, tout en consommant discrètement du calcul et en ajoutant jusqu'à cinq minutes de temps mort avant même le démarrage d'un build.

<!--more-->

Le passage à des déclencheurs pilotés par webhook a réduit notre délai médian avant le premier log de build de un peu moins de six minutes à huit secondes. La migration elle-même a tenu en un seul sprint, répartie entre un petit outil interne et une bibliothèque partagée dont dépendent déjà la plupart de nos projets clients.

La leçon ne portait pas vraiment sur la CI. C'était un rappel qu'il faut de temps en temps vérifier si un ancien réglage par défaut est toujours le bon, plutôt que celui que personne n'a remis en question depuis trois ans.
