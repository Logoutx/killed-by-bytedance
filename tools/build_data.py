#!/usr/bin/env python3
"""Build data.js for Killed by ByteDance from research records.

Usage:
  build_data.py                      # harvest from the live workflow journal
  build_data.py records.json         # from a JSON file ([...] or {"records":[...]})
  build_data.py --journal PATH       # explicit journal path

Cleans the verbose `publisher` strings the research agents produced into a small
set of canonical App Store / Play "publisher shell" names so the by-publisher
view is meaningful. The original verbose string is preserved in developerEntities.
"""
import json, re, sys, os, hashlib

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_JOURNAL = os.path.expanduser(
    "~/.claude/projects/-Users-logoutx/c9b76be7-6a65-4b9c-bba0-9f1f9b48ee2e/"
    "subagents/workflows/wf_a787c5fa-df6/journal.jsonl")

# ---- canonical publisher shells: match needle (lowercased) -> canonical label.
# Order matters: brand-specific needles first, generic ByteDance entities last.
PUB_RULES = [
    ("nuverse", "Nuverse (朝夕光年)"),
    ("朝夕光年", "Nuverse (朝夕光年)"),
    ("chaoxi guangnian", "Nuverse (朝夕光年)"),
    ("zhaoxiguangnian", "Nuverse (朝夕光年)"),
    ("ohayoo", "Ohayoo"),
    ("ohayo games", "Ohayoo"),
    ("musical.ly", "Musical.ly Inc."),
    ("moonton", "Moonton"),
    ("pico", "Pico (ByteDance)"),
    ("tiktok pte", "TikTok Pte. Ltd."),
    ("tiktok ltd", "TikTok Pte. Ltd."),
    ('"tiktok"', "TikTok Pte. Ltd."),
    ("lark technologies", "Lark Technologies Pte. Ltd."),
    ("lemon inc", "Lemon Inc."),
    ("moon video", "Moon Video Inc."),
    ("spring (sg)", "Spring (SG) Pte. Ltd."),
    ("spring(sg)", "Spring (SG) Pte. Ltd."),
    ("helo holdings", "Helo Holdings Ltd."),
    ("poligon", "Poligon Pte. Ltd."),
    ("news republic", "News Republic / Mobiles Republic"),
    ("mobiles republic", "News Republic / Mobiles Republic"),
    ("mainspring", "Mainspring (BaBe)"),
    ("gauthtech", "GauthTech Pte. Ltd."),
    ("byteplus", "BytePlus Pte. Ltd."),
    ("pangle", "Pangle (ByteDance)"),
    ("bytemod", "BYTEMOD Pte. Ltd."),
    ("heliophilia", "Heliophilia Pte. Ltd."),
    ("whizsolve", "WhizSolve Pte. Ltd."),
    ("zebra technology", "Zebra Technology (ByteDance)"),
    ("chuangxing", "Guangzhou Chuangxing / Fanchen (Dmonstudio shells)"),
    ("创星", "Guangzhou Chuangxing / Fanchen (Dmonstudio shells)"),
    ("fanchen", "Guangzhou Chuangxing / Fanchen (Dmonstudio shells)"),
    ("凡尘", "Guangzhou Chuangxing / Fanchen (Dmonstudio shells)"),
    ("flipagram", "Flipagram (Cheerful, Inc.)"),
    ("cheerful", "Flipagram (Cheerful, Inc.)"),
    ("smartisan", "Smartisan / New Stone Lab (新石实验室)"),
    ("锤子", "Smartisan / New Stone Lab (新石实验室)"),
    ("new stone lab", "Smartisan / New Stone Lab (新石实验室)"),
    ("faceu", "Faceu / Shenzhen Lianmeng (脸萌)"),
    ("脸萌", "Faceu / Shenzhen Lianmeng (脸萌)"),
    ("lianmeng", "Faceu / Shenzhen Lianmeng (脸萌)"),
    ("microlive vision", "Beijing Microlive Vision Technology"),
    ("微播视界", "Beijing Microlive Vision Technology"),
    ("dali education", "Beijing Dali Education (大力教育)"),
    ("大力教育", "Beijing Dali Education (大力教育)"),
    ("大力智能", "Beijing Dali Education (大力教育)"),
    ("future zhixue", "Beijing Dali Education (大力教育)"),
    ("tianfu tong", "Beijing Dali Education (大力教育)"),
    ("yincaishijiao", "Beijing Dali Education (大力教育)"),
    ("因材施教", "Beijing Dali Education (大力教育)"),
    ("dongchedi", "Beijing Dongchedi (懂车帝)"),
    ("懂车帝", "Beijing Dongchedi (懂车帝)"),
    ("feishu", "Beijing Feishu Technology (Lark CN)"),
    ("飞书", "Beijing Feishu Technology (Lark CN)"),
    ("pipi", "Fujian Pipi Dance (皮皮虾)"),
    ("皮皮", "Fujian Pipi Dance (皮皮虾)"),
    ("hudong baike", "Hudong Baike (互动百科)"),
    ("互动百科", "Hudong Baike (互动百科)"),
    ("shiqu", "Beijing Shiqu (识区)"),
    ("识区", "Beijing Shiqu (识区)"),
    ("banciyuan", "Banciyuan (半次元)"),
    ("半次元", "Banciyuan (半次元)"),
    ("shanxing", "Banciyuan (半次元)"),
    ("xiaohe health", "Hainan Xiaohe Health (小荷健康)"),
    ("小荷", "Hainan Xiaohe Health (小荷健康)"),
    ("zhending", "Beijing Zhending Technology (臻鼎)"),
    ("臻鼎", "Beijing Zhending Technology (臻鼎)"),
    ("bitezhixue", "Beijing Bitezhixue (比特智学)"),
    ("比特", "Beijing Bitezhixue (比特智学)"),
    ("volcano engine", "Volcano Engine (火山引擎)"),
    ("火山引擎", "Volcano Engine (火山引擎)"),
    ("bimo liuxiang", "Beijing Bimo Liuxiang (笔墨留香)"),
    ("笔墨留香", "Beijing Bimo Liuxiang (笔墨留香)"),
    ("chuntian zhiyun", "Beijing Chuntian Zhiyun (春田知韵)"),
    ("春田知韵", "Beijing Chuntian Zhiyun (春田知韵)"),
    ("wuxian weidu", "Beijing Wuxian Weidu (无限维度)"),
    ("无限维度", "Beijing Wuxian Weidu (无限维度)"),
    ("kongjian bianhuan", "Beijing Space Transformation (空间变换)"),
    ("空间变换", "Beijing Space Transformation (空间变换)"),
    ("kuaimajiabian", "Beijing Kuaimajiabian (快码加编)"),
    ("快码加编", "Beijing Kuaimajiabian (快码加编)"),
    ("wanyou", "Beijing Wanyou (Toutiao)"),
    ("万友", "Beijing Wanyou (Toutiao)"),
    ("8th note press", "Lemon Inc. (8th Note Press)"),
    ("seed", "ByteDance Seed (Doubao team)"),
    ("doubao", "ByteDance Seed (Doubao team)"),
    ("豆包", "ByteDance Seed (Doubao team)"),
    ("huaxia insurance", "ByteDance (Huaxia Insurance Brokers)"),
    ("华夏保险", "ByteDance (Huaxia Insurance Brokers)"),
    ("douyin pay", "Douyin Pay (抖音支付)"),
    ("抖音支付", "Douyin Pay (抖音支付)"),
    ("ulpay", "Douyin Pay (抖音支付)"),
    ("douyin information service", "Beijing Douyin Information Service Co., Ltd."),
    ("抖音信息服务", "Beijing Douyin Information Service Co., Ltd."),
    ("douyin technology", "Beijing Douyin Technology Co., Ltd."),
    ("抖音科技", "Beijing Douyin Technology Co., Ltd."),
    ("toutiao", "Beijing ByteDance Technology (Toutiao)"),
    ("今日头条", "Beijing ByteDance Technology (Toutiao)"),
    ("jinri toutiao", "Beijing ByteDance Technology (Toutiao)"),
    ("beijing bytedance technology", "Beijing ByteDance Technology Co., Ltd."),
    ("beijing byte dance", "Beijing ByteDance Technology Co., Ltd."),
    ("北京字节跳动", "Beijing ByteDance Technology Co., Ltd."),
    ("bytedance pte", "Bytedance Pte. Ltd."),
    ("bytedance incorporation", "Bytedance Inc."),
    ("bytedance inc", "Bytedance Inc."),
]

TYPES = {"app", "game", "service", "hardware"}
HAN = re.compile(r"[一-鿿]")


def short_desc(s, limit=300):
    s = re.sub(r"\s+", " ", (s or "").strip())
    if len(s) <= limit:
        return s
    # prefer to end on a sentence boundary within the limit
    window = s[:limit]
    cut = max(window.rfind(". "), window.rfind("! "), window.rfind("? "))
    if cut >= 120:
        return window[:cut + 1]
    # else cut on a word boundary
    sp = window.rfind(" ")
    return window[:sp if sp > 120 else limit].rstrip(",;: ") + "…"


def tag_clean(s, limit=42):
    """Short tag from a possibly-verbose field (region/category)."""
    s = re.sub(r"\s+", " ", (s or "").strip())
    if not s:
        return ""
    # cut at the first explanatory separator
    s = re.split(r"\s*(?:—|–|\[|;|:|\.\s)", s, maxsplit=1)[0].strip()
    s = s.strip(" ([")
    if len(s) <= limit:
        return s
    sp = s.rfind(" ", 0, limit)
    return s[:sp if sp > 0 else limit].rstrip(",;: ")


def norm_type(t):
    t = (t or "").lower().strip()
    if t in TYPES:
        return t
    if "game" in t:
        return "game"
    if "hardware" in t or "device" in t or "vr" in t:
        return "hardware"
    if "service" in t or "platform" in t or "sdk" in t:
        return "service"
    return "app"


def canon_publisher(s):
    if not s:
        return ""
    low = s.lower()
    # lead chunk = primary entity the agent named first
    lead = re.split(r"\s*(?:—|;|\||/| - | App Store| Google Play| Apple App Store|\()",
                    s, maxsplit=1)[0].lower()
    for needle, label in PUB_RULES:
        if needle in lead:
            return label
    for needle, label in PUB_RULES:
        if needle in low:
            return label
    base = re.split(r"\s*[—\-/;:|(]\s*", s)[0].strip(' ."、')
    return base or "ByteDance (undisclosed)"


def load_records(argv):
    path = None
    if "--journal" in argv:
        path = argv[argv.index("--journal") + 1]
        return harvest_journal(path)
    args = [a for a in argv[1:] if not a.startswith("--")]
    if args:
        with open(args[0]) as f:
            data = json.load(f)
        if isinstance(data, dict):
            data = data.get("records") or data.get("apps") or []
        return data
    return harvest_journal(DEFAULT_JOURNAL)


def harvest_journal(path):
    results = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                ev = json.loads(line)
            except Exception:
                continue
            if ev.get("type") == "result" and isinstance(ev.get("result"), dict):
                results.append(ev["result"])
    recs = [r for r in results if r.get("name") and (r.get("status") or r.get("type")) and "apps" not in r]

    def sc(r):
        s = sum(1 for k in ("description", "dateLaunched", "dateKilled", "publisher",
                            "category", "region", "killedReason", "link") if r.get(k))
        s += len(r.get("description") or "") / 200.0
        if r.get("isByteDance") is True:
            s += 2
        if r.get("appStoreId"):
            s += 1
        return s

    best, notbd = {}, set()
    for r in recs:
        key = re.sub(r"\s+", " ", (r.get("name") or "").strip()).lower()
        if r.get("isByteDance") is False:
            notbd.add(key)
        if key not in best or sc(r) > sc(best[key]):
            best[key] = r
    return [r for k, r in best.items() if k not in notbd]


def keydate(r):
    m = re.match(r"(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?", r.get("dateKilled") or "")
    if not m:
        return (0, 0, 0, 0)
    return (1, int(m.group(1)), int(m.group(2) or 0), int(m.group(3) or 0))


def load_i18n():
    """Merge the per-record Chinese translation maps (keyed by original_name)."""
    m = {}
    for fn in ("data/i18n_zh_a.json", "data/i18n_zh_b.json", "data/i18n_zh.json"):
        p = os.path.join(PROJECT, fn)
        if os.path.exists(p):
            try:
                for e in json.load(open(p, encoding="utf-8")):
                    if e.get("original_name"):
                        m[e["original_name"]] = e
            except Exception:
                pass
    return m


def split_name(name):
    """Fallback split of '中文 (English)' (or 'English (中文)') into (zh, en)."""
    name = (name or "").strip()
    mm = re.match(r"^(.*?)\s*\((.+)\)\s*$", name)
    if mm:
        a, b = mm.group(1).strip(), mm.group(2).strip()
        if HAN.search(a) and not HAN.search(b):
            return a, b
        if HAN.search(b) and not HAN.search(a):
            return b, a
    return name, name


def build(records):
    i18n = load_i18n()
    out = []
    for r in records:
        raw_pub = r.get("publisher") or ""
        dev = [d for d in (r.get("developerEntities") or []) if d]
        if raw_pub and raw_pub not in dev:
            dev = [raw_pub] + dev
        tr = i18n.get(r.get("name")) or {}
        zh, en = split_name(r.get("name"))
        out.append({
            "name": r.get("name"),
            "nameEn": tr.get("nameEn") or r.get("nameEn") or en,
            "nameZh": tr.get("nameZh") or r.get("nameZh") or zh,
            "aliases": [a for a in (r.get("aliases") or []) if a][:6],
            "type": norm_type(r.get("type")),
            "category": tag_clean(r.get("category")),
            "categoryZh": tr.get("categoryZh") or r.get("categoryZh") or "",
            "region": tag_clean(r.get("region")),
            "regionZh": tr.get("regionZh") or r.get("regionZh") or "",
            "dateLaunched": r.get("dateLaunched") or "",
            "dateKilled": r.get("dateKilled") or "",
            "status": (r.get("status") or "unknown"),
            "stoppedUpdating": r.get("stoppedUpdating"),
            "successor": r.get("successor") or "",
            "publisher": canon_publisher(raw_pub),
            "developerEntities": dev[:6],
            "appStoreId": r.get("appStoreId") or "",
            "description": short_desc(r.get("description") or r.get("killedReason") or ""),
            "descZh": short_desc(tr.get("descZh") or r.get("descZh") or ""),
            "killedReason": (r.get("killedReason") or "").strip(),
            "reasonZh": (tr.get("reasonZh") or r.get("reasonZh") or "").strip(),
            "link": r.get("link") or (r.get("sources") or [""])[0],
            "sources": [s for s in (r.get("sources") or []) if s][:5],
        })
    out.sort(key=keydate, reverse=True)
    return out


def main():
    records = load_records(sys.argv)
    out = build(records)
    final = "--final" in sys.argv
    note = ("the fully verified + polished research set"
            if final else
            "an interim snapshot from the running research workflow (pre-final-verification)")
    header = ("/* Killed by ByteDance — dataset (%d products).\n"
              "   Source: %s. */\n" % (len(out), note))
    body = header + "window.GRAVEYARD = " + json.dumps(out, ensure_ascii=False, indent=2) + ";\n"
    with open(os.path.join(PROJECT, "data.js"), "w") as f:
        f.write(body)

    # Content-hash cache-bust: rewrite index.html's references to data.js / app.js /
    # styles.css with ?v=<hash> so a returning visitor never mixes a fresh HTML with a
    # stale script/style (which would break the page).
    def vhash(s):
        return hashlib.md5(s.encode("utf-8")).hexdigest()[:8]
    assets = {"data.js": body}
    for fn in ("app.js", "styles.css"):
        p = os.path.join(PROJECT, fn)
        if os.path.exists(p):
            assets[fn] = open(p, encoding="utf-8").read()
    index_path = os.path.join(PROJECT, "index.html")
    try:
        html = open(index_path, encoding="utf-8").read()
        new_html = html
        for fn, content in assets.items():
            attr = "href" if fn.endswith(".css") else "src"
            new_html = re.sub(r'%s="%s(?:\?v=[^"]*)?"' % (attr, re.escape(fn)),
                              '%s="%s?v=%s"' % (attr, fn, vhash(content)), new_html)
        if new_html != html:
            open(index_path, "w", encoding="utf-8").write(new_html)
            print("cache-bust: data.js, app.js, styles.css")
    except FileNotFoundError:
        pass

    # --- SEO: crawlable pre-rendered cards (default graveyard view) + JSON-LD + sitemap ---
    import datetime
    def _esc(s):
        return (str(s) if s is not None else "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
    def seo_tone(r):
        s = (r.get("status") or "").lower()
        if r.get("stoppedUpdating") is False: return "alive"
        if "alive" in s or "divested" in s: return "alive"
        if "acquired" in s and "shut" not in s: return "alive"
        if "merged" in s: return "transformed"
        return "gone"
    TONE_COLOR = {"gone": "var(--red)", "transformed": "var(--blue)", "alive": "var(--green)"}
    def st_label(s):
        s = (s or "").lower()
        for k, v in [("merged", "Merged"), ("rebranded", "Rebranded"), ("banned", "Banned"),
                     ("divested", "Divested"), ("acquired-shut", "Shut down"), ("acquired", "Transferred"),
                     ("alive", "Alive"), ("dead", "Dead"), ("discontinued", "Dead"), ("cancelled", "Cancelled")]:
            if k in s: return v
        return "Unknown"
    TYPE_TAG = {"app": "APP", "game": "GAME", "service": "SVC", "hardware": "HW"}
    cards = []
    for r in out:
        if seo_tone(r) == "alive":           # SSR the default graveyard view (no flash on hydrate)
            continue
        tn = seo_tone(r)
        cards.append(
            '<button class="grave-card" style="--status:%s"><span class="gc-top">'
            '<span class="gc-name">%s</span><span class="gc-meta"><span class="type-tag">%s</span>'
            '<span class="status-chip%s"><span class="mark"></span>%s</span></span></span>'
            '<span class="gc-desc">%s</span></button>' % (
                TONE_COLOR[tn], _esc(r.get("nameEn") or r.get("name")), TYPE_TAG.get(r.get("type"), "APP"),
                (" is-alive" if tn == "alive" else ""), _esc(st_label(r.get("status"))), _esc(r.get("description") or "")))
    ssr = '<div class="grave-grid">' + "".join(cards) + '</div>'
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebSite", "name": "Killed by ByteDance", "url": "https://killedbybytedance.com/",
         "description": "A graveyard of dead and discontinued ByteDance apps, games and hardware, and the App Store publisher shells behind them.",
         "inLanguage": ["en", "zh-CN"]},
        {"@type": "ItemList", "name": "Killed by ByteDance — products tracked", "numberOfItems": len(out),
         "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": (r.get("nameEn") or r.get("name") or "")}
                             for i, r in enumerate(out)]}]}
    ld_str = json.dumps(ld, ensure_ascii=False, separators=(",", ":"))
    try:
        html = open(index_path, encoding="utf-8").read()
        html = re.sub(r'<!--SSR_START-->.*?<!--SSR_END-->',
                      lambda m: '<!--SSR_START-->' + ssr + '<!--SSR_END-->', html, flags=re.S)
        html = re.sub(r'(<script type="application/ld\+json" id="ld">).*?(</script>)',
                      lambda m: m.group(1) + ld_str + m.group(2), html, flags=re.S)
        open(index_path, "w", encoding="utf-8").write(html)
        print("injected SSR (%d cards) + JSON-LD" % len(cards))
    except FileNotFoundError:
        pass
    sm = ('<?xml version="1.0" encoding="UTF-8"?>\n'
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
          '  <url><loc>https://killedbybytedance.com/</loc><lastmod>%s</lastmod>'
          '<changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>\n'
          % datetime.date.today().isoformat())
    open(os.path.join(PROJECT, "sitemap.xml"), "w", encoding="utf-8").write(sm)

    def in_graveyard(r):                   # mirrors tone() in app.js
        s = (r.get("status") or "").lower()
        if r.get("stoppedUpdating") is False:   # renamed-but-live, or banned only in some markets
            return False
        if "alive" in s or "divested" in s:
            return False
        if "acquired" in s and "shut" not in s:
            return False
        return True
    deadish = sum(1 for r in out if in_graveyard(r))
    pubs = sorted({r["publisher"] for r in out if r["publisher"]})
    print("WROTE %d products  (%d in graveyard, %d alive/other)" % (len(out), deadish, len(out) - deadish))
    print("canonical publisher shells: %d" % len(pubs))
    for p in pubs:
        n = sum(1 for r in out if r["publisher"] == p)
        print("  %2d  %s" % (n, p))


if __name__ == "__main__":
    main()
