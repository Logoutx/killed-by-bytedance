# Killed by ByteDance ⚰️

A graveyard of dead and discontinued ByteDance apps, games, and hardware — and the
Apple App Store / Google Play **publisher shells** ByteDance used to ship them.
Modeled on [killedbygoogle.com](https://killedbygoogle.com).

**110 products tracked · 72 in the graveyard · 51 publisher shells.**

## Run locally

Zero build. Any static server works:

```bash
python3 -m http.server 8755 --directory .
# open http://localhost:8755
```

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell, header, controls |
| `styles.css` | Dark tombstone theme (TikTok cyan/red accents) |
| `app.js` | Renderer: search, type/status filters, sort, **by-publisher-shell view** |
| `data.js` | `window.GRAVEYARD = [...]` — the dataset the page reads |
| `data/records_final.json` | Full verified research records (with sources, kill reasons, confidence, notes) — the source of truth |
| `tools/build_data.py` | Builds `data.js` from records: canonicalizes publisher shells, trims verbose fields |

## Data model

Each product in `data.js`:

```js
{
  name, aliases: [],
  type: "app" | "game" | "service" | "hardware",
  category, region,
  dateLaunched, dateKilled,        // YYYY | YYYY-MM | YYYY-MM-DD
  status: "dead" | "merged" | "rebranded" | "banned" | "acquired-shut" | "alive",
  publisher,                       // canonical App Store/Play shell entity
  developerEntities: [],           // all known shells used over time (full verbose detail)
  appStoreId, description, killedReason, link, sources: []
}
```

## How the dataset was built

1. A multi-agent research workflow (`killed-by-bytedance-research`) fanned out across 8
   discovery angles (global dead apps, China-domestic, acquisitions, regional bans,
   Nuverse games, hardware/education, **App Store publisher shells**, full roster),
   merged 237 raw rows → 111 candidates, then ran **enrich → adversarial verify → polish**
   on each. Verification dropped false positives (e.g. SNK's All-Star Brawl) and
   reclassified transfers vs. true deaths (e.g. Marvel Snap, Mobile Legends).
2. The workflow's verified records are saved to `data/records_final.json`.
3. `tools/build_data.py` turns those into `data.js`.

### Regenerate `data.js`

```bash
python3 tools/build_data.py data/records_final.json --final
```

To add or correct an entry, edit `data/records_final.json` and re-run the command.
The publisher canonicalization rules live in `PUB_RULES` in `tools/build_data.py`.

## Deploy

Static — drop it on any host:

- **GitHub Pages**: push the repo, enable Pages on the root.
- **Cloudflare Pages**: connect the repo, build command empty, output dir `/`.

## Caveats

- Dates and details are best-effort, compiled from public reporting and store records;
  some are estimates (flagged in each record's `notes`/`confidence`).
- Publisher-shell attributions reflect what was findable; entities change over time and
  the full chain is preserved in `developerEntities`.
- Not affiliated with or endorsed by ByteDance.

Inspired by [Killed by Google](https://killedbygoogle.com) by Cody Ogden.
