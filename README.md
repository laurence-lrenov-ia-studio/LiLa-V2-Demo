# Li.La V2 — Démonstration métier autonome

Ouvrir la racine du site sur GitHub Pages : aucun build, compte, secret ou service externe requis. Navigation par fragments (#/hub, #/bien/pessac…), compatible avec un chemin de dépôt et le rechargement direct.

## Parcours

- Accueil : cinq petites cartes (Hub, Mes biens, Réseau, Notes, Tâches) et six raccourcis d’outils secondaires.
- Hub Immobilier : tous les biens marqués `published` dans la source commune, y compris les miens. Recherche et filtres type/budget. Mes biens portent l’indicateur « Mon bien » et ouvrent leur dossier ; ceux des autres agents ouvrent une fiche commerciale et un panneau de contact agent.
- Mes biens : uniquement les six biens de l’agent courant, avec les statuts Brouillon, Publié, À actualiser, Sous offre, Retiré et Vendu. La publication est un champ distinct du statut : la maison Mérignac reste visible dans le Hub pendant son suivi « Sous offre ». Chaque bien ouvre son dossier de suivi. Les anciennes routes #/projets et #/projet/… restent compatibles et renvoient vers Mes biens.
- Maison Pessac, 465 000 € : propriétaire, cinq visiteurs, contre-visite, refus, intéressé, à recontacter et offre. Panneau par visiteur, notes, tâches et contacts liés.
- Réseau, Notes et Tâches : vues transversales avec liens vers les dossiers. Mon Réseau propose une recherche sur nom/société/métier/ville et quatre filtres combinables : localité, catégorie, métier et typologie. Création de visites, notes et tâches avec rattachements au bien et/ou au contact. Les notes et tâches peuvent aussi être personnelles, sans lien. Les tâches ont une échéance, une priorité et un statut ; leur case permet de les terminer ou de les rouvrir. Ajouts et statuts sont conservés dans le stockage local du navigateur.
- Dépôt : cinq sections, sélecteurs, équipements, champs conditionnels Maison/Appartement et Vente/Location, photos locales et prévisualisation complète. Aucune sauvegarde ou publication.
- Li.La Particulier : bascule de vue dans l’en-tête, suivi vendeur de Maison Pessac, recherche acquéreur et formulaire court « Confier mon bien ». Le vendeur retrouve le même bien, la même photo et la même liste de visites que l’agent. Une réponse au créneau proposé est enregistrée localement sur la visite et visible dans son suivi Pro. Les retours vendeur sont des synthèses explicitement autorisées dans `demo-data.js`, sans noms de visiteurs ni notes ou tâches internes. Les choix de la recherche sont locaux au navigateur ; le formulaire particulier n’envoie ni n’enregistre un dossier.
- Synthèse du dossier : dans chaque dossier Pro, périmètre sélectionnable (dossier entier, visites, visiteur, période, statuts, notes ou tâches), catégories à inclure et quatre sorties : complète, visiteur, vendeur anonymisée ou JSON structuré. Le texte est calculé depuis l’état courant du navigateur et copiable dans le presse-papiers. La version vendeur utilise exclusivement les retours publics autorisés et exclut les notes, tâches et identités internes. Aucune IA ni requête réseau.

## Compléments V2 (passe fonctionnelle et graphique)

- Mes recherches (#/recherches, #/recherche/lea-martin) : dossier de recherche acquéreur avec critères, contacts liés, biens proposés, favoris, refus, demandes de visite, visites prévues/réalisées, notes, tâches, documents, historique et synthèse copiable (complète ou version acquéreur). « + Ajouter un bien proposé » enregistre localement. Le formulaire professionnel de mandat de recherche n’est volontairement pas modélisé.
- Ajout rapide : bouton « Ajouter » de l’en-tête et raccourcis de l’accueil (contact, visite, note, tâche).
- Mon Réseau : dix typologies en badges, métier professionnel (Notaire, Courtier, Diagnostiqueur, Artisan, Photographe, Architecte, Autre), « + Ajouter un contact », fiche avec Appeler / Email / WhatsApp, biens, recherches, notes, tâches et historique liés. Un agent du Hub peut être ajouté à mon réseau.
- Documents dans les dossiers bien et recherche : nom, catégorie, date (métadonnées locales uniquement, aucun fichier stocké).
- Synthèse : « Créer mon document » ouvre l’outil documentaire configuré (Gamma par défaut). Aucune API IA.
- Mes outils : barre compacte en bas des vues Pro, dix emplacements renommables, masquables, avec intitulé et URL https modifiables.
- En-tête : ville et météo stables (Blanquefort · 14 °C, demo-data.js).
- Li.La Particulier : accueil libre (#/particulier/bienvenue) avec « Je vends un bien » et « Je recherche un bien » (brief acquéreur générique, #/particulier/brief, non définitif), espaces client Mon bien et Ma recherche (visites, demandes, favoris, refus, offre, prochaines étapes, agent). La bascule Vue Pro / Vue Particulier est limitée à la barre « Démo ».
- Interface : nouvelle charte légère (crème, encre marine, accent orange, badges teintés), cartes compactes avec photos, navigation par onglets sur desktop, menu déroulant et barre d’onglets fixe sur mobile.

## Passe premium et corrections métier validées

- Li.La Particulier n’accède jamais au Hub ni aux vues professionnelles : en Vue Particulier, toute route Pro affiche « Espace réservé aux professionnels ». Seul le sélecteur de la barre Démo ramène à la Vue Pro.
- Déposer un bien : mandat obligatoire, Exclusif ou Simple (« Aucun » retiré) ; plusieurs photos (10 max), réorganisables, avec photo principale et aperçu en galerie ; propriétaire en prénom / nom / téléphone / e-mail, signalé « Informations privées — non diffusées dans le Hub ». Aucun autre champ ajouté ni retiré, en attente du comparatif de Linda.
- Dossier d’un bien : couverture photo, galerie si plusieurs photos, cartes privées Propriétaire et Mandat (jamais affichées dans le Hub ni sur la fiche commerciale), documents partageables avec le vendeur.
- Ajout de visite : une prochaine action facultative crée la tâche liée dans le dossier.
- « Créer mon document » : outil choisi directement à côté du bouton (Gamma, Canva, ChatGPT, Claude…).
- Hub : « Ajouter l’agent à Mon Réseau » sur la fiche commerciale et sur les cartes.

## Ma journée / Agenda

- Route #/journee (et #/journee/AAAA-MM-JJ) : timeline du jour réunissant visites Li.La et rendez-vous de l’agenda (personnel, estimation / RDV pro, autre), créneaux disponibles d’au moins une heure, semaine navigable. Accès depuis la navigation et le panneau Ma journée de l’accueil.
- « Connecter mon Google Agenda » : connexion simulée (aucun OAuth, aucune clé, aucune requête). Les événements viennent de demoCalendarEvents dans demo-data.js.
- « Ajouter également à mon Google Agenda » dans + Ajouter une visite : la visite reste toujours enregistrée dans Li.La ; la copie agenda est simulée, ou mise en attente jusqu’à la connexion.
- Cible PROD : lecture des événements de l’utilisateur et ajout d’une visite Li.La dans Google Agenda. Li.La reste la base des visites et ne modifie ni ne supprime les rendez-vous Google existants.

## Origine métier du formulaire

Lecture seule des anciens formulaires dans `Li.La_DEV_AOUT_2026/Li.La_20_07_26/Li.La_ACCES_REEL_SUPABASE/Li.La-hub-ava/particuliers/index.html` (catalogue de champs autour des lignes 1007–1010) et `Li.La-hub-ava/lila-by-la-maison-d-ava.html` (équipements autour des lignes 10969–10971).

Champs réutilisés conceptuellement : type/usage, adresse/secteur, surfaces, pièces/chambres, étage/ascenseur, état, diagnostics, occupation, prix, mandat, location/charges, coordonnées et disponibilités. Les tableaux originaux de Linda n’ont pas été retrouvés comme fichiers autonomes dans le dépôt consulté. Aucun code d’authentification, backend ou marque du Hub historique n’est repris. Aucun fichier de ces anciens projets n’a été écrit.

## Isolation et validation

Données fictives dans `demo-data.js`, avec une seule liste de biens, un identifiant d’agent courant et un indicateur de publication. Les fiches des autres agents ne contiennent aucune donnée de propriétaire ou de suivi interne. Aucun client Supabase chargé, aucune requête réseau applicative, aucune lecture de compte. Les données métier ajoutées par l’utilisateur sont conservées exclusivement sous la clé locale `lila-v2-demo-workspace-v1`, sans réutiliser les profils des anciennes applications. Si le stockage est bloqué ou plein, les ajouts restent disponibles en mémoire jusqu’au rechargement et un message le signale. Les images sélectionnées utilisent des URL temporaires libérées lors du changement de vue. Une politique CSP interdit les connexions réseau. Les ressources visuelles sont locales, dont deux photos générées pour les annonces des autres agents ; les autres biens conservent leurs illustrations schématiques.

Avec Node, Playwright et Edge disponibles : `node verify.cjs` (Playwright 1.56 vérifié). Tests locaux : répartition Hub/Mes biens, fiche commerciale sans données internes, accès direct aux routes, dossier unifié, ajouts et liens croisés, notes/tâches personnelles, statuts, persistance au rechargement, recherche et filtres CRM combinés, formulaires Pro et Particulier, confidentialité de la vue vendeur, réponse partagée à la visite, favoris acquéreur, filtres et formats de synthèse, copie dans le presse-papiers, échappement de saisie, anciens liens, treize vues à 320/390/768/1440 px et stockage indisponible. Le script bloque séparément l’injection antivirus du poste, qui ne fait pas partie du site. Aucun appel Supabase, e-mail, agenda, IA, push ou déploiement n’est réalisé.
