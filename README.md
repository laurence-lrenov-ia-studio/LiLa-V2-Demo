# Li.La V2 — Démonstration métier autonome

Ouvrir la racine du site sur GitHub Pages : aucun build, compte, secret ou service externe requis. Navigation par fragments (#/hub, #/bien/pessac…), compatible avec un chemin de dépôt et le rechargement direct.

## Parcours

- Accueil : cinq petites cartes (Hub, Mes biens, Réseau, Notes, Tâches) et six raccourcis d’outils secondaires.
- Hub neutre : recherche, filtres type/budget, fiches de biens et dépôt.
- Mes biens : cinq exemples couvrant En vente, Brouillon, Sous offre, À actualiser et Vendu / retiré. Chaque bien ouvre directement son dossier de suivi. Les anciennes routes #/projets et #/projet/… restent compatibles et renvoient vers Mes biens.
- Maison Pessac, 465 000 € : propriétaire, cinq visiteurs, contre-visite, refus, intéressé, à recontacter et offre. Panneau par visiteur, notes, tâches et contacts liés.
- Réseau, Notes et Tâches : vues transversales avec liens vers les dossiers. Mon Réseau propose une recherche sur nom/société/métier/ville et quatre filtres combinables : localité, catégorie, métier et typologie. Création de visites, notes et tâches avec rattachements au bien et/ou au contact. Les notes et tâches peuvent aussi être personnelles, sans lien. Les tâches ont une échéance, une priorité et un statut ; leur case permet de les terminer ou de les rouvrir. Ajouts et statuts sont conservés dans le stockage local du navigateur.
- Dépôt : cinq sections, sélecteurs, équipements, champs conditionnels Maison/Appartement et Vente/Location, photos locales et prévisualisation complète. Aucune sauvegarde ou publication.

## Origine métier du formulaire

Lecture seule des anciens formulaires dans `Li.La_DEV_AOUT_2026/Li.La_20_07_26/Li.La_ACCES_REEL_SUPABASE/Li.La-hub-ava/particuliers/index.html` (catalogue de champs autour des lignes 1007–1010) et `Li.La-hub-ava/lila-by-la-maison-d-ava.html` (équipements autour des lignes 10969–10971).

Champs réutilisés conceptuellement : type/usage, adresse/secteur, surfaces, pièces/chambres, étage/ascenseur, état, diagnostics, occupation, prix, mandat, location/charges, coordonnées et disponibilités. Les tableaux originaux de Linda n’ont pas été retrouvés comme fichiers autonomes dans le dépôt consulté. Aucun code d’authentification, backend ou marque du Hub historique n’est repris. Aucun fichier de ces anciens projets n’a été écrit.

## Isolation et validation

Données fictives dans `demo-data.js`. Aucun client Supabase chargé, aucune requête réseau applicative, aucune lecture de compte. Les données métier sont conservées exclusivement sous la clé locale `lila-v2-demo-workspace-v1`, sans réutiliser les profils des anciennes applications. Si le stockage est bloqué ou plein, les ajouts restent disponibles en mémoire jusqu’au rechargement et un message le signale. Les images sélectionnées utilisent des URL temporaires libérées lors du changement de vue. Une politique CSP interdit les connexions réseau. Les ressources visuelles sont locales ; les illustrations de biens sont volontairement schématiques.

Avec Node, Playwright et Edge disponibles : `node verify.cjs`. Tests locaux : dossier unifié, ajouts et liens croisés, notes/tâches personnelles, statuts, persistance au rechargement, recherche et filtres CRM combinés, formulaire de dépôt et prévisualisation, échappement de saisie, anciens liens, neuf vues à 320/390/768/1440 px et stockage indisponible. Le script bloque séparément l’injection antivirus du poste, qui ne fait pas partie du site. Aucun appel Supabase, e-mail, agenda, IA, push ou déploiement n’est réalisé.
