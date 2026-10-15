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
    if (window.__gtBookHref) window.__gtBookHref();
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-content]").forEach(function (el) { el.setAttribute("content", t(el.dataset.i18nContent)); });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
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

  // Share
  document.getElementById("share-btn").addEventListener("click", function () {
    var url = location.href.split("#")[0];
    if (navigator.share) { navigator.share({ title: "G.T. Details", text: t("shareText"), url: url }).catch(function () {}); return; }
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { toast(t("linkCopied")); }, function () { window.prompt(t("share"), url); });
  });

  // Install
  var deferred = null, installBtn = document.getElementById("install-btn");
  var standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (standalone) installBtn.hidden = true;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; });
  installBtn.addEventListener("click", function () {
    if (deferred) { deferred.prompt(); deferred.userChoice.finally(function () { deferred = null; }); }
    else { document.getElementById("ios-hint").hidden = false; }
  });
  window.addEventListener("appinstalled", function () { installBtn.hidden = true; toast(t("installed")); });
  if (ios && !standalone) document.getElementById("ios-hint").hidden = false;

  // Book Now: deep-link quoted services into Setmore, copy full quote to clipboard, show paste instruction.
  (function () {
    var SM = { stage2: "3994676f-dc37-4eac-9198-86795946228c", stage1: "1b499e65-af27-4a06-a282-0d2a52bfbdfb", intfull: "c19a10d5-1331-44dc-8822-79d29164d80c", intstd: "4c4d46f3-8687-4ddb-b178-af8e74bc3392", extfull: "dfa1c124-f6b1-428d-8421-0b8495ad4559", extstd: "03660aca-650e-4c94-b442-d75f4da954d7" };
    var btn = document.getElementById("book-btn"); if (!btn) return;
    function smUrl(ids) { return ids.length ? "https://gtdetails.setmore.com/book?step=time-slot&products=" + ids.join(",") + "&type=service&staff=39d7ff88-83ea-407f-9eb6-60feb141f1f8&staffSelected=true" : "https://gtdetails.setmore.com"; }
    window.__gtBookHref = function () { var ids = []; quote.forEach(function (x) { var k = SM[x.id]; if (k && ids.indexOf(k) < 0) ids.push(k); }); btn.href = smUrl(ids); };
    window.__gtBookHref();
    btn.addEventListener("click", function () {
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
    // Check for an update once on open; if a new version installs, reload once to apply it.
    var hadCtrl = !!navigator.serviceWorker.controller, reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () { if (hadCtrl && !reloaded) { reloaded = true; location.reload(); } });
    navigator.serviceWorker.register("sw.js").then(function (reg) { reg.update(); }).catch(function () {});
  }
  applyLang();
})();


