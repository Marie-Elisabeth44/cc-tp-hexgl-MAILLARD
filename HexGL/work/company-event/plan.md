# Plan — Branding ACME sur l'écran d'accueil HexGL

## 1. Objectif

Appliquer l'identité ACME (logo, couleurs, message d'accueil, bouton, titre d'onglet) à l'écran d'accueil `#step-1`, depuis **un seul point de configuration**, sans toucher au gameplay, à Three.js, à CoffeeScript, ni ajouter Node/build/dépendance. Référence : `work/company-event/spec.md`.

## 2. État actuel et architecture concernée

- `index.html` : `#step-1` = `#global` (fond `bg.jpg` animé) + `#title` (`title.png`, vaisseau « HexGL by BKcore ») + `#menucontainer > #menu` (`#start`, `#s-controlType`, `#s-quality`, `#s-hud`, `#s-godmode` masqué, `#s-credits`). `<title>` = « HexGL by BKcore ».
- `css/multi.css` : couleurs en dur (`#menu` `#4190bb`, `#start` `#f66439`, barre blanche translucide par entrée, `text-shadow` blanc), police Bebas Neue (`css/fonts.css`), `html,body{background:white}`.
- `launch.js` (compilé depuis `launch.coffee`, **non touché**) : réécrit `innerHTML` de `#s-controlType/quality/hud/godmode` ; ne touche `#start` que si WebGL est absent (« WebGL is not supported! »). Cliquer `#start` → `#step-2`. `#credits` revient à `#step-1`.
- `#step-2/3/5`, `#credits`, `#step-4` ont leurs propres styles : on ne les modifie pas.
- Aucune couverture de tests sur l'UI (QUnit : `Utils`, `Timer`, `ImageData` seulement).

## 3. Approche technique

Ajouter une couche de branding **additive** qui surcharge l'existant, supprimable en retirant ses balises :

1. Un dossier `branding/` (logo, config, feuille de style).
2. Un `branding.js` qui contient la config (données) et ~20 lignes qui l'appliquent : texte du titre d'onglet, contenu des éléments de marque, libellé de `#start`, variables CSS de couleur.
3. Un `brand.css`, chargé **après** `multi.css`, qui n'utilise que des `var(--acme-*)` et des sélecteurs préfixés `#step-1` pour ne pas toucher les autres écrans.
4. Dans `index.html` : une balise `<link>`, une balise `<script>` (avant `launch.js`) et un bloc de markup vide `#brand` dans `#step-1`.

`launch.js`/`launch.coffee` restent identiques : pas de désynchronisation des sources compilées.

## 4. Fichiers et modules impactés

| Fichier | Action |
|---|---|
| `branding/branding.js` | **Nouveau** : config + application |
| `branding/brand.css` | **Nouveau** : styles de l'accueil (variables uniquement) |
| `branding/logo.png` | **Nouveau** : copie de `formation/identite/logo.png`, non modifiée (le dossier `formation/` reste du matériel de formation) |
| `index.html` | 3 ajouts (link, script, bloc `#brand`) ; `#title` masqué par CSS, pas supprimé |
| `css/multi.css`, `launch.*`, `bkcore*`, `libs/`, `css/title.png`, `css/bg.jpg` | **Inchangés** (retour arrière = retirer les ajouts d'`index.html`) |

## 5. Structure des données de branding

```js
window.BRANDING = {
  company: 'ACME',
  pageTitle: 'ACME Racing Challenge',
  welcome: 'Bienvenue au ACME Racing Challenge',
  tagline: 'Une experience evenementielle aux couleurs de la marque.',
  startLabel: 'DEMARRER LA COURSE',
  logo: { src: 'branding/logo.png', alt: 'ACME — Streaming a brighter tomorrow' },
  colors: { bg: '#08090D', violet: '#7628FF', blue: '#315BFF', cyan: '#00C4E8',
            text: '#FFFFFF', surface: '#E6E8EE' }
}
```

Libellés tels que dans la charte (sans accents, comme le PDF). `colors` est injecté en `--acme-*` sur `:root` ; le dégradé `violet → blue` est composé en CSS.

## 6. Décisions techniques principales

- **JS de config plutôt que JSON** : un `fetch` échouerait en `file://` et ajoute un état de chargement ; un script global suit le style du dépôt (namespaces globaux, ordre des `<script>`).
- **Surcharge CSS plutôt que modification de `multi.css`** : diff minimal, réversible, l'existant reste lisible.
- **Pas de nouvelle webfont** : Bebas Neue conservée (charte : typo legacy conservable). Note : sans-serif à graisse forte, cohérente avec « titres en gras ».
- **`#start` restylé en pastille violette** (hover cyan/bleu), autres entrées en texte blanc avec survol cyan, barre blanche translucide et `text-shadow` supprimés (illisibles sur fond sombre). Pas d'animation ajoutée ; l'animation de `#global` est coupée.
- **Logo dans une carte blanche** (fichier à fond blanc, sans version claire), ratio 3:1 préservé (`width` bornée, `height:auto`), pas d'ombre ni de contour.
- **Logo absent** : `onerror` masque la carte ; message, bouton et menu restent utilisables.
- **Ordre de chargement** : `branding.js` avant `launch.js`, donc le message « WebGL is not supported! » de `launch.js` écrase le libellé en cas d'absence de WebGL (comportement conservé).
- **Titre d'onglet** fixé par `document.title` depuis la config (le `<title>` HTML d'origine sert de repli).
- **Crédits** : inchangés (attribution BKcore conservée).

## 7. Risques et compatibilité

- **Hauteur 720 px** : logo + titre + accroche + menu (≈ 5 lignes, ancré `bottom:10%`) peuvent se chevaucher. Dimensions du bloc `#brand` en unités relatives (`vh`/`min()`), vérifiées à 1280×720 et 1024×600.
- **Spécificité CSS** : `#menu div` et ses déclinaisons `-webkit-` en dur dans `multi.css` ; `brand.css` doit les neutraliser par des sélecteurs `#step-1 …` de même ou plus forte spécificité (pas de `!important` généralisé).
- **Portée** : aucune règle globale (`html`, `body`, `*`) afin de ne pas affecter `#step-2/3/4/5` ni le HUD.
- **Variables CSS sans repli** : si `branding.js` ne charge pas, l'accueil perd ses couleurs (assumé : un seul point de vérité). Le premier test détecte ce cas.
- **Navigateurs** : variables CSS et `min()` supportés par les navigateurs actuels ; l'ancien support Firefox OS/IE est hors périmètre (cf. spec).
- **Commandes de lancement** : `serve.js` exige Node (exclu). Python 3 et PHP ne sont pas disponibles ici (`python3` n'est que le raccourci Microsoft Store ; PHP absent). Voir §8.

## 8. Stratégie de tests et de vérification

**Lancer le jeu sans Node** (outil local, non versionné, hors dépôt) : petit serveur statique PowerShell (`System.Net.HttpListener`, présent dans Windows PowerShell 5.1), servant la racine du dépôt sur `http://localhost:8080` avec les types MIME `.html .js .css .png .jpg .json .ogg`. Si un vrai Python 3 est installé : `python -m http.server 8080` suffit. Un lancement `file://` ne charge pas les assets.

**Après chaque étape**
- `formation\tests\ci-chrome.bat` → code retour 0 (rappel : il ne couvre pas l'UI ; il garantit l'absence de régression des utilitaires).
- Contrôle de l'accueil dans le navigateur (Playwright MCP déjà configuré, ou ouverture manuelle) : capture 1280×720, console sans nouvelle erreur (le 404 `/favicon.ico` est préexistant).
- `git status`/`git diff --stat` : seuls `index.html` et `branding/` changent, aucun fichier de jeu.

**Vérifications finales** (critères de la spec) : texte exact du message et du bouton, titre d'onglet, `#title` masqué, couleurs calculées (`getComputedStyle`) conformes à la charte, parcours complet accueil → aide → chargement → course (2 `<canvas>`, HUD) → score, `?quality=0` pris en compte, Credits aller-retour, cas WebGL absent (libellé de `launch.js` lisible) et logo absent (renommage temporaire du fichier).

**Aucun commit** pendant l'implémentation ; le commit suivra la validation finale. Avant ce commit : supprimer `formation/tests/rapport_erreur.html` si le `.bat` l'a laissé (cf. CLAUDE.md). Les captures de référence `formation/tests/captures/` ne sont pas mises à jour automatiquement (hors périmètre ; à proposer à la validation).

## 9. Plan d'implémentation (4 étapes)

1. **Socle de branding** — créer `branding/` (logo copié, `branding.js` avec config + application, `brand.css` vide de règles visuelles), ajouter le `<link>`, le `<script>` (avant `launch.js`) et le bloc `#brand` vide dans `index.html`.
   *Vérif :* page chargée sans erreur ; `window.BRANDING` défini ; `document.title`, texte du message/de l'accroche et de `#start` conformes ; logo servi en HTTP 200 ; QUnit OK.
2. **Habillage de l'accueil** — dans `brand.css` : fond sombre, `#title` masqué, carte du logo, titre et accroche, bouton violet, menu recoloré (blanc/cyan).
   *Vérif :* capture 1280×720 et 1024×600 comparée à la charte p. 4, sans chevauchement ni débordement ; couleurs conformes ; QUnit OK.
3. **États et cas limites** — survols, retour depuis Credits, `#start` en cas d'absence de WebGL, masquage de la carte si le logo est introuvable, libellés réécrits par `launch.js` intacts.
   *Vérif :* chaque cas observé manuellement (simulation WebGL absent via lancement navigateur sans WebGL ou inspection du DOM ; logo renommé temporairement puis restauré) ; QUnit OK.
4. **Recette finale** — parcours complet de bout en bout, `?quality=0`, `git diff --stat` limité à `index.html` + `branding/`, suppression de `rapport_erreur.html`, revue des critères de la spec (1 à 12). Aucun commit.
