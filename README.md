# Li.La V2 — Démo du cockpit

Cette version autonome affiche directement le cockpit sans authentification. Le profil Camille est fictif et sert uniquement à l’affichage ; aucun profil local existant n’est lu.

Aucun SDK ou client Supabase n’est chargé, aucun lien magique n’est envoyé et aucune donnée ou configuration Supabase n’est modifiée. Les autres versions et la production ne sont pas concernées.

## GitHub Pages

Publier la racine de ce dépôt avec GitHub Pages puis ouvrir l’URL du site. Les ressources locales et le manifest utilisent des chemins relatifs compatibles avec un sous-répertoire GitHub Pages. Aucun build, secret ou connexion n’est nécessaire.

Les six espaces affichent leur état « À venir ». La recherche filtre les espaces et outils. La météo utilise la géolocalisation et Open-Meteo uniquement au clic. Les outils externes s’ouvrent au clic dans un nouvel onglet. Les polices et icônes utilisent des CDN.

## Vérification locale

Avec Node, Playwright et Edge installés : `node verify.cjs`. Le test bloque les ressources externes, vérifie l’accès direct à la racine et sous un chemin de projet, l’absence d’appels Supabase, le profil fictif, la recherche, les fenêtres et les largeurs 320, 390, 768 et 1440 px.
