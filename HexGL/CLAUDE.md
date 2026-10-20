# HexGL — notes pour Claude

Site statique (JS/CoffeeScript compilé, Three.js, WebGL), sans build ni `package.json`. Architecture : `docs/architecture.md`.

## Tests (QUnit, sans Node.js)
- Windows : `formation\tests\ci-chrome.bat` — Linux : `bash formation/tests/ci-chrome.sh`.
- Codes de retour : 0 = réussis, 1 = échecs, 2 = impossibles (Chrome/Edge introuvable).
- Manuel : ouvrir `formation/tests/index.html` (via http ou file).
- Tests dans `formation/tests/browser-tests.js` ; les scripts testés sont chargés dans `formation/tests/index.html`. Couverts : `bkcore.Utils`, `bkcore.Timer`, `bkcore.ImageData` (lecture de pixels).
- Le `.bat` laisse `formation/tests/rapport_erreur.html` même en cas de succès (statut `pass` dans `<html data-test-status>`) ; le supprimer avant de commiter.
- Les tests ne figent ni le branding ni les textes de l'interface.

## Lancer le jeu
Serveur : `node .claude/skills/run-hexgl/serve.js .` puis http://localhost:8080 (voir le skill `run-hexgl`). Un lancement en `file://` ne charge pas les assets.

## Captures de référence
`formation/tests/captures/` : `01-accueil.png` (menu) et `02-jeu-en-cours.png` (course en cours), viewport 1280x720, prises avec Playwright. Elles sont manuelles : aucun test ne les compare.
