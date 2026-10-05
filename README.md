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
