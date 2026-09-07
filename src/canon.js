// canon.js — every dimension the world is built from, in meters, with its canon.md line.
// World frame: +X = east, +Y = up, +Z = south. Origin = center of Tunnel 1's water-fillable
// door at top-of-tie (ballast) level. The visitor enters from the north and walks south.
//
// Anything marked INFERRED is not in canon; each one is also logged in decisions.md.

export const FT = 0.3048;
export const IN = 0.0254;

// ---------------------------------------------------------------- Tunnel 1 (218-E-14)
export const T1 = {
  width: 5.8,          // [CONFIRMED] PERMIT Part A "5.8 m (19 ft) wide"  (CONTESTED 5.9 m in §2.1.1; primary Part A value taken)
  height: 6.7,         // [CONFIRMED] PERMIT Part A "6.7 m (22 ft) high"  (CONTESTED 6.9 m / 22.5 ft; primary Part A value taken)
  length: 109.1,       // [CONFIRMED] PERMIT §2.1.1 "109.1 meters long" inside
  timberFace: 12 * IN, // [CONFIRMED] 12-inch side exposed — CRESP-F6
  timberDepth: 14 * IN,// [CONFIRMED] walls and ceiling 35.6 cm thick — PERMIT §2.1.1
  curbHeight: 9 * IN,  // [CONFIRMED] 9-inch curb on interior face of footing — CRESP-F6
  curbVisible: 0.10,   // INFERRED: ballast filled to near curb top; ~10 cm of curb shows
  concreteEastWallLength: 30.5, // [CONFIRMED] first 30.5 m of east wall = 0.9 m reinforced concrete — PERMIT §2.1.1
  grade: 0.01,         // [CONFIRMED] 1.0 percent down to the south — PERMIT §2.1.1
  bumperFromSouthEnd: 2.4, // [CONFIRMED] PERMIT §2.1.1
  carCount: 8,         // [CONFIRMED]
  riserCount: 9,       // [CONFIRMED] nine pipe risers through the roof, 1962–1980 — PERMIT §2.1.1 (positions INFERRED)
  ventShaft: 1.5,      // [CONFIRMED] 1.5 m × 1.5 m reinforced concrete shaft at the south end — PERMIT §2.1.1
};

// ---------------------------------------------------------------- Tunnel 2 (218-E-15)
export const T2 = {
  length: 514.5,       // [CONFIRMED] PERMIT §2.1.2 nominal inside
  nominalWidth: 10.4,  // [CONFIRMED] PERMIT §2.1.2
  nominalHeight: 7.9,  // [CONFIRMED] PERMIT §2.1.2
  // Cross-section from DWG H-2-58533 / H-2-58194 excerpts (canon Section 2 + image log):
  archRadius: 17.25 * FT,     // [CONTESTED] 17'-3" (CRESP-F6; CHPRC-03365 model springline X=17.25 ft) vs "17 ft rolled" — 17'-3" taken
  archCenterAboveRail: 8 * FT,// DWG H-2-58194 "8'-0"" from tie level to arch centerline; consistent with 22 ft clearance = 14'-0" + 8'-0" on H-2-58533
  clearanceHalfWidth: 9.5 * FT, // DWG H-2-58533 "9'-6" (MIN.)" clearance limit
  clearanceHeight: 22 * FT,     // [CONFIRMED] usable envelope 6.7 m high × 5.8 m wide above top-of-rail — PERMIT §2.1.2
  tieLength: 2.4,       // [CONFIRMED] "2.4-meter-long ties" — PERMIT §2.1.2
  ballastShoulderHalf: 4.5 * FT, // DWG H-2-58194 "4'6" | 4'6"" between slope toes
  sideSlope: 1 / 1.5,   // [CONFIRMED] 1 vertical : 1½ horizontal — PERMIT §2.1.2
  sideSlopeTop: 1.8,    // [CONFIRMED] floor rises to ~1.8 m above the railroad bed — PERMIT §2.1.2
  footingWidth: 6 * FT, // [CONFIRMED] 6 ft wide continuous thrust block — CHPRC-03365 p.2
  steelRibSpacing: 37.6875 * IN, // [CONFIRMED] 37 11/16" o.c. — CHPRC-03365 p.10
  concreteRibSpacing: 15.73 * FT, // [CONFIRMED] 15'-8¾" o.c. — CHPRC-03365 p.10
  steelRibDepth: 6 * IN,   // DWG: "EXISTING STEEL RIB 6I12.5" (6-inch I-beam)
  steelRibFlange: 3.33 * IN, // 6I12.5 flange width 3.33 in (standard section)
  panelWidth: 16 * IN,     // [CONFIRMED] 16-inch-wide stamped corrugated 3/16" panels — CHPRC-03365 p.2
  panelThickness: 0.5 / 100, // [CONFIRMED] 0.5 cm plate — PERMIT §2.1.2
  wales: [ // longitudinal W12 wale beams, each side; angles from horizontal at the arch center. DWG shows wales No.4 (12WF31) and No.5 (12WF27) low on the arch.
    // INFERRED: five wales per side, evenly spread from ~12° to ~72° above the springline (drawing shows No.4/No.5 near 20–40°)
    { n: 1, angleDeg: 72, section: '12WF27' },
    { n: 2, angleDeg: 57, section: '12WF27' },
    { n: 3, angleDeg: 43, section: '12WF31' },
    { n: 4, angleDeg: 31, section: '12WF31' },
    { n: 5, angleDeg: 19, section: '12WF27' },
  ],
  waleDepth: 12 * IN, waleFlange: 6.5 * IN,
  grade: 0.001,         // [CONTESTED] 0.1% (PERMIT §2.1.2 text + Part A drawing "Grade 0.1%") vs 1% (WAP table header) — engineering text taken
  bumperFromSouthEnd: 2.4, // [CONFIRMED] PERMIT §2.1.2
  carCount: 28,         // [CONFIRMED]
  roofPortCount: 17,    // [CONFIRMED] 17 ports on 29.3 m centers along the ridge — PERMIT §2.1.2
  roofPortSpacing: 29.3,
  roofPortPlugDia: 7.6 / 100, // [CONFIRMED] 7.6 cm bar plug, chain and padlock
  ventShaft: 1.5,
};

// ---------------------------------------------------------------- Siting
export const SITE = {
  t2DoorSouthOffset: 57.9, // [CONFIRMED] T2 door is 57.9 m south of T1 door — PERMIT §2.1.2
  t2DoorEastOffset: 18.3,  // [CONFIRMED] and 18.3 m east; center-to-center 18.3 m — PERMIT §2.1.2
  t2DoglegHeadingDeg: 20,  // INFERRED: "angles eastward then angles southward" — no angle published
  t2BranchZ: -28,          // INFERRED: turnout point north of the T1 door, sized so the dogleg lands at x=18.3 north of the T2 door
  railroadTunnelNorthLimit: -80, // INFERRED: simulation boundary; the railroad tunnel continues north to 202-A
};

// ---------------------------------------------------------------- Doors & approach
export const DOOR = {
  height: 7.5, width: 6.6, thickness: 2.1, // [CONFIRMED] PERMIT §2.1.1 (T2 door "essentially identical")
  plate: 1.3 / 100,                         // [CONFIRMED] 1.3 cm steel plate
  houseLength: 4.6,   // INFERRED: concrete door structure depth along the track (door thickness + slot clearances)
  houseWidth: 6.6 + 2 * 0.9,  // INFERRED: door width plus 0.9 m concrete walls each side
};
export const APPROACH = {
  width: 6.6,   // INFERRED: railroad tunnel / spur interior width set equal to door width (no published value)
  height: 7.3,  // INFERRED: interior height, clearing the 6.7 m storage envelope with margin
  wallThickness: 0.9,
};

// ---------------------------------------------------------------- Track & cars
export const TRACK = {
  gauge: 1.435,     // [UNKNOWN] → INFERRED standard gauge, per canon Section 12 guidance
  railHeight: 0.152, // INFERRED: 6-inch rail section (ASCE 90-lb class)
  railHead: 0.066,
  railBase: 0.14,
  tieLength: 2.4,   // [CONFIRMED] T2; T1 ties described as continuous between footings (see tunnel1.js)
  tieWidth: 0.23, tieHeight: 0.18, tieSpacing: 0.55, // INFERRED standard dimensions
};
export const CAR = {
  length: 12.8,     // [CONFIRMED] 12.8-meter-long railcars — PERMIT §2.1.1/§2.1.2
  shortLength: 12.8 - 9 * FT, // [CONFIRMED] T2 pos. 7 "NINE FT. SHORTENED CAR 858"
  width: 2.9,       // INFERRED: ~9'6" standard flat car deck width
  deckHeight: 1.1,  // INFERRED: deck ~43 in above top-of-rail
  deckThickness: 0.3,
  wheelDia: 0.84,   // INFERRED: 33-inch wheels
};

// ---------------------------------------------------------------- Presentation (not history)
export const PRESENT = {
  eyeHeight: 1.7,
  walkSpeed: 1.5,
  sprintSpeed: 4.0,
  playerRadius: 0.35,
};
