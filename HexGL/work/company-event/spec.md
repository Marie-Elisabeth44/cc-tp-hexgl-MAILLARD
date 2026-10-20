# Spec — Personnalisation événementielle HexGL (ACME Racing Challenge)

Sources : `formation/tickets/company-event.md` (besoin), `formation/identite/charte_graphique_acme.pdf` et `formation/identite/logo.png` (identité), `docs/architecture.md` (existant).

## 1. Contexte et objectif

ACME utilise HexGL lors d'un événement d'entreprise. L'écran d'accueil actuel (fond clair flouté, visuel « HexGL by BKcore », menu bleu/orange) ne reflète pas la marque.

**Objectif :** l'écran d'accueil (menu initial, avant le lancement de la course) respecte l'identité visuelle ACME : logo, couleurs, nom de l'entreprise, message d'accueil. **Le gameplay reste inchangé.**

## 2. Exigences fonctionnelles

- **EF1 — Logo.** Le logo ACME fourni est visible sur l'écran d'accueil, sans déformation (ratio conservé, non recoloré, sans ombre ni contour ajoutés), avec une zone de respiration autour.
- **EF2 — Remplacement du visuel titre.** Le visuel « HexGL by BKcore » (vaisseau + titre) n'apparaît plus sur l'écran d'accueil ; le logo ACME prend sa place.
- **EF3 — Message d'accueil.** Le texte exact « Bienvenue au ACME Racing Challenge » est affiché comme titre principal de l'accueil, accompagné de la ligne « Une experience evenementielle aux couleurs de la marque. » (reprise de l'intention visuelle de la charte, p. 4).
- **EF4 — Bouton de démarrage.** Le bouton Start affiche « DEMARRER LA COURSE » (libellé de la charte). Les autres entrées du menu (Controls, Quality, HUD, Credits) conservent leurs libellés anglais actuels.
- **EF5 — Couleurs.** Fond principal sombre (noir profond `#08090D`) ; accents violet `#7628FF`, bleu électrique `#315BFF`, cyan `#00C4E8` ; texte blanc `#FFFFFF` ; surfaces secondaires gris clair `#E6E8EE`. Dégradé événementiel autorisé : `#7628FF` → `#315BFF`. Aucun gris moyen dominant.
- **EF6 — Titre d'onglet.** Le titre de l'onglet du navigateur reflète « ACME Racing Challenge ». Les autres métadonnées (description, Open Graph, favicon) ne changent pas.
- **EF7 — Crédits.** L'entrée Credits reste présente et fonctionnelle ; les mentions d'attribution existantes (dont BKcore) sont conservées.

## 3. Comportements attendus

- Au chargement, l'accueil montre : logo ACME, message d'accueil, ligne d'accroche, bouton « DEMARRER LA COURSE », puis les réglages (Controls, Quality, HUD) et Credits, sur fond sombre.
- Les réglages (Controls, Quality, HUD) se modifient d'un clic comme avant, avec les mêmes valeurs et défauts ; les paramètres d'URL existants continuent d'agir.
- Le clic sur le bouton de démarrage enchaîne comme avant : écran d'aide aux contrôles → chargement → course → écran de score → rechargement.
- Le bouton et les entrées du menu restent lisibles et un retour visuel au survol existe, aux couleurs de la charte.
- Credits ouvre l'écran des crédits ; un clic en revient à l'accueil.

## 4. Contraintes

- **Gameplay, contrôles et HUD en course : strictement inchangés** (charte p. 4). Aucune modification de la physique, des circuits, des assets de jeu, ni du rendu 3D de la course.
- Intégration **sobre et maintenable** : pas d'effets complexes ajoutés (charte p. 4).
- **Typographie :** sans-serif lisible ; aucune nouvelle dépendance webfont pour le rebranding. La typographie existante peut être conservée si elle reste lisible et cohérente avec le ton de la charte.
- Logo utilisé tel que fourni (fichier à fond blanc, aucune version claire disponible) : il doit rester sur un fond lisible, conformément à la charte (fond blanc derrière le logo, comme sur l'intention visuelle).
- Aucune nouvelle dépendance externe (bibliothèque, CDN, service).
- Fonctionne sur le site statique actuel, servi en HTTP, sans étape de build.
- Lisibilité (contraste texte/fond suffisant) sur écran de bureau ; l'accueil ne déborde pas sur des tailles de fenêtre courantes (dont 1280x720).

## 5. Décisions de conception déjà imposées

| Décision | Origine |
|---|---|
| Message d'accueil exact : « Bienvenue au ACME Racing Challenge » | Charte p. 4 |
| Libellé du bouton : « DEMARRER LA COURSE » | Charte p. 4 |
| Fond sombre, accents violet / bleu / cyan, dégradé `#7628FF` → `#315BFF` | Charte p. 2-3 |
| Logo non déformé, non recoloré, sans ombre ni contour, avec zone de respiration | Charte p. 2 |
| Pas de nouvelle webfont ; typographie legacy conservable | Charte p. 3 |
| Branding sans impact sur gameplay / contrôles / HUD | Ticket + charte p. 4 |
| Logo ACME remplace le visuel « HexGL by BKcore » | Décision utilisateur |
| Seul le bouton de démarrage est en français ; autres libellés inchangés | Décision utilisateur |
| Métadonnées : seul le titre d'onglet change | Décision utilisateur |

## 6. Cas limites et gestion des erreurs

- **WebGL non disponible :** le comportement existant est conservé (le bouton signale l'absence de WebGL et renvoie vers la page d'aide) ; le message doit rester lisible dans le nouveau style.
- **Logo non chargé :** l'accueil reste utilisable (message, bouton et menu fonctionnent), sans bloc vide ni mise en page cassée.
- **Petites fenêtres / ratio différent :** logo non déformé et texte non tronqué ; le bouton reste visible et cliquable.
- **Mobile / tactile :** le mode tactile par défaut sur appareil tactile reste inchangé ; l'accueil reste utilisable (hors garantie de rendu pixel-perfect).
- **Retour depuis Credits :** l'accueil réapparaît intact (logo, message, bouton).
- **Libellés dynamiques :** les réglages réécrivent leur texte au chargement et au clic ; ce comportement ne doit pas effacer ni altérer le message d'accueil ou le libellé du bouton de démarrage.
- **Lancement en `file://` :** non supporté (déjà le cas pour le jeu) ; hors périmètre.

## 7. Hors périmètre

- Gameplay, physique, circuit, difficulté, contrôles, HUD en course, audio.
- Écrans d'étapes autres que l'accueil : aide aux contrôles, barre de chargement, score final (inchangés).
- Écran des crédits (contenu inchangé, seul le fond/couleur hérité éventuel est toléré).
- Traduction des autres libellés (Controls, Quality, HUD, Credits) et internationalisation.
- Métadonnées autres que le titre d'onglet (description, Open Graph, favicon, `fb:admins`), analytics, manifestes et packaging Firefox OS.
- Création d'une version claire/transparente du logo ; retouche du fichier logo.
- Correction des bugs et dettes listés dans `docs/architecture.md`.
- Nouveaux tests automatisés ou mise à jour des captures de référence (cf. critères pour la vérification manuelle).

## 8. Critères d'acceptation

1. **Logo :** le logo ACME est visible à l'accueil, ratio d'origine conservé, non recoloré, sur fond lisible, sans ombre ni contour.
2. **Message :** le texte « Bienvenue au ACME Racing Challenge » est affiché à l'identique, ainsi que la ligne d'accroche.
3. **Bouton :** le bouton affiche « DEMARRER LA COURSE » ; les autres libellés du menu sont inchangés.
4. **Visuel HexGL :** le vaisseau et le titre « HexGL by BKcore » n'apparaissent plus à l'accueil.
5. **Couleurs :** fond principal sombre `#08090D` ; accents limités à violet / bleu / cyan de la charte ; aucun gris moyen dominant ; texte lisible.
6. **Onglet :** le titre de l'onglet contient « ACME Racing Challenge ».
7. **Parcours complet :** accueil → clic démarrage → aide contrôles → chargement → course → fin avec temps affiché fonctionne comme avant (2 `<canvas>` en course, compte à rebours, HUD présent si activé).
8. **Réglages :** Controls, Quality, HUD cyclent comme avant ; un paramètre d'URL (ex. `?quality=0`) est toujours pris en compte.
9. **Credits :** s'ouvre, contient toujours l'attribution BKcore, et ramène à l'accueil intact.
10. **Absence de régression de gameplay :** aucun fichier ou comportement lié au jeu en course n'est modifié ; la suite QUnit (`formation/tests/ci-chrome.bat`) passe toujours (code retour 0).
11. **Aucune erreur console nouvelle** à l'accueil (hors erreurs préexistantes comme `/favicon.ico` en 404).
12. **Contrôle visuel :** capture de l'accueil en 1280x720 comparée à l'intention visuelle de la charte (p. 4) : logo, titre, accroche et bouton lisibles, sans débordement.
