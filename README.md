# PUREX Storage Tunnels — a walk, circa 1999

A first-person historical simulation of the Hanford PUREX Storage Tunnels (218-E-14 "Tunnel 1" and
218-E-15 "Tunnel 2") as they stood around 1999: loaded to their final 36 railcars, sealed, standing.
No person ever entered the loaded tunnels; both were grout-filled in 2017 and 2019.

Built from the public record. `canon.md` is the factual authority; `decisions.md` lists every
choice the record did not dictate; `issues.md` logs problems hit along the way.

## Run locally
```
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
```

## Layout
- `src/canon.js` — every dimension the world is built from, with its canon citation
- `src/world/` — procedural shells (timber box, Quonset arch), junction spur, doors, track, cars
- `src/data/inventory.js` — the 36 positions, re-read from the permit page images
- `src/data/placards-static.js` + `tools/build-placards.mjs` → `public/placards.json`
- `tools/shots.mjs`, `tools/checks.mjs` — headless screenshot and behavior checks (Playwright + Edge)

## Controls
W A S D / arrows move · mouse look · Shift run · E step through a sealed door (simulation conceit) ·
F inspection view (free camera) · "Jump to…" menu for any position. Touch: left pad to move, drag to look.

Photo credits where imagery is shown: U.S. Department of Energy. This is not site information.
