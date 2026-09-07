# issues.md — problems hit during the build (passive log, newest at the bottom)

- 2026-09-06 · npm blocked esbuild's postinstall script (npm 11 allow-scripts policy); approved with `npm approve-scripts esbuild`.
- 2026-09-06 · No system Python on PATH (Blender bundles its own); no Netlify CLI installed. Deploy will go through GitHub + Netlify UI.
- 2026-09-06 · First render loop crashed: Player constructor was handed the canvas twice instead of (camera, canvas). Fixed.
- 2026-09-06 · Entry overlay did not hide: page CSS `display:grid` on `#entry` beat the `hidden` attribute. Added `[hidden]{display:none!important}`.
- 2026-09-06 · Junction walls built with NaN size: referenced a non-existent `APPROACH.halfWidth`. Fixed to `APPROACH.width / 2`.
- 2026-09-06 · First lighting pass far too bright: headlamp 900 cd blew out concrete and gravel; stainless texture read as pink marble; door read as concrete. Retuned (see decisions.md presentation section).
- 2026-09-06 · Headless screenshots use Edge via Playwright with SwiftShader; WebGL works but is slow — fine for stills, not for FPS measurement.
- 2026-09-06 · OCR-uncertain WAP Table 1 values (T1 positions 1–2, 4, 7; T2 positions 3/4, 5, 9–11, 13, 14, 16, 20–22, 24, 25) still need a page-image recheck against the OSTI permit PDF before placards commit to them.
- 2026-09-06 · canon.md's WAP Table 1 transcription had 20+ OCR errors (car numbers, dose units, kg values, one curie total); all corrected from the page image and listed in decisions.md. canon.md itself was left unmodified — the user's research document; corrections live in inventory.js and decisions.md.
- 2026-09-06 · Physically-correct spotlight falloff (decay 2) could not light both a 2 m wale and a 20 m arch acceptably; using decay 1.6 as a presentation compromise.
