(function () {
  var S = window.GT_SERVICES, I = window.GT_I18N;
  var qp = (new URLSearchParams(location.search).get("lang") || "").toLowerCase();
  if (qp === "en" || qp === "es") localStorage.setItem("gt-lang", qp);
  var saved = localStorage.getItem("gt-lang");
  var lang = saved || ((navigator.language || "en").toLowerCase().indexOf("es") === 0 ? "es" : "en");
  var sizes = {}; S.forEach(function (s) { sizes[s.id] = 0; });
  var quote = JSON.parse(localStorage.getItem("gt-quote") || "[]");
  var t = function (k) { return I[lang][k] || I.en[k] || k; };
  var money = function (n) { return "$" + n.toFixed(0); };
  var dur = function (m) { var h = Math.floor(m / 60), r = m % 60; return (h ? h + " " + t("h") : "") + (r ? " " + r + " " + t("m") : ""); };
  var esc = function (s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; };

  function toast(msg) { var el = document.getElementById("toast"); el.textContent = msg; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { el.hidden = true; }, 2200); }

  function renderCards() {
    var labels = [["small","smallSub"],["midsize","midSub"],["large","largeSub"]];
    document.getElementById("cards").innerHTML = S.map(function (s) {
      var i = sizes[s.id];
      return '<article class="card"><h3>' + esc(s.name[lang]) + '</h3>' +
        '<p class="price-chip" id="p-' + s.id + '">' + money(s.prices[i]) + '</p>' +
        '<p class="muted small">' + t("duration") + ': ' + dur(s.mins) + '</p>' +
        (s.desc ? '<p class="desc">' + esc(s.desc[lang]) + '</p>' : '') +
        s.groups.map(function (g) { return '<h4>' + t(g.t) + '</h4><ul>' + g.items[lang].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>'; }).join("") +
        '<fieldset class="sizes"><legend>' + t("size") + '</legend>' + labels.map(function (l, j) {
          return '<label><input type="radio" name="sz-' + s.id + '" value="' + j + '"' + (j === i ? " checked" : "") + ' data-id="' + s.id + '"><span>' + t(l[0]) + '<small>' + t(l[1]) + '</small><b>' + money(s.prices[j]) + '</b></span></label>';
        }).join("") + '</fieldset>' +
        '<button type="button" class="btn primary" data-add="' + s.id + '">' + t("add") + '</button></article>';
    }).join("");
  }

  function renderQuote() {
    var list = document.getElementById("quote-list"), sum = 0, sz = ["small","midsize","large"];
    list.innerHTML = quote.map(function (q, k) {
      var s = S.filter(function (x) { return x.id === q.id; })[0]; if (!s) return "";
      sum += s.prices[q.size];
      return '<li><span>' + esc(s.name[lang]) + ' <small>(' + t(sz[q.size]) + ')</small></span><span>' + money(s.prices[q.size]) +
        ' <button type="button" class="x" data-rm="' + k + '" aria-label="' + t("remove") + '">×</button></span></li>';
    }).join("");
    document.getElementById("quote-empty").hidden = quote.length > 0;
    document.getElementById("subtotal").textContent = money(sum);
    localStorage.setItem("gt-quote", JSON.stringify(quote));
    var mins = quote.reduce(function (m, q) { var s = S.filter(function (x) { return x.id === q.id; })[0]; return m + (s ? s.mins : 0); }, 0);
    var w = document.getElementById("long-warn"); if (w) { w.hidden = mins <= 300; w.textContent = t("tooLong").replace("{h}", (Math.round(mins / 6) / 10) + ""); }
    if (window.__gtBookHref) window.__gtBookHref();
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-content]").forEach(function (el) { el.setAttribute("content", t(el.dataset.i18nContent)); });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) { el.setAttribute("title", t(el.dataset.i18nTitle)); });
    document.querySelectorAll(".lang-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    renderCards(); renderQuote();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.lang) { lang = b.dataset.lang; localStorage.setItem("gt-lang", lang); applyLang(); }
    else if (b.dataset.add) { quote.push({ id: b.dataset.add, size: sizes[b.dataset.add] }); renderQuote(); toast(t("added")); }
    else if (b.dataset.rm) { quote.splice(+b.dataset.rm, 1); renderQuote(); }
  });
  document.addEventListener("change", function (e) {
    var r = e.target; if (!r.dataset.id) return;
    sizes[r.dataset.id] = +r.value;
    var s = S.filter(function (x) { return x.id === r.dataset.id; })[0];
    document.getElementById("p-" + s.id).textContent = money(s.prices[+r.value]);
  });

  // Book now: email the quote to G.T.
  var _bf=document.getElementById("book-form"); _bf && _bf.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!quote.length) { toast(t("needService")); return; }
    var f = e.target, sz = ["Small","Midsize","Large"], sum = 0;
    var lines = quote.map(function (q) { var s = S.filter(function (x) { return x.id === q.id; })[0]; if (!s) return ""; sum += s.prices[q.size]; return "- " + s.name.en + " (" + sz[q.size] + "): " + money(s.prices[q.size]); });
    var body = [t("mailIntro"), "", lines.join("\n"), "Subtotal: " + money(sum), "",
      "Name: " + f.name.value, "Phone: " + f.phone.value, "Email: " + f.email.value, "Address: " + f.addr.value,
      "Preferred time: " + (f.when.value ? f.when.value.replace("T", " ") : "-"), "Notes: " + f.notes.value, "Language: " + lang].join("\n");
    toast(t("sent"));
    location.href = "sms:+15755303466" + (/iphone|ipad|ipod/i.test(navigator.userAgent) ? "&" : "?") + "body=" + encodeURIComponent(body);
  });

  // Share (navigator.share is called synchronously inside the click — iOS needs the user gesture)
  var IS = {
    en: { iosTitle: "Install G.T. Details on iPhone", s1: "Tap the Share button", s1b: "at the bottom (or top) of Safari.", s2: "Scroll down and tap “Add to Home Screen”.", s3: "Tap “Add”. The app icon appears on your home screen.",
      openSafari: "To install, open this page in Safari: tap ⋯ or the menu and choose “Open in Safari” (or copy the link and paste it in Safari).", chromeIos: "In Chrome on iPhone: tap the Share button next to the address bar, then “Add to Home Screen”.",
      andTitle: "Install G.T. Details", and1: "Open the browser menu ⋮ (top right).", and2: "Tap “Install app” or “Add to Home screen”.", and3: "Confirm with “Install” / “Add”.", close: "Got it", copyLink: "Copy link" },
    es: { iosTitle: "Instala G.T. Details en tu iPhone", s1: "Toca el botón Compartir", s1b: "abajo (o arriba) en Safari.", s2: "Desliza y toca “Agregar a inicio”.", s3: "Toca “Agregar”. El ícono de la app aparecerá en tu pantalla de inicio.",
      openSafari: "Para instalar, abre esta página en Safari: toca ⋯ o el menú y elige “Abrir en Safari” (o copia el enlace y pégalo en Safari).", chromeIos: "En Chrome para iPhone: toca el botón Compartir junto a la barra de direcciones y luego “Agregar a inicio”.",
      andTitle: "Instala G.T. Details", and1: "Abre el menú del navegador ⋮ (arriba a la derecha).", and2: "Toca “Instalar app” o “Agregar a la pantalla principal”.", and3: "Confirma con “Instalar” / “Agregar”.", close: "Entendido", copyLink: "Copiar enlace" }
  };
  var s = function (k) { return (IS[lang] || IS.en)[k]; };
  var pageUrl = function () { return location.origin + location.pathname; };
  function copyLink() {
    var url = pageUrl();
    var done = function () { toast(t("linkCopied")); };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(url).then(done, fallbackCopy); } else fallbackCopy();
    function fallbackCopy() { var ta = document.createElement("textarea"); ta.value = url; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, url.length); var ok = false; try { ok = document.execCommand("copy"); } catch (e) {} document.body.removeChild(ta); if (ok) done(); else window.prompt(t("share"), url); }
  }
  document.getElementById("share-btn").addEventListener("click", function () {
    var data = { title: "G.T. Details", text: t("shareText"), url: pageUrl() };
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      navigator.share(data).catch(function (err) { if (err && err.name === "AbortError") return; copyLink(); });
      return;
    }
    copyLink();
  });

  // Install
  var deferred = null, installBtn = document.getElementById("install-btn"), ua = navigator.userAgent;
  var standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  var ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var inApp = /FBAN|FBAV|FB_IAB|Instagram|Line\/|Snapchat|TikTok|Twitter|LinkedInApp|GSA\//i.test(ua);
  var iosChrome = ios && /CriOS|EdgiOS|FxiOS/i.test(ua);
  var iosVer = (ua.match(/OS (\d+)_(\d+)/) || [0, 0, 0]); var iosNum = +iosVer[1] + iosVer[2] / 100;
  var shareSvg = '<svg class="share-ico" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 11H5v10h14V11h-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  function sheet(html) {
    var old = document.getElementById("install-sheet"); if (old) old.remove();
    var w = document.createElement("div"); w.id = "install-sheet"; w.className = "sheet-wrap"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true");
    w.innerHTML = '<div class="sheet">' + html + '<div class="sheet-btns"><button type="button" class="ghost" data-sheet-copy>' + s("copyLink") + '</button><button type="button" class="btn primary" data-sheet-close>' + s("close") + '</button></div></div>';
    w.addEventListener("click", function (e) { if (e.target === w || e.target.hasAttribute("data-sheet-close")) w.remove(); else if (e.target.hasAttribute("data-sheet-copy")) copyLink(); });
    document.body.appendChild(w);
  }
  function showIosSheet() {
    var body = '<h2>' + s("iosTitle") + '</h2>';
    if (inApp || (iosChrome && iosNum < 16.4)) body += '<p class="sheet-warn">' + s("openSafari") + '</p>';
    else {
      if (iosChrome) body += '<p class="sheet-note">' + s("chromeIos") + '</p>';
      body += '<ol class="steps"><li>' + s("s1") + ' <span class="ico-chip">' + shareSvg + '</span> ' + s("s1b") + '</li><li>' + s("s2") + ' <span class="ico-chip">＋</span></li><li>' + s("s3") + '</li></ol>';
    }
    sheet(body);
  }
  function showAndroidSheet() { sheet('<h2>' + s("andTitle") + '</h2><ol class="steps"><li>' + s("and1") + '</li><li>' + s("and2") + '</li><li>' + s("and3") + '</li></ol>'); }
  if (standalone) installBtn.hidden = true;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; });
  installBtn.addEventListener("click", function () {
    if (deferred) { var d = deferred; deferred = null; d.prompt(); (d.userChoice || Promise.resolve()).then(function (c) { if (c && c.outcome === "accepted") installBtn.hidden = true; }); return; }
    if (ios) showIosSheet(); else showAndroidSheet();
  });
  window.addEventListener("appinstalled", function () { installBtn.hidden = true; toast(t("installed")); });
  window.__gtInstall = { ios: ios, inApp: inApp, standalone: standalone };

  // Book Now: deep-link quoted services into Setmore, copy full quote to clipboard, show paste instruction.
  (function () {
    var SM = { stage2: "3994676f-dc37-4eac-9198-86795946228c", stage1: "1b499e65-af27-4a06-a282-0d2a52bfbdfb", intfull: "c19a10d5-1331-44dc-8822-79d29164d80c", intstd: "4c4d46f3-8687-4ddb-b178-af8e74bc3392", extfull: "dfa1c124-f6b1-428d-8421-0b8495ad4559", extstd: "03660aca-650e-4c94-b442-d75f4da954d7" };
    var btn = document.getElementById("book-btn"); if (!btn) return;
    function smUrl(ids) { return ids.length ? "https://gtdetails.setmore.com/book?step=time-slot&products=" + ids.join(",") + "&type=service&staff=39d7ff88-83ea-407f-9eb6-60feb141f1f8&staffSelected=true" : "https://gtdetails.setmore.com"; }
    window.__gtBookHref = function () { var ids = []; quote.forEach(function (x) { var k = SM[x.id]; if (k && ids.indexOf(k) < 0) ids.push(k); }); btn.href = smUrl(ids); };
    window.__gtBookHref();
    btn.addEventListener("click", function (e) {
      var tot = quote.reduce(function (m, q) { var s = S.filter(function (x) { return x.id === q.id; })[0]; return m + (s ? s.mins : 0); }, 0);
      if (tot > 300) { e.preventDefault(); var el0 = document.getElementById("toast"); el0.textContent = t("tooLong").replace("{h}", (Math.round(tot / 6) / 10) + ""); el0.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { el0.hidden = true; }, 8000); return; }
      var ids = [], sum = 0, SZ = ["Small","Midsize","Large"];
      var lines = quote.map(function (x) { var s = S.filter(function (y) { return y.id === x.id; })[0]; if (!s) return ""; var k = SM[x.id]; if (k && ids.indexOf(k) < 0) ids.push(k); sum += s.prices[x.size]; return "- " + s.name.en + " (" + SZ[x.size] + "): " + money(s.prices[x.size]); }).filter(Boolean);
      btn.href = smUrl(ids);
      if (!lines.length) return;
      var txt = "G.T. Details quote: " + lines.map(function (l) { return l.replace(/^- /, ""); }).join("; ") + "; Total: " + money(sum);
      try { navigator.clipboard.writeText(txt); } catch (e) {}
      var el = document.getElementById("toast"); el.textContent = t("pasteQuote"); el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { el.hidden = true; }, 8000);
    });
  })();
  if ("serviceWorker" in navigator) {
    // Check for updates on open and whenever the app comes back to the foreground (throttled); reload once when a new version takes over.
    var hadCtrl = !!navigator.serviceWorker.controller, reloaded = false, swReg = null, lastCheck = 0;
    navigator.serviceWorker.addEventListener("controllerchange", function () { if (hadCtrl && !reloaded) { reloaded = true; location.reload(); } });
    var checkUpdate = function () { var now = Date.now(); if (!swReg || now - lastCheck < 30000) return; lastCheck = now; swReg.update().catch(function () {}); };
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function (reg) { swReg = reg; checkUpdate(); }).catch(function () {});
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") checkUpdate(); });
    window.addEventListener("focus", checkUpdate);
    window.addEventListener("pageshow", function (ev) { if (ev.persisted) checkUpdate(); });
  }
  applyLang();
})();


