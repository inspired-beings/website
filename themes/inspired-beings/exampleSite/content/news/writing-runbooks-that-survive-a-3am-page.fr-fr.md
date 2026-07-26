---
title: "Rédiger des runbooks qui survivent à un réveil à 3 h du matin"
date: 2026-07-20
categories: ["information"]
---

Notre rotation d'astreinte redoutait une chose par-dessus presque tout le reste : un runbook qui suppose que le lecteur est réveillé, caféiné, et déjà à l'aise avec le système qu'il décrit. La plupart des incidents ne cochent ni l'une ni l'autre de ces cases.

Voici ce que nous exigeons désormais de tout runbook avant sa mise en service.

<!--more-->

## Ce que contient vraiment un bon runbook

Un runbook n'est pas de la documentation sur le système — c'est un script pour un humain fatigué sous pression. Il doit être lisible en diagonale, sans ambiguïté, et suivable à moitié endormi.

### Les non-négociables

1. Un résumé en une ligne de ce que signifie l'alerte.
2. Le rayon d'impact — qui et quoi est affecté.
3. Les trois premières commandes à exécuter, dans l'ordre.
4. Un chemin de retour arrière explicite.

#### Exemple de ligne de résumé d'alerte

Une bonne ligne de résumé ressemble à `db-proxy pool exhausted on shard-4 — writes degraded since 02:14 UTC`, pas au `ALERT: PoolExhaustionCritical` brut généré par défaut par notre outil de supervision.

### Les bonus appréciables

- Des liens vers le tableau de bord concerné.
- Un petit glossaire pour les termes propres au domaine.
- Les faux positifs connus, pour que personne ne poursuive un fantôme.
  - Sous-note : cette liste est versionnée avec la règle d'alerte elle-même.
  - Sous-note : les entrées obsolètes sont élaguées chaque trimestre.

## Un exemple concret

Voici une version abrégée du runbook que nous utilisons pour un pool de connexions base de données saturé :

```bash
# 1. Confirmer que le pool est réellement saturé (pas juste bruyant)
kubectl exec -it db-proxy-0 -- pgbouncer-cli show pools

# 2. Identifier le client le plus bruyant
kubectl logs -l app=api --since=10m | grep "pool exhausted"
```

Exécuter `pgbouncer-cli show pools` est toujours le premier réflexe — résistez à l'envie de redémarrer quoi que ce soit avant d'avoir confirmé le diagnostic.

> Les pires runbooks sont ceux écrits la semaine suivant un incident, puis jamais retouchés. Un runbook que personne ne répète est une hypothèse bien mise en forme.

## Comment nous mesurons si ça fonctionne

Nous suivons trois chiffres sur chaque incident :

| Métrique | Avant refonte | Après refonte |
| --- | --- | --- |
| Délai médian avant la première action | 14 min | 4 min |
| Runbooks suivis sans escalade | 41 % | 78 % |
| Postmortems signalant « mettre à jour le runbook » | 63 % des incidents | 12 % des incidents |

Tous les types d'incidents n'ont pas encore un runbook mature. Notre checklist de mise en service pour un nouveau service :

- [x] La règle d'alerte a un propriétaire nommé
- [x] Le runbook est rédigé et lié depuis l'alerte
- [x] Le runbook a été répété lors d'un game day
- [ ] Le runbook est traduit pour l'astreinte couvrant les fuseaux de Paris et Lisbonne

---

Rien de tout cela ne remplace le jugement — un runbook est un point de départ, pas un substitut à la compréhension du système[^1]. Mais il permet de regagner les dix premières minutes, et ce sont souvent elles qui déterminent à quel point le reste de la nuit sera difficile.

{{< figure src="images/studio-dashboard-placeholder.png" alt="Illustration abstraite d'un tableau de bord de projet, dans la palette provisoire d'Inspired Beings" caption="Illustration provisoire — pas une capture d'écran réelle de produit." >}}

[^1]: Nous tenons une courte liste, vivante, des décisions qu'un runbook ne devrait jamais essayer de prendre à la place du lecteur — elle vit dans notre manuel d'ingénierie interne, pas dans cet article.
