# HexGL — Architecture (état actuel)

Document descriptif, établi par lecture du code et par lancement du jeu et des tests QUnit. Il décrit uniquement l'existant.

## 1. Stack et points d'entrée

| Élément | État actuel |
|---|---|
| Type | Jeu de course WebGL, site statique côté navigateur (aucun `package.json`, aucun build) |
| Langages | JavaScript (ES5, namespaces globaux `bkcore.*`), CoffeeScript (sources + JS compilé) |
| Moteur 3D | Three.js (`libs/Three.dev.js` chargé ; `libs/Three.r53.js` présent mais non chargé par `index.html`) |
| Post-traitement | `libs/ShaderExtras.js`, `libs/postprocessing/*` (EffectComposer, RenderPass, BloomPass, ShaderPass, MaskPass) |
| Autres libs | `Detector.js`, `Stats.js`, `DAT.GUI.min.js`, `leap-0.4.1.min.js` (Leap Motion) |
| Audio | Web Audio API (`AudioContext`), repli sur `<audio>` |
| Tests | QUnit 2.26.0 en local (`formation/tests/vendor/`), lancés dans le navigateur |
| Hébergement prévu | `.htaccess` (types MIME `.webapp`, `.appcache`), `cache.appcache`, `manifest.webapp`, `package.webapp`, `package.zip` (packaging Firefox OS) |

Points d'entrée :
- `index.html` : page unique du jeu. Elle contient le menu, le bloc de marque `#brand`, les écrans d'étape (`step-1` à `step-5`), les crédits et la liste des `<script>`.
- `launch.js` : bootstrap, généré par CoffeeScript 1.7.1 depuis `launch.coffee`. C'est `launch.js` qui est chargé.
- `branding/` : couche de personnalisation événementielle (ACME), chargée par `index.html` : `brand.css` après `multi.css`, `branding.js` juste avant `launch.js`. Voir section 7.
- `formation/tests/index.html` : page des tests QUnit.
- `bkcore.coffee/tests.html` : page de test CoffeeScript historique (charge `Timer.js`, `ImageData.js`, `Three.r53.js`, sans assertions).

## 2. Flux principal de lancement

Vérifié en exécutant le jeu : le menu s'affiche, le clic sur `#start` lance la course, et la page contient alors 2 `<canvas>` (rendu 3D et HUD).

1. `index.html` charge les scripts dans cet ordre : libs Three et post-traitement, contrôleurs (`bkcore.coffee/controllers/*`), `Timer`, `ImageData`, `Utils`, `bkcore/threejs/*`, `Audio`, `bkcore/hexgl/*`, `tracks/Cityscape.js`, `HexGL.js`, `branding/branding.js`, `launch.js`. L'ordre est le seul mécanisme de dépendance (pas de modules).
2. `launch.js` :
   - lit les réglages du menu (`controlType`, `quality`, `hud`, `godmode`), éventuellement surchargés par les paramètres d'URL via `bkcore.Utils.getURLParameter` ;
   - teste WebGL (`hasWebGL`). Sans WebGL, le bouton Start renvoie vers `get.webgl.org`. `launch.js` ne modifie le libellé de `#start` que dans ce cas ; sinon il vient de `branding/branding.js` (section 7) ;
   - Start masque `step-1` et affiche `step-2` (image d'aide `css/help-<contrôle>.png`).
3. Clic sur `step-2` : `init(...)` crée `new bkcore.hexgl.HexGL({... track: 'Cityscape', difficulty: 0 ...})`, expose `window.hexGL` et appelle `hexGL.load(...)`. Le constructeur appelle `initRenderer()` (renderer WebGL, `RenderManager`).
4. `HexGL.load` → `track.load` : `bkcore.threejs.Loader` charge textures, cubemap, géométries JSON, « analysers » (PNG de collision et de hauteur lus pixel par pixel via `ImageData`), images HUD et sons. `onProgress` alimente `#progressbar`.
5. `onLoad` → `hexGL.init()` : `initHUD`, `track.buildMaterials(quality)`, `track.buildScenes(...)`, `initGameComposer`. Puis `hexGL.start()` : boucle `requestAnimationFrame` (`update` → `gameplay.update` + `manager.renderCurrent`) et `initGameplay()` (compte à rebours, musique `bg` et `wind`).
6. Fin de course : `Gameplay.end` → `onFinish` → `HexGL.displayScore`. Comme `launch.js` fournit `gameover: #step-5`, `displayScore` affiche le temps dans `step-5` et retourne. Un clic recharge la page (`window.location.reload()`).
7. Échap pendant la partie : `HexGL.reset()` relance `gameplay.start()`.

## 3. Modules, fichiers et assets

### Code applicatif (~5 700 lignes hors libs)

| Fichier | Rôle |
|---|---|
| `bkcore/hexgl/HexGL.js` (446 l.) | Orchestrateur : options, renderer, HUD, composer, boucle, écran de score, difficulté (`tweakShipControls`) |
| `bkcore/hexgl/Gameplay.js` (230 l.) | Machine à états de course (compte à rebours, tours, checkpoints lus dans une image, fin) ; modes `timeattack`, `replay` (`survival` déclaré, non défini) |
| `bkcore/hexgl/ShipControls.js` (806 l.) | Physique et entrées (clavier, tactile, gamepad, Leap Motion, orientation), collisions et hauteur par lecture d'images |
| `bkcore/hexgl/tracks/Cityscape.js` (521 l.) | Unique circuit : liste des assets par qualité, matériaux, construction de la scène |
| `bkcore/hexgl/HUD.js`, `CameraChase.js`, `ShipEffects.js` | Affichage 2D canvas, caméra de poursuite, effets (particules, boosters) |
| `bkcore/hexgl/RaceData.js`, `Ladder.js` | Enregistrement/rejeu de course ; classement en ligne |
| `bkcore/threejs/Loader.js`, `RenderManager.js`, `Shaders.js` (949 l.), `Particles.js`, `Preloader.js` | Chargement d'assets, gestion de rendu, shaders GLSL, particules, préchargeur |
| `bkcore/Audio.js` | Façade audio (Web Audio ou `<audio>`) |
| `bkcore.coffee/Utils.js`, `Timer.js`, `ImageData.js` | Utilitaires généraux (compilés depuis `.coffee`) |
| `bkcore.coffee/controllers/{Touch,Orientation,Gamepad}Controller.js` | Contrôleurs d'entrée |
| `launch.js` / `launch.coffee` | Bootstrap et menu |
| `branding/branding.js` | **Point unique de configuration** du branding (`window.BRANDING` : nom, titre d'onglet, message d'accueil, accroche, libellé du bouton, logo, palette) et code qui l'applique (titre, textes, logo, variables CSS `--acme-*`) |
| `branding/brand.css` | Habillage de l'accueil `#step-1` uniquement, en `var(--acme-*)` |
| `branding/logo.png` | Copie non modifiée de `formation/identite/logo.png` (fond blanc) |

Non chargés par `index.html` : `bkcore/hexgl/Ladder.js`, `bkcore/threejs/Preloader.js`, `bkcore.coffee/threejs/Particles.*` (doublon de `bkcore/threejs/Particles.js`), `libs/Editor.html` et `libs/Editor_files/*` (éditeur tiers embarqué), `libs/Three.r53.js`, `bkcore.coffee/tests.html`.

Devenus inutilisés à l'accueil : `css/title.png` et `css/bg.jpg` existent toujours, mais ne sont plus demandés (`#title` est masqué par le CSS de branding et `#global` n'a plus d'image de fond).

### Assets (tailles mesurées)

| Dossier | Taille | Contenu |
|---|---|---|
| `textures/` | 4,2 Mo | Textures qualité basse/moyenne (`hud`, `particles`, `ships`, `skybox`, `tracks`, `bonus`) |
| `textures.full/` | 5,3 Mo | Textures qualité haute (avec cartes `normal` et `specular`) |
| `geometries/` | 1,3 Mo | Modèles Three.js JSON (`bonus`, `booster`, `ships`, `tracks`) |
| `audio/` | 2,1 Mo | `bg`, `wind`, `boost`, `crash`, `destroyed` (.ogg uniquement) |
| `replays/` | 0,6 Mo | `cityscape-casual/bkcore.replay.json` (aucune référence dans le code JS) |
| `css/` | — | Police Bebas Neue (eot/svg/ttf/woff), `multi.css`, `touchcontroller.css`, images d'aide et mobile, `title.png`, `bg.jpg` |
| `libs/` | 1,6 Mo | Bibliothèques tierces (voir section 1) |

Le dossier `formation/` contient du matériel de formation : `tests/` (QUnit), `identite/` (logo et charte ACME), `tickets/company-event.md` (demande de personnalisation de l'écran d'accueil).

### Mapping des réglages de qualité

`quality` : 0 LOW, 1 MID, 2 HIGH, 3 VERY HIGH (défaut menu : 3).
- `< 2` : `textures/`, `MeshBasicMaterial`.
- `>= 2` : `textures.full/`, matériaux `createNormalMaterial` (shaders normal/spéculaire).
- `> 2` : ombres, gamma, bloom.
- `0` : largeur et hauteur divisées par 2.
- `controlType` : 0 clavier, 1 tactile, 2 Leap Motion, 3 gamepad. `ShipControls` gère aussi 4 (orientation), absent du menu.

## 4. Dépendances et zones legacy à risque

- **Pas de gestionnaire de dépendances ni de modules** : tout est global (`bkcore`, `THREE`), l'ordre des `<script>` est critique.
- **Three.js ancien** (API pré-r53 : `texture` dans les uniforms, `lerpSelf`, `slerpSelf`, `mat.n44`, `computeTangents`, `renderer.physicallyBasedShading`). Aucune version du fichier n'est indiquée dans le nom de `Three.dev.js`.
- **Sources CoffeeScript doubles** : les `.coffee` coexistent avec les `.js` compilés dans `bkcore.coffee/`, générés par des versions différentes (1.4.0 pour `Timer`/`ImageData`, 1.7.1 pour `Utils`/`launch`). Aucun outil de compilation n'est présent dans le dépôt. `bkcore/*.js` (hors `.coffee`) est écrit à la main.
- **Leap Motion** : `leap-0.4.1.min.js` est chargé inconditionnellement.
- **Dépendances externes dans `index.html`** : script Google Analytics `ga.js` (compte `UA-26274524-4`, ancien Universal Analytics) chargé en HTTP/HTTPS selon la page ; URLs `hexgl.bkcore.com` pour favicon, `og:image` et partages ; `fb:admins`.
- **API obsolètes ou dépréciées** : `event.keyCode`, `ActiveXObject` (dans `Utils.request`), `panner.setPosition`, `noteOn`/`noteOff`, `localStorage` sans garde d'exception, PNG lus via `getImageData` (nécessite un serveur HTTP : un lancement en `file://` n'est pas fonctionnel pour le chargement des assets).
- **Cache applicatif** : `cache.appcache` (AppCache, supprimé des navigateurs modernes), `manifest.webapp`/`package.webapp` (Firefox OS).
- **Licence** : code sous CC BY-NC 3.0 (en-têtes) ; `audio/LICENSE` et `LICENSE` à la racine.
- **Binaire dans le dépôt** : `package.zip`.
- **Logique de jeu liée à des images** : checkpoints, collisions et hauteur sont lus pixel par pixel dans `textures/tracks/cityscape/{collision,height}.png` ; le moindre changement de ces PNG modifie le comportement.

## 5. Testabilité automatique

### Tests QUnit existants (`formation/tests/`)

Exécutés pendant cette exploration dans le navigateur : statut `pass`, 7 assertions et 0 échec, en 4 tests sur `bkcore.Utils` :
- `updateClass` (ajout), `updateClass` (suppression) ;
- `getOffsetTop` (objets simulés) ;
- `getURLParameter` (dépend de la présence de `hexgl_poc=ok`, que `index.html` ajoute par redirection).

Mécanique : `index.html` charge `vendor/qunit-2.26.0.js`, `../../bkcore.coffee/Utils.js` et `browser-tests.js`. Le statut est écrit dans les attributs `data-test-*` de `<html>`. Le test se considère en échec s'il y a moins de 4 tests (`count >= 4`). `ci-chrome.bat` et `ci-chrome.sh` lancent Chrome/Chromium/Edge en headless (`--dump-dom`) et renvoient 0, 1 ou 2 ; `rapport_erreur.html` n'est conservé qu'en cas d'erreur (ignoré par `.gitignore`).
Je n'ai pas exécuté les scripts `ci-chrome` eux-mêmes, seulement la page `index.html` via un navigateur piloté.

### Modules testables sans WebGL ni DOM de jeu (candidats directs)

Sans dépendance à Three.js (chargement dans la page QUnit suffisant) :
- `bkcore.Timer` : `msToTime`, `msToTimeString`, `zfill` (fonctions statiques pures), cycle `start`/`pause`/`update` (dépend de `Date`).
- `bkcore.ImageData.getPixel`, `getPixelBilinear`, `getPixelF`, `getPixelFBilinear` : testables en injectant un objet `pixels` ; le constructeur exige une `Image`.
- `bkcore.Utils` : `getURLParameter`, `getOffsetTop`, `updateClass` (déjà couverts), `isTouchDevice`, `request` (nécessite un XHR simulé).
- `bkcore.hexgl.RaceData` : `tick`, `export`, `import`, `applyInterpolated` avec un `shipControls` factice, mais dépend de `THREE.Vector3/Quaternion` (Three.js à charger).
- `bkcore.hexgl.Gameplay` : machine à états testable avec `shipControls`, `track`, `analyser` factices ; dépend de `bkcore.Timer` et `bkcore.hexgl.RaceData`.
- `bkcore.hexgl.Ladder` : dépend de `bkcore.Utils.request` (réseau).
- `HexGL.tweakShipControls` : affectations de constantes sur un objet ; la méthode n'est attachée qu'au prototype et appelle `this.components.shipControls`.

Difficiles à tester automatiquement : `ShipControls.update`, `collisionCheck`, `heightCheck` (physique et lectures d'images), `Cityscape.buildScenes`, `Shaders`, `HUD` (canvas 2D), `Audio`, `Loader`, `Preloader`, contrôleurs d'entrée (API navigateur : WebGL, Gamepad, orientation, Leap).

### Couverture actuelle
Seul `bkcore.Utils` (4 fonctions sur 8) est testé. `Timer`, `ImageData`, `RaceData`, `Gameplay`, `HexGL` n'ont aucun test.

L'interface de l'accueil (branding compris) n'est couverte par aucun test QUnit. Elle se vérifie dans le navigateur : textes exacts, couleurs calculées, ratio du logo, parcours accueil → course → score. La capture de référence `formation/tests/captures/01-accueil.png` montre l'accueil ACME.

## 6. Bugs, dettes et anomalies remarquables

Constatés à la lecture du code (non tous reproduits à l'exécution).

**Code mort ou jamais atteint par le flux actuel**
- `HexGL.displayScore` : toute la partie après `if(this.gameover !== null) {... return}` est inatteignable avec `launch.js` (qui fournit `gameover`).
- `bkcore/hexgl/Ladder.js` n'est pas chargé par `index.html` (`bkcore.hexgl.Ladder` est donc indéfini) ; `Ladder.load` n'est appelé nulle part ; il requête l'URL `"nothing"`.
- Mode `survival` déclaré dans `Gameplay.modes` mais jamais défini (valeur `null` : `modes[this.mode].call` échouerait). `launch.js` ne passe jamais `mode`, donc seul `timeattack` est utilisé.
- Mode `replay` : jamais sélectionnable depuis le menu.
- Option `godmode` : l'élément `#s-godmode` est masqué dans `index.html` (`display: none`) ; le réglage reste lisible via le paramètre d'URL `godmode`.

**Erreurs de code**
- `HexGL.js` : `JSON.Stringify` (au lieu de `JSON.stringify`) → `TypeError` si ce chemin était atteint.
- `HexGL.js` : les clés `localStorage` concatènent `t` (objet circuit) : `'score-'+t+'-'+d` donne `score-[object Object]-casual`.
- `Ladder.js` : références à `bkcore.Ladder` (inexistant) au lieu de `bkcore.hexgl.Ladder` ; `!x == undefined` toujours faux dans `displayLadder` ; la variable `m` calculée n'est pas utilisée (la boucle utilise `l.length-1`).
- `HexGL.displayScore` lit `bkcore.hexgl.Ladder.global[t][d]` alors que `Ladder.global` vaut `{}`.
- `RaceData.tick` : incrémente `this.rate` au lieu de `this.rateState`. `rateState` reste à 1, donc une entrée est enregistrée à chaque tick (le sous-échantillonnage prévu ne fonctionne pas) et `rate` augmente sans fin.
- `RaceData.applyInterpolated` : `this.data[this.seek]` est lu avant le contrôle `seek < 0` ; pas de `return` après la téléportation « sans interpolation », donc `next` peut être `undefined` quand `seek == last`.
- `Gameplay.modes.replay` : `self.result.REPLAY` (au lieu de `self.results.REPLAY`) → `undefined` passé à `end`.
- `Gameplay.start` : en mode `replay`, retourne `false` sans activer la partie en cas de données absentes.
- `Utils.request` : la boucle de `createXMLHTTPObject` va jusqu'à `i <= length` (indice hors tableau) ; si aucun constructeur ne réussit, la boucle ne se termine pas. Le `url += "?" + qdata` est dans la boucle sur `data`, et seulement si `postData != null` (donc pas pour le GET, où `postData` vaut `false` dans `Ladder.load`... et `false != null` est vrai, le chemin POST est donc pris malgré la valeur `false`).
- `Timer.msToTime` : clé `ms` dupliquée dans l'objet retourné ; `msToTimeString` complète `ms` à 4 chiffres alors que les millisecondes en ont 3.
- `Loader.loadSound(src, name, loop)` est appelé avec 4 arguments (`usePanner` ignoré) ; `Audio.addSound` reçoit `usePanner` `undefined`, donc le panner n'est jamais utilisé malgré la configuration de `Cityscape.js`.
- `Audio.addSound` : redéclaration de `var audio`.
- `HexGL.reset` (touche Échap) : `this.gameplay` est `null` tant que `start()` n'a pas été appelé (accès à `gameplay.start()`).
- `HexGL` : `this.a = window.location.href` et un `//if(this.a[15] == "o")` commenté : reste d'un verrouillage par domaine.
- `Cityscape.js` : `console.log('HIGH')` laissé dans le chargement ; commentaires « desktop/mobile » hérités d'une ancienne distinction.

**Incohérences d'interface**
- `index.html` affiche « Quality: High » alors que `launch.js` initialise l'étiquette à « VERY HIGH » (valeur par défaut 3) ; le texte HTML est écrasé au chargement.
- `index.html` : ancre « `hexgl.bkcore.com` » codée en dur pour favicon et `og:image`, alors que `favicon.png` existe en local ; `/favicon.ico` répond 404 en local (seule erreur console observée dans la page de tests).
- `index.html` : `<html lang="en">`, textes anglais ; `formation/tests/index.html` : `lang="fr"`, avec redirection JavaScript pour ajouter `?hexgl_poc=ok`.
- L'accueil ne présente plus l'identité HexGL / BKcore à l'écran ; elle subsiste dans les métadonnées de `index.html` (description, Open Graph, favicon, analytics), conservées volontairement (section 7).
- `HexGL.js` déclare `'use strict'` au niveau du fichier ; `'v1.0.1'` est une expression sans effet servant de marqueur de version.

**Dettes de structure**
- Fichiers JS générés versionnés à côté de leurs sources, sans chaîne de build ; versions CoffeeScript hétérogènes.
- Doublon `bkcore.coffee/threejs/Particles.js` / `bkcore/threejs/Particles.js`.
- Éditeur tiers complet (`libs/Editor.html`, `libs/Editor_files/*`, y compris jQuery 1.8 et ace) embarqué dans le dépôt.
- Un seul circuit, `Cityscape`, codé en dur dans `launch.js`.
- Difficulté : `launch.js` passe toujours `difficulty: 0` ; le profil « difficile » de `tweakShipControls` n'est pas accessible depuis l'interface.
- `Gameplay.simu` : méthode de simulation de fin de course (résultats codés en dur) laissée dans le code.
- Fichier `.gitignore` : ne contient que `.DS_Store` et le chemin du rapport d'erreur QUnit.
- Fichiers du dépôt non suivis dans le dépôt Git au moment de l'exploration : `.claude/` et `.playwright-mcp/` (produits par les outils de la session).

## 7. Branding événementiel (ACME)

Personnalisation de l'écran d'accueil `#step-1` (logo, couleurs, message d'accueil, libellé du bouton, titre d'onglet), sans toucher au gameplay. Besoin : `formation/tickets/company-event.md` ; identité : `formation/identite/` ; spécification et plan : `work/company-event/spec.md` et `plan.md`.

### Décisions durables
- **Couche additive** : seuls `index.html` (un `<link>`, le bloc `#brand`, un `<script>`) et le dossier `branding/` portent le branding. `launch.js` / `launch.coffee`, `css/multi.css`, `bkcore*` et `libs/` ne sont pas modifiés ; les sources CoffeeScript restent donc synchronisées avec les `.js` compilés.
- **Point unique de configuration** : `window.BRANDING` dans `branding/branding.js`. Un script global plutôt qu'un JSON, pour éviter un `fetch` et suivre le style du dépôt (globaux, ordre des `<script>`). La palette est injectée en variables CSS `--acme-*` sur `:root`.
- **Portée** : `brand.css` ne contient que des sélecteurs préfixés `#step-1` (aucune règle sur `html`, `body` ou `*`) pour ne pas affecter les écrans 2 à 5, le HUD ni les crédits.
- **Contraintes de la charte** à conserver : pas de nouvelle webfont (Bebas Neue conservée) ; gameplay, contrôles et HUD inchangés ; fond sombre ; logo ni déformé, ni recoloré, ni ombré (fichier à fond blanc, donc posé sur une carte blanche). Libellés de la charte, sans accents ; seul le bouton est en français (Controls, Quality, HUD et Credits restent en anglais). Crédits et attribution BKcore conservés ; autres métadonnées de `index.html` inchangées.

### Pièges
- **Ordre des scripts** : `branding.js` doit rester **avant** `launch.js`. Après lui, il écraserait le message « WebGL is not supported! » du bouton.
- **`!important`** : `multi.css` impose `#start:hover { color: … !important }` ; le survol du bouton dans `brand.css` doit donc aussi utiliser `!important`.
- **Variables CSS sans valeur de repli** : si `branding.js` ne se charge pas, l'accueil perd ses couleurs.
- **Logo** : fichier dupliqué (`formation/identite/logo.png` et `branding/logo.png`). S'il ne charge pas, la carte est masquée et le menu reste ancré en bas.
- **Mise en page** : bloc de marque et menu en unités relatives (`vh`, `min()`), vérifiés à 1280×720 et 1024×600.

### Modifier ou retirer le branding
- Modifier : éditer uniquement `branding/branding.js` (textes, logo, couleurs).
- Retirer : supprimer de `index.html` le `<link>` `branding/brand.css`, le bloc `#brand` et le `<script>` `branding/branding.js`, puis supprimer `branding/`.
