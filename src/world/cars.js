// cars.js — the 36 modified railcars and their loads.
// Canon (PERMIT §4.1.2.3): wooden decking removed, south coupler disabled/removed, brakes disabled,
// steel decking, catch pans with absorbent, equipment cradles as needed. Car length 12.8 m.
// Load shapes follow the WAP Table 1 line-art sketches (page images checked 2026-09-06) and the
// equipment dimensions in canon Section 7; every shape is an inference logged in decisions.md.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CAR, TRACK } from '../canon.js';
import { getMaterials } from '../materials.js';
import { boxUVMeters } from '../geometry/uv.js';

const M = () => getMaterials();
const DEG = Math.PI / 180;

// ---- primitive helpers (all return geometry positioned in car-local space: x across, z along (+z south), y up)
function box(w, h, d, x, y, z, ry = 0) {
  const g = boxUVMeters(new THREE.BoxGeometry(w, h, d), w / 2, h / 2, d / 2);
  if (ry) g.rotateY(ry);
  g.translate(x, y, z);
  return g;
}
function cyl(r, h, x, y, z, axis = 'y', seg = 24) {
  const g = new THREE.CylinderGeometry(r, r, h, seg);
  if (axis === 'z') g.rotateX(Math.PI / 2);
  if (axis === 'x') g.rotateZ(Math.PI / 2);
  g.translate(x, y, z);
  return g;
}
function sphere(r, x, y, z, seg = 20) {
  const g = new THREE.SphereGeometry(r, seg, seg / 2 + 2);
  g.translate(x, y, z);
  return g;
}
// horizontal capsule along z: cylinder + hemispherical heads
function capsuleZ(r, len, x, y, z, seg = 32) {
  const body = len - 2 * r;
  return [cyl(r, body, x, y, z, 'z', seg), sphere(r, x, y, z - body / 2, seg), sphere(r, x, y, z + body / 2, seg)];
}
// domed-end cylinder along z (shallow heads)
function vesselZ(r, len, x, y, z, seg = 32) {
  const body = len - 0.5 * r;
  const g = [cyl(r, body, x, y, z, 'z', seg)];
  for (const s of [-1, 1]) {
    const head = new THREE.SphereGeometry(r, seg, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    head.scale(1, 0.25, 1);                 // shallow dish
    head.rotateX(s > 0 ? Math.PI / 2 : -Math.PI / 2);
    head.translate(x, y, z + s * body / 2);
    g.push(head);
  }
  return g;
}
/**
 * Long tapered process vessel lying on the car, thick end raised toward the north (−z), as drawn in Table 1.
 * rBig at the raised end, rSmall at the low end; `tilt` in degrees.
 */
function inclinedVessel(rBig, rSmall, len, tilt, deck, zc = 0) {
  const t = tilt * DEG;
  const yLow = deck + 0.45 + rSmall;                    // low (south) end center height
  const yc = yLow + (len / 2) * Math.sin(t);
  const g = new THREE.CylinderGeometry(rSmall, rBig, len, 32); // +y (top) → south after rotateX
  g.rotateX(Math.PI / 2 + t);
  g.translate(0, yc, zc);
  // head cap on the thick end and a flanged nozzle
  const capLen = 0.6;
  const cap = new THREE.CylinderGeometry(rBig * 1.06, rBig * 1.06, capLen, 32);
  cap.rotateX(Math.PI / 2 + t);
  const ex = -(len / 2 + capLen / 2), ez = ex * Math.cos(t), ey = -ex * Math.sin(t);
  cap.translate(0, yc + ey, zc + ez);
  const dome = new THREE.SphereGeometry(rBig * 1.06, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.scale(1, 0.35, 1); dome.rotateX(-Math.PI / 2 - t);
  const dx = -(len / 2 + capLen), dz2 = dx * Math.cos(t), dy2 = -dx * Math.sin(t);
  dome.translate(0, yc + dy2, zc + dz2);
  const S = [g, cap, dome];
  // supports: box frame under the raised end, saddle under the low end (dark steel)
  const zN = zc - (len / 2 - 1.0) * Math.cos(t), yN = yc + (len / 2 - 1.0) * Math.sin(t) - rBig * 0.85;
  const zS = zc + (len / 2 - 0.8) * Math.cos(t), yS = yc - (len / 2 - 0.8) * Math.sin(t) - rSmall * 0.85;
  const D = [];
  const hN = Math.max(0.3, yN - deck), hS = Math.max(0.2, yS - deck);
  for (const s of [-1, 1]) D.push(box(0.14, hN, 0.14, s * (rBig * 0.8), deck + hN / 2, zN), box(0.14, hN, 0.14, s * (rBig * 0.8), deck + hN / 2, zN + 0.9));
  D.push(box(rBig * 1.9, 0.12, 1.1, 0, deck + hN - 0.06, zN + 0.45));
  D.push(box(0.12, 0.12, 1.1, rBig * 0.8, deck + hN / 2, zN + 0.45, 0), box(0.12, 0.12, 1.1, -rBig * 0.8, deck + hN / 2, zN + 0.45, 0));
  D.push(box(rSmall * 2.4, hS, 0.5, 0, deck + hS / 2, zS));
  return { S, D };
}
// open steel cradle box with X bracing on the sides (the "S/R CRADLE" of position 15)
function cradleBox(w, h, l, x, y, z) {
  const D = [];
  const p = 0.1;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) D.push(box(p, h, p, x + sx * (w / 2 - p / 2), y + h / 2, z + sz * (l / 2 - p / 2)));
  for (const sy of [0, 1]) for (const sx of [-1, 1]) D.push(box(p, p, l, x + sx * (w / 2 - p / 2), y + p / 2 + sy * (h - p), z));
  for (const sy of [0, 1]) for (const sz of [-1, 1]) D.push(box(w, p, p, x, y + p / 2 + sy * (h - p), z + sz * (l / 2 - p / 2)));
  const diag = Math.hypot(h, l);
  for (const sx of [-1, 1]) for (const s of [-1, 1]) {
    const b = new THREE.BoxGeometry(p * 0.8, diag, p * 0.8);
    b.rotateX(s * Math.atan2(l, h));
    b.translate(x + sx * (w / 2 - p / 2), y + h / 2, z);
    D.push(b);
  }
  return D;
}

/** Flat car underframe + steel deck. */
function carBody(len, kind) {
  const steel = [], dark = [], wheels = [];
  const w = CAR.width, dh = CAR.deckHeight, dt = CAR.deckThickness;
  steel.push(box(w, 0.06, len - 0.2, 0, dh - 0.03, 0));
  dark.push(box(w, dt - 0.06, len - 0.2, 0, dh - dt / 2 - 0.03, 0));
  dark.push(box(0.3, 0.45, len - 0.8, 0, dh - dt - 0.2, 0));
  for (const s of [-1, 1]) {
    const zc = s * (len / 2 - 1.9);
    dark.push(box(w * 0.9, 0.25, 0.3, 0, dh - dt - 0.1, zc));
    dark.push(box(2.2, 0.25, 0.35, 0, CAR.wheelDia / 2 + 0.05, zc));
    for (const z2 of [-0.85, 0.85]) {
      dark.push(box(0.16, 0.16, 1.9, 0, CAR.wheelDia / 2, zc + z2, Math.PI / 2));
      for (const side of [-1, 1]) wheels.push(cyl(CAR.wheelDia / 2, 0.12, side * TRACK.gauge / 2, CAR.wheelDia / 2, zc + z2, 'x'));
    }
    for (const side of [-1, 1]) dark.push(box(0.12, 0.5, 2.1, side * (TRACK.gauge / 2 + 0.2), CAR.wheelDia / 2 + 0.1, zc));
  }
  dark.push(box(0.25, 0.25, 0.7, 0, dh - dt - 0.1, -len / 2 - 0.2)); // north coupler retained
  dark.push(box(0.2, 0.2, 0.15, 0, dh - dt - 0.1, len / 2 + 0.05));  // south coupler removed → stub
  if (kind === 'gondola') {
    for (const s of [-1, 1]) steel.push(box(0.06, 1.3, len - 0.2, s * (w / 2 - 0.03), dh + 0.65, 0));
    for (const s of [-1, 1]) steel.push(box(w, 1.3, 0.06, 0, dh + 0.65, s * (len / 2 - 0.13)));
  }
  return { steel, dark, wheels };
}

// ---- Load palette: returns { S (stainless), ST (painted steel), C (concrete), D (dark steel), W (white) }
function buildLoad(type, len, deck) {
  const S = [], ST = [], C = [], D = [], W = [];
  const add = (v) => { S.push(...v.S); D.push(...v.D); };
  switch (type) {
    case 'concentrator': add(inclinedVessel(1.05, 0.62, 8.6, 12, deck, 0.4)); break;
    case 'unitized-concentrator': add(inclinedVessel(1.3, 0.8, 10.2, 11, deck, 0.2)); break;
    case 'dissolver': { // 2.7 m dia × 7.3 m tall 304L vessel, inclined on a cradle (PERMIT App. 3A)
      add(inclinedVessel(1.35, 1.35, 7.3, 22, deck, 0.6));
      break;
    }
    case 'ha-column-south': ST.push(box(2.7, 2.5, 5.4, 0, deck + 1.25, 3.4)); break; // "JMP's" box at the south end of car 1
    case 'ha-column-north': { // BOX H2-58373 holding the ~12.5 m HA column, spanning both cars
      ST.push(box(2.8, 2.5, 13.4, 0, deck + 1.25, 2.0));
      for (const z of [-4.2, -0.5, 3.2, 6.9]) D.push(box(2.9, 0.1, 0.1, 0, deck + 2.52, z)); // lid straps
      for (const z of [-4.2, -0.5, 3.2, 6.9]) for (const s of [-1, 1]) D.push(box(0.1, 2.5, 0.1, s * 1.42, deck + 1.25, z));
      break;
    }
    case 'centrifuge-box': // "JMP's" | "G E2" (taller) | "2 TB's"
      ST.push(box(2.5, 2.2, 3.4, 0, deck + 1.1, -4.2));
      ST.push(box(2.5, 3.1, 2.6, 0, deck + 1.55, -0.6));
      ST.push(box(2.5, 2.0, 3.8, 0, deck + 1.0, 3.4));
      break;
    case 'steel-box': ST.push(box(2.6, 2.4, 9.0, 0, deck + 1.2, 0)); break; // L Cell package, sealed
    case 'liner-box': ST.push(box(2.6, 1.5, 7.0, 0, deck + 0.75, -0.6)); D.push(box(2.0, 0.8, 2.2, 0, deck + 0.4, 4.6)); break;
    case 'silver-reactor': { // gondola: box | standing reactor | low items
      ST.push(box(2.4, 2.0, 3.0, 0, deck + 1.0, -4.3));
      S.push(cyl(0.7, 4.1, 0, deck + 2.05, -0.8, 'y', 32), cyl(0.74, 0.12, 0, deck + 4.12, -0.8, 'y', 32), cyl(0.74, 0.12, 0, deck + 0.06, -0.8, 'y', 32));
      S.push(cyl(0.45, 1.8, -0.6, deck + 0.9, 2.2, 'y', 24));                  // F6 demister
      D.push(box(1.0, 0.08, 3.6, 0.7, deck + 0.9, 3.8));                      // catwalk section
      for (let i = 0; i < 4; i++) D.push(box(0.04, 1.0, 0.04, 1.18, deck + 1.4, 2.2 + i * 1.1));
      D.push(box(0.04, 0.04, 3.6, 1.18, deck + 1.9, 3.8));
      S.push(cyl(0.15, 5.0, -0.9, deck + 0.35, 3.0, 'z'));                    // vent line
      break;
    }
    case 'tower': // A3-1 tower lying, scrubber box, lid, vapor line — gondola
      ST.push(box(2.2, 1.6, 3.4, 0, deck + 0.8, -4.0));
      S.push(...vesselZ(0.8, 5.4, 0, deck + 0.8, 0.9));
      ST.push(box(1.6, 1.9, 1.6, 0, deck + 0.95, 5.0));
      S.push(cyl(1.0, 0.15, -0.6, deck + 0.08, 4.0, 'y', 32));
      break;
    case 'white-box': // small box | WHITE BOX H2-58456 | small box
      ST.push(box(1.4, 1.2, 1.4, 0, deck + 0.6, -5.4));
      W.push(box(2.8, 3.4, 8.4, 0, deck + 1.7, -0.2));
      ST.push(box(1.6, 1.0, 1.6, 0, deck + 0.5, 5.2));
      break;
    case 'tank-misc': // box | J5 tank lying | small items
      ST.push(box(2.4, 2.4, 3.6, 0, deck + 1.2, -4.2));
      S.push(...vesselZ(0.9, 4.0, 0, deck + 0.9, 0.4));
      D.push(box(1.6, 1.0, 1.2, 0, deck + 0.5, 3.6), box(1.2, 0.5, 1.0, 0.4, deck + 0.25, 5.2));
      break;
    case 'pulser-rack': { // box at the north end, long RACK H2-96629 of upright items
      ST.push(box(2.5, 2.2, 2.6, 0, deck + 1.1, -4.9));
      const z0 = -2.9, l = 8.6;
      for (const sx of [-1, 1]) for (const sz of [0, 1]) D.push(box(0.12, 2.6, 0.12, sx * 1.25, deck + 1.3, z0 + sz * l));
      for (const sx of [-1, 1]) for (const y of [0.3, 2.6]) D.push(box(0.1, 0.1, l, sx * 1.25, deck + y, z0 + l / 2));
      for (let i = 0; i < 15; i++) {
        const z = z0 + 0.4 + i * (l - 0.8) / 14;
        S.push(cyl(0.17, 2.2 + ((i * 7) % 3) * 0.15, (i % 2 ? 0.55 : -0.55), deck + 1.2, z, 'y', 12));
      }
      S.push(cyl(0.42, 8.0, 0, deck + 2.3, z0 + l / 2, 'z', 20)); // L-1 pulser / column cartridges laid along the rack
      break;
    }
    case 'silver-reactor-liner': { // two cross-braced cradle boxes (reactor and steam heater lying) + liner
      D.push(...cradleBox(2.5, 2.3, 4.6, 0, deck, -3.9));
      S.push(...vesselZ(0.7, 4.1, 0, deck + 1.15, -3.9));
      D.push(...cradleBox(2.5, 2.3, 3.2, 0, deck, 0.2));
      S.push(...vesselZ(0.6, 2.9, 0, deck + 1.05, 0.2));
      ST.push(box(2.6, 1.6, 4.0, 0, deck + 0.8, 4.2));                        // storage liner full of cut-up jumpers
      break;
    }
    case 'two-liners': ST.push(box(2.6, 2.1, 5.4, 0, deck + 1.05, -3.2), box(2.6, 2.1, 5.4, 0, deck + 1.05, 3.2)); break;
    case 'four-liners': ST.push(box(2.6, 2.3, 5.6, 0, deck + 1.15, -3.3), box(2.6, 2.3, 5.6, 0, deck + 1.15, 3.3)); break; // drawn as two boxes
    case 'absorber': ST.push(box(2.4, 2.0, 4.6, 0, deck + 1.0, -3.0), box(2.4, 2.0, 4.6, 0, deck + 1.0, 2.4)); break;   // drawn as two boxes
    case 'tank-lead-tower': { // many items of varied height along the car
      ST.push(box(1.6, 1.0, 1.6, -0.5, deck + 0.5, -5.2));
      D.push(box(1.2, 1.4, 1.0, 0.6, deck + 0.7, -3.6));                        // lead storage box
      S.push(...vesselZ(0.8, 3.2, 0, deck + 0.8, -1.4));                        // tank E-5
      S.push(cyl(0.45, 3.4, -0.7, deck + 1.7, 1.2, 'y', 20));                   // H4 concentrator tower upright
      D.push(box(2.2, 0.15, 2.2, 0.6, deck + 0.08, 2.0));                       // hot shop cover plate
      S.push(cyl(0.3, 2.2, 0.8, deck + 1.1, 3.6, 'y', 16));                     // wash capsule
      D.push(box(0.6, 2.4, 0.6, -0.6, deck + 1.2, 4.6), box(1.2, 0.5, 0.6, 0.4, deck + 0.25, 5.4)); // yokes
      break;
    }
    case 'liner-box-misc': { // hopper | boxes | taller box
      D.push(cyl(0.7, 1.4, 0, deck + 0.7, -5.2, 'y', 16), cyl(0.3, 0.6, 0, deck + 1.7, -5.2, 'y', 16)); // scrap hopper
      ST.push(box(2.4, 1.6, 3.6, 0, deck + 0.8, -2.3));                         // liner box
      D.push(box(1.4, 1.2, 1.4, 0, deck + 0.6, 0.6));                           // lead storage box
      ST.push(box(2.2, 2.6, 3.0, 0, deck + 1.3, 3.4));                          // capping station
      S.push(cyl(0.2, 2.2, 0.9, deck + 1.1, 5.6, 'y', 12));                     // test canister
      break;
    }
    case 'two-burial-boxes': // tall yoke upright + long box
      D.push(box(0.5, 3.2, 0.5, 0, deck + 1.6, -5.4), box(2.2, 0.4, 0.5, 0, deck + 3.2, -5.4));
      ST.push(box(2.6, 2.2, 8.6, 0, deck + 1.1, 0.6));
      break;
    case 'concrete-burial-box': { // H-1-44980: three-section box with lifting lugs, sloped brace at the north end
      C.push(box(2.9, 2.6, 7.6, 0, deck + 1.3, 0.4));
      for (const z of [-2.1, 2.9]) D.push(box(2.94, 2.64, 0.06, 0, deck + 1.3, z));   // section joints
      for (const z of [-1.4, 2.2]) D.push(box(0.3, 0.3, 0.5, 0, deck + 2.75, z));      // lifting lugs
      const brace = new THREE.BoxGeometry(0.15, 3.2, 0.15); brace.rotateX(0.75); brace.translate(0, deck + 1.1, -4.4); D.push(brace);
      break;
    }
    case 'tank-car': break;
    default: ST.push(box(2.4, 2.0, 5.0, 0, deck + 1.0, 0));
  }
  return { S, ST, C, D, W };
}

function tankCarBody(len) {
  const S = [], D = [];
  const r = 1.42, l = 12.4; // 20,000 gal ≈ 75.7 m³; rounded heads as drawn in Table 1
  const yc = CAR.deckHeight - 0.25 + r;
  S.push(...capsuleZ(r, l, 0, yc, 0, 40));
  S.push(cyl(0.5, 0.5, 0, yc + r + 0.1, 0, 'y', 24));           // manway dome
  for (const s of [-1, 1]) D.push(box(1.8, 0.55, 0.4, 0, CAR.deckHeight + 0.05, s * 3.7)); // saddles
  D.push(box(0.5, 0.04, 6.0, 0, yc + r + 0.02, 0));              // top walkway
  for (const s of [-1, 1]) D.push(box(0.04, 0.9, 6.0, s * 0.25, yc + r + 0.45, 0)); // handrails (thin)
  return { S, D };
}

export function buildCars(cars) {
  const M0 = M();
  const root = new THREE.Group();
  const whiteMat = M0.carSteel.clone(); whiteMat.color.set(0xcfcac0);
  for (const c of cars) {
    const g = new THREE.Group();
    const kind = c.car === 'gondola' ? 'gondola' : 'flat';
    const body = carBody(c.length, kind);
    let load;
    if (c.load === 'tank-car') {
      const t = tankCarBody(c.length);
      load = { S: t.S, ST: [], C: [], D: t.D, W: [] };
      body.steel = []; // tank car: no flat deck plate
    } else {
      load = buildLoad(c.load, c.length, CAR.deckHeight);
    }
    const parts = [
      [body.steel.concat(load.ST), M0.carSteel],
      [body.dark.concat(load.D), M0.blackSteel],
      [body.wheels, M0.wheel],
      [load.S, M0.stainless],
      [load.C, M0.concreteBox],
      [load.W, whiteMat],
    ];
    for (const [geos, mat] of parts) {
      if (!geos.length) continue;
      const clean = geos.map((x) => { const y = x.index ? x.toNonIndexed() : x; y.deleteAttribute('uv2'); return y; });
      const merged = mergeGeometries(clean, false);
      if (!merged) { console.warn('merge failed for car', c.tunnel, c.pos); continue; }
      const mesh = new THREE.Mesh(merged, mat);
      g.add(mesh);
    }
    g.position.set(c.axisX, 0, c.zCenter);
    const grade = c.tunnel === 1 ? 0.01 : 0.001;
    g.position.y = -grade * (c.tunnel === 1 ? c.zCenter : c.zCenter - 57.9);
    g.rotation.x = Math.atan(grade);
    g.userData.car = c;
    root.add(g);
  }
  return root;
}
