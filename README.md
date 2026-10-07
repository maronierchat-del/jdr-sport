# La Communauté des Abdos — Fitland

Petite web-app mobile pour gérer la campagne du JDR sportif : personnage, équipement et PO, accès, zones, scénario découvert, trajets et dés, combats, marchand, compagnons et journal automatique.

## Sauvegarde

La partie est sauvegardée automatiquement dans le stockage local du navigateur. Un export/import JSON est disponible dans **Plus → Sauvegarde**.

## GitHub Pages

L'application est statique : il suffit de publier la branche `main`, dossier `/ (root)`, avec GitHub Pages.


## V3
- Inventaire plus lisible ; PO = poids d’or.
- Gants basiques : 10 dégâts / 10 s.
- Trajets saisis en km dans le jeu, conversion automatique en effort IRL et minutes, sans bonus Éclaireur automatique.
- Combat séquentiel : un ennemi actif à la fois.
- Lests de Rame de guerre intégrés au marchand.
- Pitch et scénario découvert préchargés ; accès libres/restreints préchargés et triés.

## V3.1
- Le bonus Éclaireur est désormais géré manuellement avant la saisie de la distance.


## V3.2
- La page Accès ne recense plus que les accès restreints.
- Toutes les zones libres et restreintes sont dans Zones.
- Une zone restreinte ne peut être validée que si son accès a d'abord été obtenu.


## V3.3
- Les pages Accès et Zones sont séparées en deux rubriques selon leur statut.
- Accès : À obtenir / Obtenus.
- Zones : À valider / Validées.
- Tri alphabétique conservé dans chaque rubrique.


## V3.5
- Rubriques Zones et Accès rendues explicites et séparées.
- Retour des fonds parchemin sur chaque rubrique.
- Suppression du cache service worker pour éviter les mélanges de versions.


### Ordre des rubriques
- Zones validées au-dessus des zones à valider.
- Accès obtenus au-dessus des accès à obtenir.


## V3.6
- Scénario remplacé par les deux passages définis par l’utilisatrice.
- Chaque case du scénario est modifiable individuellement (titre + texte).

## V3.8

- Pitch de départ restauré au-dessus de la chronologie.
- Les cases du scénario restent éditables individuellement.
- Le bouton « Modifier » est remplacé par une icône stylo ✎.


## V3.8 — application installable
- PWA installable sur Android/Chrome.
- Icônes 192 px et 512 px.
- Bouton d’installation sur l’accueil.
- Service worker sans cache : les mises à jour GitHub Pages ne restent pas bloquées sur une ancienne version.


## V3.9 — Dés animés

- Le lancer de dés affiche maintenant une animation de roulis avec valeurs qui défilent.
- Les dés se figent successivement sur les résultats réellement tirés.
- Le bouton est verrouillé pendant l’animation pour éviter les doubles lancers.
- Respect du réglage système « réduire les animations ».


## V4.0 — rencontres automatiques

- Le trajet calcule le nombre de rencontres à lancer (1 tous les 6 km).
- Un bouton ouvre une page Rencontre dédiée.
- Étape 1 : 7D6 animés, somme automatique et lecture de la table des rencontres (7 à 42).
- La zone autorisée, les PV, la récompense et l’effet immédiat sont affichés automatiquement.
- La rencontre peut être passée si la zone ne correspond pas.
- Étape 2 : quantité sur 1D6, avec multiplicateur spécial et règle solo appliqués automatiquement ; les rencontres sans dé de quantité sautent l’étape.
- Étape 3 : contexte sur 1D6 avec exercice/malus affiché automatiquement.
- Envoi direct au combat ou au marchand selon le résultat.


## V4.2 — position et progression de campagne

- L’application mémorise la position actuelle d’Eleanore (migration par défaut : Plaine du Fitland).
- Un trajet enregistré devient un état de campagne persistant : départ → destination → effort IRL → rencontre → arrivée.
- Tant que l’effort IRL n’est pas validé, Eleanore reste au point de départ.
- Valider l’effort ouvre automatiquement la rencontre quand le trajet fait au moins 6 km ; en dessous de 6 km, l’arrivée est enregistrée sans rencontre.
- Une rencontre envoyée au combat bloque l’arrivée jusqu’à la résolution du combat correspondant.
- Une fois la rencontre terminée, la position actuelle passe automatiquement à la destination.
- À l’arrivée, la zone peut être validée directement ; la même case est alors cochée dans la page Zones. Les zones restreintes restent soumises à leur accès.
- La position peut être modifiée manuellement avec l’icône ✎ lorsqu’aucun trajet n’est en cours.


## V4.2
- Option de trajet « Bonus d’éclaireur » : divise le temps à faire par 2 sans changer la distance ni le nombre de rencontres.
- Le trajet mémorise si le bonus a été utilisé.
