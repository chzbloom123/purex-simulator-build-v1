# decisions.md — every choice canon did not dictate

One line each: decision — choice — reason. Grouped by area. "INFERRED" entries are also flagged in code comments (canon.js, cars.js, etc.).

## Contested values (primary-sourced value taken)
- Tunnel 1 height — 6.7 m (22 ft) — PERMIT Part A + §2.1.1 + PNL-10705 + CRESP agree; 6.9 m is a table header, 22.5 ft is lowest-confidence.
- Tunnel 1 width — 5.8 m (19 ft) — PERMIT Part A; the §2.1.1 "5.9 m" is an internal inconsistency in the same permit.
- Tunnel 1 length — 109.1 m inside — PERMIT §2.1.1 engineering narrative; 358 ft agrees.
- Tunnel 2 length — 514.5 m inside — PERMIT §2.1.2; 1,688 ft agrees; 1,500 ft is an outlier.
- Tunnel 2 track grade — 0.1 % — PERMIT §2.1.2 engineering text and Part A drawing label; the 1 % is a table-header line. Over 514 m that is a 0.5 m drop, not 5 m.
- Tunnel 2 arch radius — 17 ft 3 in interior — CRESP-F6 and the CHPRC-03365 springline model agree; "17 ft rolled" is narrative rounding.
- Concrete arch rib thickness — 0.4 m (PERMIT) — exterior, not visible from inside; recorded for completeness.
- Tunnel 2 door dimensions — 7.5 × 6.6 × 2.1 m (PERMIT §2.1.1, stated identical for T2) — feet values are conversions of the same numbers.
- Tunnel 2 first-car date — December 12, 1967 — WAP-TABLE1; the "1964–1996" press framing uses the construction year.

## Geometry inferences
- Tunnel 2 arch center height — 8 ft above top-of-rail — DWG H-2-58194 excerpt shows "8'-0"" from tie level to the arch centerline; consistent with H-2-58533's 14'-0" clearance box giving 22 ft total.
- Tunnel 2 arch below the springline — steel continues ~7° below horizontal to meet the footing at 1.8 m above rail — arithmetic on R = 17'-3" and the 1.8 m slope top.
- Tunnel 2 footing ledge — flat concrete shelf from the slope top (x ≈ 4.07 m) to the arch foot (x ≈ 5.22 m) — CHPRC-03365 "6 ft wide thrust block" sits mostly under the arch; the visible part is this ledge.
- Tunnel 2 ballast shoulder — 4'-6" each side of centerline (9 ft flat) — DWG H-2-58194 "4'6" | 4'6"".
- Tunnel 2 corrugation direction — circumferential (ridges follow the arch, repeat along the tunnel) — reading of the 1964 interior photo and the culvert-like exterior in the 1964 construction photos; 6-inch pitch chosen as standard structural plate.
- Tunnel 2 wale count and angles — five per side at 19°, 31°, 43°, 57°, 72° above the springline — DWG shows wales No. 4 (12WF31) and No. 5 (12WF27) low on the arch; the rest are spread evenly.
- Tunnel 2 hanger detail — two rods per wale at each concrete-rib station through a square plate under the flange — reading of the 1964 interior photo.
- Tunnel 2 roof-port positions — 17 ports centered on the tunnel length at 29.3 m spacing — PERMIT gives count and spacing only.
- Tunnel 2 south end wall — flat concrete filling the arch — material undocumented; concrete matches the door structure.
- Tunnel 1 wall timbers — vertical, 12-inch face exposed, one timber per 12 inches of length — 1956 portal photos show vertical wall timbers.
- Tunnel 1 ceiling timbers — span across, resting on the wall timbers, 12-inch face exposed below — CRESP "arranged side by side"; ceiling thickness 35.6 cm = the 14-inch dimension.
- Tunnel 1 curb — 9-inch curb with ~10 cm showing above ballast — CRESP gives the curb; ballast fill level to it is undocumented.
- Tunnel 1 ties — continuous wall-to-wall (5.5 m) — CRESP "Continuous creosoted wood rail ties between the east and west footings".
- Tunnel 1 riser positions — nine, spread evenly along the roof, staggered off-center — PERMIT gives the count only.
- Tunnel 1 south end wall — vertical timbers like the walls — undocumented; matches the construction.
- Vent shaft placement — 1.5 m square shaft through the roof ~1.2–1.6 m from the south end wall, centered — PERMIT says "south end".
- Both storage tunnels tilted as rigid bodies to their grade, hinged at the door — the structures were built parallel to the track; simplifies collision.
- Whole-structure grade origin — both tunnels start at the same datum (y = 0) at their doors; approach tunnel level — relative elevation of the two doors is unpublished.

## Junction and doors (largely inferred)
- Railroad tunnel / spur interior — 6.6 m wide × 7.3 m high concrete box — no published section; width set to the door width, height clears the 22-ft envelope.
- Spur dogleg — 20° heading east-of-south from a turnout 28 m north of the T1 door, straightening at x = 18.3 m — canon gives only "angles eastward then angles southward" and the 57.9 m / 18.3 m door offsets.
- Railroad-tunnel north limit — a wall 80 m north of the T1 door — simulation boundary; the real tunnel continues to 202-A.
- Door structure length — 4.6 m along the track — door thickness plus guide clearances; drawing not available.
- Door slot — open ceiling slot above the slab rising ~9 m — the door is hoisted into a concrete tower (PERMIT); interior of the tower is unknown.
- Door face detailing — 8-ft plate courses with raised seams and two vertical stiffener lines — 1.3 cm plate construction implies welded courses; pattern is presentation.
- Door rest position — slab bottom at ballast level — the sump beneath is documented but its geometry is not.
- Door state — both doors down, empty of water — T1 drained during 1995–97 transition (PERMIT §2.1.1), T2 never filled (PERMIT §2.1.2/4.1.4).

## Track and cars
- Rail gauge — standard 1,435 mm — canon UNKNOWN register names this as the defensible inference.
- Rail section — 6-inch (ASCE 90-lb class) — period industrial rail.
- Tie spacing — 0.55 m — standard.
- Car deck — 2.9 m wide, 1.1 m above rail, steel plate, no wood decking — PERMIT §4.1.2.3 (decking removed, steel decking); width and height are standard flat-car values.
- Wheels — 33-inch — standard.
- Couplers — north coupler retained, south coupler shown as a short stub — PERMIT: south coupler disabled or removed.
- Gondola cars (T2 pos. 5, 6) — 1.3 m sides — standard low-side gondola.
- Cars follow the track grade — deck tilted with the tunnel.

## Load shapes (Phase 1 primitives; refine in Phase 3)
- Concentrator (T1 3,5,6,7,8; T2 1,2,3,10) — 2.2 m dia × 6.4 m vessel lying on cradles plus a 2.3 m housing box — DOE cutaway shows horizontal cylinders with an attached unit; "vertical tube structure" stored lying down.
- HA column (T1 1–2) — 1.5 m dia × 12.5 m column with flanges in an open steel frame spanning both cars, jumper box on car 1 — PERMIT 12.5 m length; frame and box from the DOE cutaway and Table 1 sketch.
- Dissolver (T2 7, 9, 11) — 2.7 m dia × 7.3 m, inclined 25° on a cradle — PERMIT dimensions; incline chosen as the steepest that clears the 22-ft envelope with the car deck.
- Silver reactor (T2 5, 15) — 1.4 m dia × 4.1 m standing — PERMIT dimensions; companions (demister, catwalk, heater, liner) sized plausibly.
- Tube bundles (T1 4 etc.) — 3 ft dia × 12 ft — GERBER-0437.
- Tank cars (T2 26–28) — 2.8 m dia × 11.8 m tank — 20,000 gal volume on a 12.8 m car.
- Concrete burial boxes (T2 24, 25) — 2.9 × 2.8 × 6.6 m — 1,890 cu ft each.
- White box (T2 12) — 2.8 × 4.4 × 11.6 m, faded white — 5,438 cu ft, name implies paint.
- Unitized concentrators (T2 16, 20) — 2.8 × 4.4 × 11.4 m steel enclosure — 6,000 / 5,760 cu ft.
- All other boxes, liners, racks, towers — generic boxes and cylinders scaled to the tabulated cubic feet — no drawings available.
- Position 7 car — 9 ft shorter than the others — WAP-TABLE1 "NINE FT. SHORTENED CAR 858".

## Presentation conceits (labeled in the experience)
- Visitor lighting — one warm headlamp plus a faint fill — the tunnels had no lighting; a single lamp keeps the darkness honest and reads on phones.
- Door pass-through — press E at a sealed door to appear on the other side — the doors were never reopened; the prompt says so.
- Inspection view — F toggles a free camera — lets viewers see loads from above; labeled as a conceit.
- Walkable width in Tunnel 2 — limited to 5.0 m from the axis — headroom under the arch drops below eye height beyond that.
- Jump menu — teleport to any position — a 514 m tunnel is a six-minute walk; phones need a shortcut.
- Spawn — in the railroad tunnel 14 m north of the turnout, facing south — puts both doors ahead of the visitor.

## De-aging (structure references are 2018; the era is 1999)
- Tunnel 2 steel — bituminous coating intact, dull black, no flaking or heavy corrosion — 2018 stills show 19 more years; 1999 condition is undocumented, so the coating is shown sound.
- Tunnel 1 timber — dark, sound, no visible decay — 1991 LATA evaluation: minimal decay, gamma degradation not visible.
- Stainless equipment — dull grey, light staining, no rust — 304L in a dry tunnel.
- Carbon-steel cars and boxes — weathered paint with light rust — 30–40 years of storage.

## Page-image verification of WAP Table 1 (2026-09-06, PDF pp.149–152 at 3.6× zoom)
Where canon.md's OCR transcription differed from the page, the page was taken. Differences found:
- T1 pos. 1–2 — jumper curies 2,000 and lead ~115 kg confirmed (2,600 / 715 readings rejected).
- T1 pos. 4 — 2,465 cu ft, 3,000 curies, "FUG SER# 762" confirmed. T1 pos. 7 — "@ 150′" confirmed.
- T2 pos. 1 — reads "E-F6 # (2WW WASTE)"; the unit number is blank on the page, not "#4(?)".
- T2 pos. 3 — dose printed as "500 rem/hr. @ 2′" (rem, not mrem); shown as printed with a note.
- T2 pos. 5 — silver "~625 Kg" (not 825 or ~25).
- T2 pos. 6 — "MODIFIED A3-1 TOWER" (not A-S1).
- T2 pos. 7 — "NINE FT. SHORTENED CAR B58" (not 858).
- T2 pos. 9 — placed 9/30/72 on CAR 19811 (canon: illegible).
- T2 pos. 10 — placed 8/30/83 (canon: year illegible).
- T2 pos. 11 — "Cd – ~43 Kg." (not W).
- T2 pos. 13 — "J5 TANK"; dose "3 rem/hr. @ 1′" (not mrem).
- T2 pos. 14 — Pb ~2540 kg, 5 rem/hr @ 15′, 50 tons (canon: Pb illegible).
- T2 pos. 15 — Ag ~115 kg (not 1115), Pb ~230 kg, 20 mrem/hr @ 20′, cradle SK-GLR-11-2-87.
- T2 pos. 16 — "E-J8-1 UNITIZED CONCENTRATOR" (not E-481); "GRAVEYARDS" is the shift name, not an OCR artifact; storage car H2-99608.
- T2 pos. 18 — "T-F5 ACID ABSORBER" (not T-F6).
- T2 pos. 20 — "E-H4-1 UNITIZED CONCENTRATOR" (not E-W1); "@ 5′".
- T2 pos. 21 — placed 2/8/95 on CAR PX-3609; 26,000 curies (not 26,033); full item list transcribed.
- T2 pos. 22 — CAR #3616 (not W16); 22 tons; 15 curies (not 16); Pb ~3,232 kg; "F7 NEUTRON MONITOR"; capping station H-2-821831.
- T2 pos. 23 — CAR #PX-31 (not UPX-31).
- T2 pos. 24 — CAR #PX-29 (not PX-8/PX-B); "B-CELL WASTE"; work plan WP-P-95-60; the "[Ea.?]" element is Ba (barium) ~3 kg.
- T2 pos. 25 — CAR #10A-3619; WP-P-96-015; Ba ~4 g.
- T2 pos. 28 — 23 curies, 650 mrem/hr @ 3′ (canon: 1 curie, 850 mrem/hr).
- Sketches — the HA column is boxed (BOX H2-58373) across two cars; every concentrator and dissolver is drawn as a long tapered vessel inclined on the car, thick end raised; tank cars have rounded heads; positions 24–25 show a three-section box with lifting lugs.

## Placards (Phase 2)
- Placard boards — 0.72 × 0.5 m white board on a 1.15 m post beside the walkway, faint self-glow — presentation device; the tunnels had no signage.
- Car placard placement — at the north end of each car on the west side (x = −2.75 in T1, −3.6 from the axis in T2) — visitors arrive from the north and walk the west side.
- Placard text — Table 1 entries quoted verbatim in the record's capitals, with the sketch described in a sentence — keeps the documented register literal.
- Later history in placards — the 2017 collapse and 2017–19 grouting are stated in past tense as history; the simulation itself stays in 1999.

## Audio (Phase 5, partial)
- Footsteps — synthesized gravel crunch on movement, faint low room tone — presentation; the tunnels were silent and unpowered. No recorded assets.
- Lighting final — headlamp 85 cd with decay 1.6, 0.9 fill, ambient 0.10, ACES exposure 1.0 — compromise between a readable 2 m wale and a visible 20 m arch.
