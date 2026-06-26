/* Killed by ByteDance — bilingual renderer (zero-build, vanilla JS) */
(function () {
  "use strict";

  var DATA = (window.GRAVEYARD || []).map(function (r, i) { return Object.assign({ _id: i }, r); });

  /* ───────────── i18n strings ───────────── */
  var L = {
    en: {
      eyebrow: "", title: "Killed by ByteDance", tagline: "A graveyard of dead ByteDance apps, games & hardware.",
      filter: "Filter", type: "Type", status: "Status", sort: "Sort", search: "Search", reset: "Reset",
      searchPh: "Resso · 多闪 · Nuverse · India…",
      typeAll: "All types", typeApp: "Apps", typeGame: "Games", typeService: "Services", typeHardware: "Hardware",
      stGrave: "Graveyard", stAll: "Everything", stTransformed: "Merged / rebranded", stBanned: "Banned", stAlive: "Still alive",
      sortKilledDesc: "Recently killed", sortKilledAsc: "Oldest deaths", sortLifeDesc: "Longest lived", sortLifeAsc: "Shortest lived", sortName: "A → Z",
      headGraveyard: "Graveyard", headShell: "Shell trace", empty: "No records match. Reset the filters.",
      ofTotal: function (n, t) { return n + " of " + t; }, shown: function (n) { return n + " shown"; },
      sDead: "Dead", sMerged: "Merged", sRebranded: "Rebranded", sBanned: "Banned", sDivested: "Divested", sShut: "Shut down", sAlive: "Alive", sTransferred: "Transferred", sUnknown: "Unknown",
      tApp: "App", tGame: "Game", tService: "Svc", tHardware: "HW",
      ltApp: "Application", ltGame: "Game", ltService: "Service", ltHardware: "Hardware",
      killedAgo: function (x) { return "Killed <b>" + x + "</b> ago"; }, ranFor: function (x) { return "Ran for <b>" + x + "</b>"; }, livesOn: "Lives on", lived: function (x) { return "Lived <b>" + x + "</b>"; }, active: "active",
      recEvidence: "Record / Evidence", lType: "Type", lCategory: "Category", lRegion: "Region", lLaunched: "Launched", lKilled: "Killed", lLifespan: "Lifespan", lAppStore: "App Store ID", lRenamed: "Renamed", lStatus: "Status",
      secSummary: "Summary", secWhy: "Why it ended", secShells: "Publisher shells", secSources: "Cited sources",
      livesAs: function (s) { return "Lives on as " + s; }, renamedActive: "Renamed · still active", stillOperating: "Still operating",
      operating: "operating", notDisclosed: "Not disclosed", noSources: "No sources recorded.",
      btnSource: "Open primary source", btnTrace: "Trace this shell",
      yr: "yr", mo: "mo", ltMo: "<1 mo",
      fnAbout: "Killed by ByteDance collects dead and discontinued ByteDance apps, games and hardware. Not affiliated with ByteDance.",
      fnMeta: "Data: public reporting + App Store records",
      fnDownload: "Download records (JSON)"
    },
    zh: {
      eyebrow: "", title: "Killed by ByteDance", tagline: "字节跳动已停运的应用、游戏与硬件墓地。",
      filter: "筛选", type: "类型", status: "状态", sort: "排序", search: "搜索", reset: "重置",
      searchPh: "Resso · 多闪 · 朝夕光年 · 印度…",
      typeAll: "全部类型", typeApp: "应用", typeGame: "游戏", typeService: "服务", typeHardware: "硬件",
      stGrave: "墓地", stAll: "全部", stTransformed: "合并 / 改名", stBanned: "封禁", stAlive: "仍存活",
      sortKilledDesc: "最近停运", sortKilledAsc: "最早停运", sortLifeDesc: "存活最久", sortLifeAsc: "存活最短", sortName: "A → Z",
      headGraveyard: "墓地", headShell: "渠道追踪", empty: "没有匹配的记录，请重置筛选。",
      ofTotal: function (n, t) { return n + " / 共 " + t; }, shown: function (n) { return "显示 " + n; },
      sDead: "已停运", sMerged: "已合并", sRebranded: "已改名", sBanned: "已封禁", sDivested: "已剥离", sShut: "已关停", sAlive: "存活中", sTransferred: "已转手", sUnknown: "未知",
      tApp: "应用", tGame: "游戏", tService: "服务", tHardware: "硬件",
      ltApp: "应用", ltGame: "游戏", ltService: "服务", ltHardware: "硬件",
      killedAgo: function (x) { return x + "前停运"; }, ranFor: function (x) { return "运行了<b>" + x + "</b>"; }, livesOn: "仍在运营", lived: function (x) { return "存活 " + x; }, active: "运营中",
      recEvidence: "记录 / 实证", lType: "类型", lCategory: "分类", lRegion: "地区", lLaunched: "上线", lKilled: "停运", lLifespan: "存活时长", lAppStore: "App Store ID", lRenamed: "改名", lStatus: "状态",
      secSummary: "简介", secWhy: "停运原因", secShells: "发行渠道", secSources: "引用来源",
      livesAs: function (s) { return "延续为 " + s; }, renamedActive: "已改名 · 仍在运营", stillOperating: "仍在运营",
      operating: "运营中", notDisclosed: "未披露", noSources: "暂无来源记录。",
      btnSource: "查看主要来源", btnTrace: "追踪此渠道",
      yr: "年", mo: "个月", ltMo: "<1 个月",
      fnAbout: "Killed by ByteDance 收录已停运或被弃的字节跳动应用、游戏与硬件。与字节跳动无任何关联。",
      fnMeta: "数据来源：公开报道 + App Store 记录",
      fnDownload: "下载数据 (JSON)"
    }
  };
  var state = { type: "all", status: "dead", q: "", sort: "killed-desc", pub: "", lang: "en" };
  function t(k) { return L[state.lang][k]; }

  /* ───────────── field getters ───────────── */
  function recName(r) { return pangu(state.lang === "zh" ? (r.nameZh || r.nameEn || r.name) : (r.nameEn || r.name)); }
  function recDesc(r) { return pangu((state.lang === "zh" ? (r.descZh || r.description) : r.description) || r.killedReason || ""); }
  function recReason(r) { return pangu((state.lang === "zh" ? (r.reasonZh || r.killedReason) : r.killedReason) || ""); }
  function recCat(r) { return pangu((state.lang === "zh" ? (r.categoryZh || r.category) : r.category) || ""); }
  function recRegion(r) { return pangu((state.lang === "zh" ? (r.regionZh || r.region) : r.region) || ""); }

  /* ───────────── helpers ───────────── */
  function parseDate(s) {
    if (!s) return null;
    var m = String(s).trim().match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
    if (!m) return null;
    var dt = new Date(Date.UTC(+m[1], m[2] ? +m[2] - 1 : 0, m[3] ? +m[3] : 1));
    dt._prec = m[3] ? "day" : m[2] ? "month" : "year";
    return dt;
  }
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmtDate(s) {
    var dt = parseDate(s);
    if (!dt) return "—";
    var y = dt.getUTCFullYear(), mo = dt.getUTCMonth(), d = dt.getUTCDate();
    if (state.lang === "zh") {
      if (dt._prec === "year") return pangu(y + "年");
      if (dt._prec === "month") return pangu(y + "年" + (mo + 1) + "月");
      return pangu(y + "年" + (mo + 1) + "月" + d + "日");
    }
    if (dt._prec === "year") return "" + y;
    if (dt._prec === "month") return MONTHS[mo] + " " + y;
    return MONTHS[mo] + " " + d + ", " + y;
  }
  function diffText(a, b) {
    if (!a || !b) return "";
    var months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
    if (months < 1) return t("ltMo");
    if (months < 24) return months + " " + t("mo");
    return Math.round(months / 12) + " " + t("yr");
  }
  function agoText(s) { var dt = parseDate(s); return dt ? diffText(dt, new Date()) : ""; }
  function monthsBetween(a, b) { return (a && b) ? ((b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth())) : -1; }
  var CN = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八"];
  function cnNum(n) { return (n >= 0 && n < CN.length) ? CN[n] : String(n); }
  function durNum(n) { return n === 2 ? "两" : cnNum(n); } // 两年, not 二年, for durations
  // fuzzy lifespan — "三年半 / 一年多 / 快五年 / 不到一年" (zh) · "~3.5 yr / 2+ yr / ~5 yr / under a year" (en)
  function fuzzyDur(months) {
    var zh = state.lang === "zh";
    if (months < 12) return zh ? "不到一年" : "under a year";
    var y = Math.floor(months / 12), r = months % 12;
    if (r <= 1) return zh ? durNum(y) + "年" : y + " yr";
    if (r <= 4) return zh ? durNum(y) + "年多" : y + "+ yr";
    if (r <= 7) return zh ? durNum(y) + "年半" : "~" + y + ".5 yr";
    return zh ? "快" + durNum(y + 1) + "年" : "~" + (y + 1) + " yr";
  }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  // insert a thin space between a Chinese character and an adjacent digit (2018年8月 -> 2018 年 8 月)
  function pangu(s) {
    return String(s == null ? "" : s).replace(/([一-鿿])(\d)/g, "$1 $2").replace(/(\d)([一-鿿])/g, "$1 $2");
  }

  function tone(r) {
    var s = (r.status || "").toLowerCase();
    if (r.stoppedUpdating === false) return "alive";
    if (s.indexOf("alive") > -1) return "alive";
    if (s.indexOf("divested") > -1) return "alive";
    if (s.indexOf("acquired") > -1 && s.indexOf("shut") === -1) return "alive";
    if (s.indexOf("merged") > -1) return "transformed";
    return "gone";
  }
  function isGraveyard(r) { var x = tone(r); return x === "gone" || x === "transformed"; }
  function isRebrand(r) { return /rebranded/i.test(r.status || ""); }
  var TONE_COLOR = { gone: "var(--red)", transformed: "var(--blue)", alive: "var(--green)" };
  function statusLabel(status) {
    var s = (status || "").toLowerCase();
    if (s.indexOf("merged") > -1) return t("sMerged");
    if (s.indexOf("rebranded") > -1) return t("sRebranded");
    if (s.indexOf("banned") > -1) return t("sBanned");
    if (s.indexOf("divested") > -1) return t("sDivested");
    if (s.indexOf("acquired") > -1) return s.indexOf("shut") > -1 ? t("sShut") : t("sTransferred");
    if (s.indexOf("alive") > -1) return t("sAlive");
    if (s.indexOf("dead") > -1) return t("sDead");
    return t("sUnknown");
  }
  function typeTag(ty) { return ({ app: t("tApp"), game: t("tGame"), service: t("tService"), hardware: t("tHardware") })[ty] || t("tApp"); }
  function typeLong(ty) { return ({ app: t("ltApp"), game: t("ltGame"), service: t("ltService"), hardware: t("ltHardware") })[ty] || t("ltApp"); }
  function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return (u || "").slice(0, 40); } }
  function lifespanMs(r) { var o = parseDate(r.dateLaunched), c = parseDate(r.dateKilled) || new Date(); return o ? c.getTime() - o.getTime() : -1; }

  /* ───────────── filtering ───────────── */
  function matches(r) {
    if (state.type !== "all" && (r.type || "app") !== state.type) return false;
    if (state.status === "dead" && !isGraveyard(r)) return false;
    if (state.status === "alive" && isGraveyard(r)) return false;
    if (state.status === "banned" && !/banned/i.test(r.status || "")) return false;
    if (state.status === "transformed" && !/merged|rebranded/i.test(r.status || "")) return false;
    if (state.pub && r.publisher !== state.pub && (r.developerEntities || []).indexOf(state.pub) === -1) return false;
    if (state.q) {
      var hay = [r.nameEn, r.nameZh, r.name, r.description, r.descZh, r.category, r.region, r.publisher,
        (r.aliases || []).join(" "), (r.developerEntities || []).join(" ")].join(" ").toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }
  function sortItems(arr) {
    var s = state.sort;
    return arr.slice().sort(function (a, b) {
      if (s === "name-asc") return recName(a).localeCompare(recName(b));
      if (s === "killed-asc" || s === "killed-desc") {
        var ka = parseDate(a.dateKilled), kb = parseDate(b.dateKilled);
        var va = ka ? ka.getTime() : -Infinity, vb = kb ? kb.getTime() : -Infinity;
        return s === "killed-desc" ? vb - va : va - vb;
      }
      if (s === "lifespan-asc" || s === "lifespan-desc") return s === "lifespan-desc" ? lifespanMs(b) - lifespanMs(a) : lifespanMs(a) - lifespanMs(b);
      return 0;
    });
  }

  /* ───────────── card ───────────── */
  function cardHTML(r) {
    var tn = tone(r), col = TONE_COLOR[tn];
    var born = fmtDate(r.dateLaunched);
    var died = (tn === "alive") ? t("active") : (r.dateKilled ? fmtDate(r.dateKilled) : "—");
    var months = monthsBetween(parseDate(r.dateLaunched), parseDate(r.dateKilled) || new Date());
    var since = (tn === "alive") ? t("livesOn")
      : (parseDate(r.dateLaunched) && months >= 0 ? t("ranFor")(fuzzyDur(months)) : "");
    return '' +
      '<button class="grave-card" data-id="' + r._id + '" style="--status:' + col + '">' +
        '<span class="gc-top">' +
          '<span class="gc-name">' + esc(recName(r)) + '</span>' +
          '<span class="gc-meta">' +
            '<span class="type-tag">' + esc(typeTag(r.type)) + '</span>' +
            '<span class="status-chip ' + (tn === "alive" ? "is-alive" : "") + '"><span class="mark"></span>' + esc(statusLabel(r.status)) + '</span>' +
          '</span>' +
        '</span>' +
        '<span class="gc-desc">' + esc(recDesc(r)) + '</span>' +
        '<span class="lifeline">' +
          '<span class="born">' + esc(born) + '</span>' +
          '<span class="rule ' + (tn !== "alive" ? "dead" : "") + '"></span>' +
          '<span class="died">' + esc(died) + '</span>' +
        '</span>' +
        '<span class="gc-since">' + since + '</span>' +
      '</button>';
  }

  /* ───────────── modal ───────────── */
  function recordHTML(r) {
    var tn = tone(r), col = TONE_COLOR[tn];
    var shells = (r.developerEntities && r.developerEntities.length ? r.developerEntities : (r.publisher ? [r.publisher] : []));
    var srcs = (r.sources && r.sources.length ? r.sources : (r.link ? [r.link] : [])).slice(0, 6);
    var reason = recReason(r).trim();
    if (reason.length > 520) reason = reason.slice(0, 520).replace(/\s+\S*$/, "") + "…";

    var fateLabel = (tn === "alive")
      ? (isRebrand(r) ? t("lRenamed") : (/divested/i.test(r.status || "") ? t("sDivested") : t("lStatus")))
      : t("lKilled");
    var fateVal = (tn === "alive") ? (r.dateKilled ? fmtDate(r.dateKilled) : t("operating")) : (r.dateKilled ? fmtDate(r.dateKilled) : "—");
    var dl = [
      [t("lType"), typeLong(r.type)], [t("lCategory"), recCat(r) || "—"], [t("lRegion"), recRegion(r) || "—"],
      [t("lLaunched"), fmtDate(r.dateLaunched)], [fateLabel, fateVal],
      [t("lLifespan"), diffText(parseDate(r.dateLaunched), parseDate(r.dateKilled) || new Date()) || "—"]
    ];
    if (r.appStoreId) dl.push([t("lAppStore"), String(r.appStoreId).slice(0, 22)]);

    var bannerText = (tn === "alive")
      ? (r.successor ? t("livesAs")(r.successor.split(" (")[0]) : (isRebrand(r) ? t("renamedActive") : t("stillOperating")))
      : (statusLabel(r.status) + (r.dateKilled ? (" · " + fmtDate(r.dateKilled)) : ""));

    var aliases = pangu((r.aliases || []).filter(Boolean).slice(0, 4).join(" · "));

    return '' +
      '<div class="rp-header">' +
        '<span class="rp-kicker"><b>▤</b> ' + esc(t("recEvidence")) + '</span>' +
        '<span style="display:flex;align-items:center;gap:10px">' +
          '<span class="type-tag">' + esc(typeTag(r.type)) + '</span>' +
          '<button class="modal-close" id="modal-close" type="button" aria-label="Close">✕</button>' +
        '</span>' +
      '</div>' +
      '<div class="rp-body">' +
        '<h2 class="rp-name">' + esc(recName(r)) + '</h2>' +
        (aliases ? '<p class="rp-alias">' + esc(aliases) + '</p>' : "") +
        '<div class="rp-banner ' + (tn === "alive" ? "is-alive" : "") + '" style="--status:' + col + '"><span class="mark"></span>' + esc(bannerText) + '</div>' +
        '<dl class="rp-dl">' + dl.map(function (p) { return '<div><dt>' + esc(p[0]) + '</dt><dd>' + esc(p[1]) + '</dd></div>'; }).join("") + '</dl>' +
        '<div class="rp-section-label"><span>' + esc(t("secSummary")) + '</span><b>01</b></div>' +
        '<p class="rp-copy">' + esc(recDesc(r) || "—") + '</p>' +
        (reason && reason !== recDesc(r).trim() ? '<div class="rp-section-label"><span>' + esc(t("secWhy")) + '</span><b>02</b></div><p class="rp-copy">' + esc(reason) + '</p>' : "") +
        '<div class="rp-section-label"><span>' + esc(t("secShells")) + '</span><b>03</b></div>' +
        '<div class="rp-shells">' + (shells.length ? shells.map(function (s) { return '<div class="rp-shell"><span class="dotmark"></span><span>' + esc(s) + '</span></div>'; }).join("") : '<div class="rp-shell"><span class="dotmark"></span><span>' + esc(t("notDisclosed")) + '</span></div>') + '</div>' +
        '<div class="rp-section-label"><span>' + esc(t("secSources")) + '</span><b>04</b></div>' +
        '<div class="evidence">' + (srcs.length ? srcs.map(function (u, i) {
          return '<a class="evidence-row" href="' + esc(u) + '" target="_blank" rel="noopener"><b>' + (i + 1) + '</b><span><strong>' + esc(hostOf(u)) + '</strong><small>' + esc(u.slice(0, 52)) + '</small></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M7 17 17 7M9 7h8v8"/></svg></a>';
        }).join("") : '<p class="rp-empty" style="padding:12px 0">' + esc(t("noSources")) + '</p>') + '</div>' +
        '<div class="rp-actions">' +
          (r.link || srcs[0] ? '<a class="primary-button" href="' + esc(r.link || srcs[0]) + '" target="_blank" rel="noopener">' + esc(t("btnSource")) + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 17 17 7M9 7h8v8"/></svg></a>' : "") +
          (r.publisher ? '<button class="secondary-button" data-pub="' + esc(r.publisher) + '" type="button">' + esc(t("btnTrace")) + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/><path d="M11 7h4v4"/></svg></button>' : "") +
        '</div>' +
      '</div>';
  }

  /* ───────────── render ───────────── */
  function currentList() { return sortItems(DATA.filter(matches)); }
  function render() {
    var listHead = document.getElementById("list-head");
    var list = document.getElementById("list");
    var empty = document.getElementById("empty");
    var items = currentList();

    var pubNote = state.pub ? '<button class="text-button" id="clear-pub" type="button">⌗ ' + esc(state.pub) + ' ✕</button>' : "";
    listHead.innerHTML = '<div class="lh-title"><h2>' + esc(state.pub ? t("headShell") : t("headGraveyard")) + '</h2>' + pubNote + '</div>' +
      '<span class="lh-count">' + (state.pub ? t("shown")(items.length) : t("ofTotal")(items.length, DATA.length)) + '</span>';
    list.innerHTML = '<div class="grave-grid">' + items.map(cardHTML).join("") + '</div>';
    empty.textContent = t("empty");
    empty.hidden = items.length !== 0;
    wireDynamic();
  }
  function wireDynamic() {
    Array.prototype.forEach.call(document.querySelectorAll(".grave-card"), function (c) {
      c.addEventListener("click", function () { openModal(+c.getAttribute("data-id")); });
    });
    var cp = document.getElementById("clear-pub");
    if (cp) cp.addEventListener("click", function () { state.pub = ""; render(); });
  }

  /* ───────────── modal open/close ───────────── */
  function openModal(id) {
    var r = DATA[id]; if (!r) return;
    var root = document.getElementById("modal-root");
    root.innerHTML = '<div class="modal-backdrop"><div class="detail-modal" role="dialog" aria-modal="true" aria-label="' + esc(recName(r)) + '">' + recordHTML(r) + '</div></div>';
    root.hidden = false;
    document.body.style.overflow = "hidden";
    root.querySelector(".modal-backdrop").addEventListener("click", function (e) { if (e.target === this) closeModal(); });
    var cl = document.getElementById("modal-close"); if (cl) { cl.focus(); cl.addEventListener("click", closeModal); }
    var sec = root.querySelector(".secondary-button[data-pub]");
    if (sec) sec.addEventListener("click", function () {
      state.pub = sec.getAttribute("data-pub"); state.status = "all";
      syncControls(); closeModal(); render();
      document.getElementById("list-head").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  function closeModal() {
    var root = document.getElementById("modal-root");
    if (!root || root.hidden) return;
    root.hidden = true; root.innerHTML = ""; document.body.style.overflow = "";
  }

  /* ───────────── selects + lang ───────────── */
  function buildSelects() {
    var counts = { all: DATA.length };
    DATA.forEach(function (d) { var ty = d.type || "app"; counts[ty] = (counts[ty] || 0) + 1; });
    var typeOpts = [["all", t("typeAll")], ["app", t("typeApp")], ["game", t("typeGame")], ["service", t("typeService")], ["hardware", t("typeHardware")]]
      .filter(function (o) { return o[0] === "all" || counts[o[0]]; })
      .map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + " (" + (counts[o[0]] || 0) + ")</option>"; }).join("");
    document.getElementById("f-type").innerHTML = typeOpts;
    document.getElementById("f-status").innerHTML = [["dead", t("stGrave")], ["all", t("stAll")], ["transformed", t("stTransformed")], ["banned", t("stBanned")], ["alive", t("stAlive")]]
      .map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + "</option>"; }).join("");
    document.getElementById("f-sort").innerHTML = [["killed-desc", t("sortKilledDesc")], ["killed-asc", t("sortKilledAsc")], ["lifespan-desc", t("sortLifeDesc")], ["lifespan-asc", t("sortLifeAsc")], ["name-asc", t("sortName")]]
      .map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + "</option>"; }).join("");
    syncControls();
  }
  function syncControls() {
    document.getElementById("f-type").value = state.type;
    document.getElementById("f-status").value = state.status;
    document.getElementById("f-sort").value = state.sort;
    document.getElementById("search").value = state.q;
  }
  function applyLang() {
    document.documentElement.lang = state.lang === "zh" ? "zh-Hans" : "en";
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (el) {
      var k = el.getAttribute("data-i18n"); if (L[state.lang][k]) el.textContent = L[state.lang][k];
    });
    document.getElementById("search").placeholder = t("searchPh");
    document.getElementById("fn-about").textContent = t("fnAbout");
    document.getElementById("fn-meta").textContent = t("fnMeta");
    document.getElementById("fn-download").textContent = t("fnDownload");
    Array.prototype.forEach.call(document.querySelectorAll(".lang-btn"), function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === state.lang);
    });
    try { localStorage.setItem("kbb-lang", state.lang); } catch (e) {}
    buildSelects();
    render();
  }

  /* ───────────── init ───────────── */
  function init() {
    if (!DATA.length) { document.getElementById("list").innerHTML = '<p class="empty">Dataset not loaded.</p>'; return; }
    try { var saved = localStorage.getItem("kbb-lang"); if (saved === "zh" || saved === "en") state.lang = saved; } catch (e) {}

    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
    document.getElementById("f-type").addEventListener("change", function (e) { state.type = e.target.value; render(); });
    document.getElementById("f-status").addEventListener("change", function (e) { state.status = e.target.value; render(); });
    document.getElementById("f-sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
    document.getElementById("search").addEventListener("input", function (e) { state.q = e.target.value.trim().toLowerCase(); if (state.q) state.pub = ""; render(); });
    document.getElementById("clear-filters").addEventListener("click", function () {
      state.type = "all"; state.status = "dead"; state.q = ""; state.sort = "killed-desc"; state.pub = "";
      syncControls(); render();
    });
    Array.prototype.forEach.call(document.querySelectorAll(".lang-btn"), function (b) {
      b.addEventListener("click", function () { state.lang = b.getAttribute("data-lang"); applyLang(); });
    });

    applyLang();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
