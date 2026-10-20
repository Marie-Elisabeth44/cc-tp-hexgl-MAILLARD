/* Tests du code existant HexGL, sans Node.js. QUnit est chargé localement. */
(function () {
  "use strict";
  if (typeof QUnit === "undefined") {
    document.documentElement.dataset.testStatus = "fail";
    document.documentElement.dataset.testCount = "0";
    document.documentElement.dataset.testFailures = "1";
    document.body.insertAdjacentHTML("afterbegin", "<p style='color:red'>QUnit introuvable : vérifiez le fichier vendor/qunit-2.26.0.js</p>");
    return;
  }

  // Compatible avec le script Chrome headless existant : état mesurable dans le DOM.
  QUnit.done(function (result) {
    const count = result.total;
    const failed = result.failed;
    const root = document.documentElement;
    root.setAttribute("data-test-count", String(count));
    root.setAttribute("data-test-failures", String(failed));
    root.setAttribute("data-test-status", failed === 0 && count >= 4 ? "pass" : "fail");
    let summary = document.getElementById("summary");
    if (!summary) {
      summary = document.createElement("p");
      summary.id = "summary";
      document.body.appendChild(summary);
    }
    summary.textContent = count + " test(s) : " + (count - failed) + " réussi(s), " + failed + " échec(s).";
  });

  const U = window.bkcore && window.bkcore.Utils;
  QUnit.module("HexGL — bkcore.Utils", function () {
    QUnit.test("updateClass ajoute une classe", function (assert) {
      assert.ok(U, "Utils.js chargé");
      const e = document.createElement("div");
      e.id = "test-hexgl-add";
      document.getElementById("qunit-fixture").appendChild(e);
      U.updateClass(e.id, "active", true);
      assert.true(e.classList.contains("active"));
    });
    QUnit.test("updateClass supprime une classe", function (assert) {
      assert.ok(U, "Utils.js chargé");
      const e = document.createElement("div");
      e.id = "test-hexgl-remove";
      e.className = "active";
      document.getElementById("qunit-fixture").appendChild(e);
      U.updateClass(e.id, "active", false);
      assert.false(e.classList.contains("active"));
    });
    QUnit.test("getOffsetTop additionne les décalages parent/enfant", function (assert) {
      const parent = {
        offsetTop: 37,
        offsetParent: null
      };
      const enfant = {
        offsetTop: 13,
        offsetParent: parent
      };
      assert.strictEqual(U.getOffsetTop(enfant), 50);
    });
    QUnit.test("getURLParameter lit les paramètres d'URL", function (assert) {
      assert.ok(U, "Utils.js chargé");
      U.URLParameters = null;
      const url = new URL(window.location.href);
      url.searchParams.set("hexgl_poc", "ok");
      // Le lanceur fournit hexgl_poc=ok ; en ouverture directe, on teste l'absence ou la présence.
      const expected = window.location.search.includes("hexgl_poc=ok") ? "ok" : null;
      assert.strictEqual(U.getURLParameter("hexgl_poc"), expected);
    });
    QUnit.test("getURLParameter : paramètre absent = undefined, valeur brute (non décodée)", function (assert) {
      const avant = window.location.href;
      try {
        history.replaceState(null, "", "?hexgl_poc=ok&quality=2&name=a%20b");
        U.URLParameters = null;
        assert.strictEqual(U.getURLParameter("quality"), "2", "valeur lue en chaîne");
        assert.strictEqual(U.getURLParameter("name"), "a%20b", "pas de décodage");
        assert.strictEqual(U.getURLParameter("absent"), undefined);
      } finally {
        history.replaceState(null, "", avant);
        U.URLParameters = null;
      }
    });
    QUnit.test("updateClass ne plante pas si l'élément n'existe pas", function (assert) {
      assert.strictEqual(U.updateClass("id-inexistant-hexgl", "active", true), undefined);
    });
  });

  const T = window.bkcore && window.bkcore.Timer;
  QUnit.module("HexGL — bkcore.Timer", function () {
    QUnit.test("msToTime décompose des millisecondes en h/m/s/ms", function (assert) {
      assert.deepEqual(T.msToTime(3723456), { h: 1, m: 2, s: 3, ms: 456 });
      assert.deepEqual(T.msToTime(0), { h: 0, m: 0, s: 0, ms: 0 });
      assert.deepEqual(T.msToTime(59999), { h: 0, m: 0, s: 59, ms: 999 });
    });
    QUnit.test("zfill complète avec des zéros sans tronquer", function (assert) {
      assert.strictEqual(T.zfill(5, 2), "05");
      assert.strictEqual(T.zfill(123, 2), "123");
      assert.strictEqual(T.zfill(0, 3), "000");
    });
    QUnit.test("msToTimeString complète heures, minutes et secondes sur 2 chiffres", function (assert) {
      const t = T.msToTimeString(65000);
      assert.strictEqual(t.h, "00");
      assert.strictEqual(t.m, "01");
      assert.strictEqual(t.s, "05");
    });
    QUnit.test("cycle de vie : inactif par défaut, start/pause/update", function (assert) {
      const t = new T();
      assert.false(t.active, "inactif à la création");
      t.update();
      assert.strictEqual(t.time.elapsed, 0, "update sans effet tant qu'inactif");
      t.start();
      assert.true(t.active);
      assert.strictEqual(t.time.elapsed, 0);
      t.pause(true);
      assert.false(t.active, "pause(true) désactive");
      t.pause(false);
      assert.true(t.active, "pause(false) réactive");
      t.time.start -= 1500;
      t.update();
      assert.true(t.time.elapsed >= 1500, "le temps écoulé suit l'horloge");
      assert.deepEqual(t.getElapsedTime(), T.msToTime(t.time.elapsed));
    });
  });

  const ID = window.bkcore && window.bkcore.ImageData;
  QUnit.module("HexGL — bkcore.ImageData (lecture de pixels, sans image)", function () {
    // Image 2x2 injectée directement : le constructeur (Image, canvas) n'est pas utilisé.
    function fabrique() {
      const img = Object.create(ID.prototype);
      img.pixels = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          10, 20, 30, 255, 40, 50, 60, 255,
          70, 80, 90, 255, 100, 110, 120, 255
        ])
      };
      return img;
    }
    QUnit.test("getPixel lit le bon pixel RGBA", function (assert) {
      const img = fabrique();
      assert.deepEqual(img.getPixel(0, 0), { r: 10, g: 20, b: 30, a: 255 });
      assert.deepEqual(img.getPixel(1, 0), { r: 40, g: 50, b: 60, a: 255 });
      assert.deepEqual(img.getPixel(0, 1), { r: 70, g: 80, b: 90, a: 255 });
      assert.deepEqual(img.getPixel(1, 1), { r: 100, g: 110, b: 120, a: 255 });
    });
    QUnit.test("getPixel renvoie du noir transparent hors limites ou sans données", function (assert) {
      const noir = { r: 0, g: 0, b: 0, a: 0 };
      const img = fabrique();
      assert.deepEqual(img.getPixel(-1, 0), noir);
      assert.deepEqual(img.getPixel(0, 2), noir);
      assert.deepEqual(img.getPixel(2, 0), noir);
      img.pixels = null;
      assert.deepEqual(img.getPixel(0, 0), noir);
    });
    QUnit.test("getPixelF encode R + G*255 + B*255*255", function (assert) {
      assert.strictEqual(fabrique().getPixelF(0, 0), 10 + 20 * 255 + 30 * 255 * 255);
    });
    QUnit.test("getPixelBilinear au centre d'un pixel renvoie ce pixel", function (assert) {
      const c = fabrique().getPixelBilinear(0.5, 0.5);
      assert.deepEqual([c.r, c.g, c.b, c.a], [10, 20, 30, 255]);
    });
    QUnit.test("getPixelBilinear à la jonction de 4 pixels renvoie leur moyenne", function (assert) {
      const c = fabrique().getPixelBilinear(1, 1);
      assert.strictEqual(c.r, (10 + 40 + 70 + 100) / 4);
      assert.strictEqual(c.g, (20 + 50 + 80 + 110) / 4);
      assert.strictEqual(c.b, (30 + 60 + 90 + 120) / 4);
    });
  });
})();
