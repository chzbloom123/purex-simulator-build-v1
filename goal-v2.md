# goal.md — PUREX Tunnel Walkthrough Simulator (v2)

## North Star
A quality first-person 3D walkthrough of the PUREX storage tunnels as they stood **circa 1999** — as historically accurate as the research canon allows — hosted on a public website, so Hanford workers can walk a space no human being has ever walked.

## Why This Matters
That last clause is literal, and it is the heart of the build. From the day the first railcar rolled in, interior radiation exceeded 5 roentgen per hour — the permit states plainly that interior inspection was never feasible. No person stood in these tunnels loaded; no photograph of the loaded interiors exists anywhere. Then both tunnels were filled solid with engineered grout (2017, 2019). The walk was impossible while they stood and is impossible forever now. This simulation, built by a Hanford safety instructor from the public record, is the only way anyone will ever take it. The audience is his coworkers — people who drive past the berms, know the story, and carry the lore. Build them a faithful window.

## Era Lock: Circa 1999
The simulator depicts one moment: roughly 1999, the maximum-contents, still-standing state.
- Tunnel 1: 8 railcars, sealed at capacity since January 22, 1965.
- Tunnel 2: all 28 railcars, last three tank cars placed June 19, 1996; use the canon guidance of December 1967 for the first-car date wherever a placard needs it.
- Both water-fillable doors and the railroad-tunnel door sealed during the 1995–97 deactivation; Tunnel 2's door empty of water (documented, placard-worthy).
- Condition de-aging: the 2018 inspection stills are STRUCTURE reference only — they show 19 more years of corrosion than 1999. De-age surfaces; anchor Tunnel 1 timber condition to the 1991 LATA evaluation in canon (minimal decay, gamma degradation, ~60% strength projected by 2001). Log the de-aging choices in decisions.md.
- Interior is unlit, unpowered, ~15.6 °C, silent, LIFO cars bumper-to-bumper on a downgrade toward the south bumper. Visitor lighting is a presentation conceit, not history — pick one (headlamp, inspection-style rig, neutral ambient), keep it modest, log it.

## Source of Truth
canon.md, with its corpus and IMAGE_LOG.md, is the sole factual authority.
- [CONFIRMED] and [PROBABLE] facts are buildable as stated. [CONTESTED]: take the primary-sourced value; log the choice. [UNKNOWN]: infer period-plausible detail, log every inference.
- The canon's UNKNOWN register is your pre-approved inference list (rail gauge → standard, flagged; car-load appearance → from equipment dimensions, Table 1 line-art, and the DOE cutaway rendition).
- Never present an invented detail as documented history inside the experience.

## Placard System
Placards are data, not baked geometry: a JSON file of entries (id, position, register, title, body, canon citation) rendered by the engine.
- **v1 ships the documented register only.** Every placard traceable to a canon line. White/neutral visual language.
- The schema includes a `register` field from day one ("documented" now; other registers may exist later). Do not populate anything but "documented" in this build.
- Placard-worthy material is everywhere in canon: the impossible-walk framing at the entry, the water-filled door, the 1% grade, the two-car HA column, the 33,740-curie L-1 pulser car, the empty-per-RCRA tank cars, the 1964 construction collapses of Tunnel 2.
- Entry framing statement (required, on load): historical simulation built from public sources circa 1999; inferred details are labeled inferred; this is not site information; the real tunnels are permanently grouted.

## Scope (v1 — ship by Monday)
Both tunnel shells plus the junction stub off the railroad tunnel, fully walkable, all 36 positions occupied. Fidelity is phased, not uniform:
1. Engine + both shells (timber rectangle, Quonset arch — canon dimensions) + movement + entry framing.
2. Placard system + documented placards at the highest-value stops.
3. Hero cars modeled distinct: the HA column spanning positions 1–2 (T1), a dissolver on its inclined cradle, a silver reactor, the three tank cars, the two concrete burial boxes.
4. Remaining positions filled with generic period load variants (boxed jumpers, concentrator cylinders, lined boxes) — each flagged inferred in decisions.md.
5. Polish: audio, texture passes, mobile controls.
A shipped walk with generic mid-tunnel cars beats an unshipped masterpiece. Cut from the bottom of this list, never the top.

## Toolchain
Blender → glTF/GLB; Three.js runtime (pointer-lock + touch); Vite; GitHub → Netlify static hosting. No backend, no accounts, no analytics. Textures CC0 (Poly Haven) or from IMAGE_LOG-cleared imagery.

## Quality Bar
- Nothing contradicts the public record; a knowledgeable Hanford reviewer finds no factual fault.
- Scale reads true underfoot: 19 ft of width, 22 ft overhead, 358 ft of timber; then the long 1,688 ft concrete arch. Timber and Quonset must FEEL different.
- Smooth on ordinary worker hardware and phones. Performance beats polygon count — long interiors want aggressive culling/LOD and baked lighting.
- Quiet weight, not spectacle. The place is a sealed industrial tomb; let it be that.

## Latitude
Consider this document a guideline. Make adjustments as necessary — technique, structure, and sequence are yours — but adhere to the goal: an accurate, hostable, walkable circa-1999 tunnel pair, shipped. Accuracy beats beauty; canon beats convenience; shipped beats complete.

## Constraint Zone (gotchas only)
- No facts from training knowledge in the experience; canon or logged inference only.
- Present tense belongs to the simulation, past tense to the history; never depict the tunnels as currently accessible.
- Fully static and self-contained; respect IMAGE_LOG licensing notes for any displayed imagery.
- Placards: documented register only in v1.

## Deliverables
1. Deployed walkthrough site (Netlify).
2. Blender sources + glTF exports, placards.json.
3. decisions.md — every decision canon didn't dictate: one line each (decision, choice, one-clause reason), including all inferences and de-aging choices.
4. issues.md — passive write-heavy log of problems hit, for later review.
