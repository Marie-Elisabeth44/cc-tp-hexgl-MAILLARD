// Point unique de configuration du branding événementiel (ACME). Chargé avant launch.js.
window.BRANDING = {
  company: 'ACME',
  pageTitle: 'ACME Racing Challenge',
  welcome: 'Bienvenue au ACME Racing Challenge',
  tagline: 'Une experience evenementielle aux couleurs de la marque.',
  startLabel: 'DEMARRER LA COURSE',
  logo: { src: 'branding/logo.png', alt: 'ACME — Streaming a brighter tomorrow' },
  colors: { bg: '#08090D', violet: '#7628FF', blue: '#315BFF', cyan: '#00C4E8',
            text: '#FFFFFF', surface: '#E6E8EE' }
};

(function (b) {
  var $ = function (id) { return document.getElementById(id); };
  var logo = $('brand-logo-img');

  document.title = b.pageTitle;
  $('brand-welcome').textContent = b.welcome;
  $('brand-tagline').textContent = b.tagline;
  $('start').textContent = b.startLabel;

  // Logo introuvable : on masque la carte, le reste de l'accueil reste utilisable.
  logo.onerror = function () { $('brand-logo').style.display = 'none'; };
  logo.alt = b.logo.alt;
  logo.src = b.logo.src;

  for (var k in b.colors) {
    document.documentElement.style.setProperty('--acme-' + k, b.colors[k]);
  }
})(window.BRANDING);
