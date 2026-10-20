---
name: run-hexgl
description: Run, start, serve and screenshot HexGL (jeu de course WebGL statique) avec Node.js et le driver Playwright. Utiliser pour lancer le jeu, cliquer Start, prendre une capture.
---

HexGL est un site statique (pas de package.json, pas de build). On le sert avec `serve.js` (Node, stdlib seule) et on le pilote via Playwright (MCP `mcp__playwright__*`). Les chemins sont relatifs à la racine `HexGL/`.

## Prérequis
Node.js (testé v24.21.0 sous Windows 11). Rien à installer.

## Run (agent path)

1. Serveur, en arrière-plan (port 8080, `PORT=xxxx` pour changer) :
   ```bash
   node .claude/skills/run-hexgl/serve.js . &
   curl -s -o /dev/null -w "%{http_code}\n" localhost:8080/   # 200
   ```
2. Menu : `mcp__playwright__browser_navigate` vers `http://localhost:8080/`, puis `browser_take_screenshot` (menu HexGL, 0 erreur console).
3. Lancer une partie et capturer (`browser_run_code_unsafe`) :
   ```js
   async (page) => { await page.click('#start'); await page.waitForTimeout(10000);
     await page.screenshot({path:'.claude/skills/run-hexgl/game.png'});
     return await page.evaluate(()=>document.querySelectorAll('canvas').length); }
   ```
   Résultat attendu : `2` canvas ; la capture montre le vaisseau sur la grille de départ, HUD 1/3.

Captures de référence : `menu.png`, `game.png` dans ce dossier.

## Gotchas
- Le bouton s'affiche « START » via CSS mais le texte DOM est « Start » : utiliser le sélecteur `#start`, pas `getByText('START')` (timeout).
- Attendre ~10 s après le clic : les géométries/textures se chargent avant l'affichage de la piste.
- Il faut un serveur HTTP : ouvrir `index.html` en `file://` bloque les chargements XHR.
- 10 warnings console au lancement de la partie, 0 erreur : normal.

## Run (human path)
Ouvrir http://localhost:8080/ dans un navigateur après l'étape 1.

## Tests
Non exécutés dans ce skill (les tests QUnit sont sous `formation/tests`).
