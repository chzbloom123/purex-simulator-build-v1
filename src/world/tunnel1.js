// tunnel1.js — Tunnel 1 (218-E-14): the 1956 creosoted-timber box, 19 ft × 22 ft × 358 ft.
// Built in a local frame with a flat floor, then tilted to the 1% grade about the door.
import * as THREE from 'three';
import { T1, DOOR } from '../canon.js';
import { L } from './layout.js';
import { getMaterials } from '../materials.js';
import { buildTrack, buildBumper } from './track.js';
import { buildDoorHouse, setUV } from './doors.js';

export function buildTunnel1() {
  const M = getMaterials();
  const root = new THREE.Group();

  // Door structure sits level at the north end (not tilted).
  root.add(buildDoorHouse(L.t1.axisX, L.t1.doorInnerZ, { w: T1.width, h: T1.height }));

  const g = new THREE.Group(); // tilted storage area
  const len = T1.length, hw = T1.width / 2, H = T1.height;
  const tf = T1.timberFace, td = T1.timberDepth;

  // ---- Wall timbers (vertical, 12" face exposed, 14" deep), both sides.
  const perSide = Math.ceil(len / tf);
  const wallGeo = new THREE.BoxGeometry(td, H, tf);
  setUV(wallGeo, 1, 1);
  // stretch grain along the timber: the box's side faces use uv.y along height → scale v by H
  scaleBoxUV(wallGeo, [td, H, tf]);
  const westCount = perSide;
  const eastStart = Math.ceil(T1.concreteEastWallLength / tf);
  const eastCount = perSide - eastStart;
  const walls = new THREE.InstancedMesh(wallGeo, M.timber, westCount + eastCount);
  const m = new THREE.Matrix4(), col = new THREE.Color();
  let k = 0;
  for (let i = 0; i < perSide; i++) {
    const z = i * tf + tf / 2;
    // west wall
    m.makeTranslation(-hw - td / 2 + jitter(i + 31, 0.006), H / 2, z);
    walls.setMatrixAt(k, m); walls.setColorAt(k, col.setHSL(0.06, 0.16, 0.20 + jitter(i, 0.045))); k++;
    if (i >= eastStart) {
      m.makeTranslation(hw + td / 2 + jitter(i + 77, 0.006), H / 2, z);
      walls.setMatrixAt(k, m); walls.setColorAt(k, col.setHSL(0.06, 0.16, 0.20 + jitter(i + 999, 0.045))); k++;
    }
  }
  walls.instanceMatrix.needsUpdate = true;
  g.add(walls);

  // ---- Ceiling timbers (span across, resting on the walls; 12" face exposed below, 14" deep)
  const span = T1.width + 2 * td;
  const ceilGeo = new THREE.BoxGeometry(span, td, tf);
  scaleBoxUV(ceilGeo, [span, td, tf], true);
  const ceil = new THREE.InstancedMesh(ceilGeo, M.timber, perSide);
  for (let i = 0; i < perSide; i++) {
    const z = i * tf + tf / 2;
    m.makeTranslation(0, H + td / 2 + jitter(i + 91, 0.006), z);
    ceil.setMatrixAt(i, m); ceil.setColorAt(i, col.setHSL(0.06, 0.16, 0.19 + jitter(i + 5000, 0.045)));
  }
  ceil.instanceMatrix.needsUpdate = true;
  g.add(ceil);

  // ---- Reinforced-concrete east wall for the first 30.5 m (adjacent to the T2 spur)
  const cl = T1.concreteEastWallLength;
  const cGeo = new THREE.PlaneGeometry(cl, H);
  setUV(cGeo, cl, H);
  const cw = new THREE.Mesh(cGeo, M.concrete);
  cw.position.set(hw, H / 2, cl / 2);
  cw.rotation.y = -Math.PI / 2;
  g.add(cw);

  // ---- Footing curbs (9-inch curb; ~10 cm shows above ballast — INFERRED)
  for (const s of [-1, 1]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.15, T1.curbVisible + 0.05, len), M.concrete);
    curb.position.set(s * (hw - 0.075), T1.curbVisible / 2 - 0.025, len / 2);
    g.add(curb);
  }

  // ---- Floor: gravel ballast wall-to-wall ("the floor in Tunnel Number 1 remains flat all the way out to the side walls")
  const fGeo = new THREE.PlaneGeometry(T1.width, len);
  setUV(fGeo, T1.width / 1.5, len / 1.5);
  const floor = new THREE.Mesh(fGeo, M.gravel);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, len / 2);
  g.add(floor);

  // ---- Track: continuous creosoted ties between the footings carry the rails (CRESP-F6)
  g.add(buildTrack([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, len)], { tieLength: T1.width - 0.3 }));
  g.add(buildBumper(0, 0, L.t1.bumperZ));

  // ---- South end wall (timber) and the 1.5 m × 1.5 m vent shaft rising through the roof near it
  const endGeo = new THREE.BoxGeometry(td, H, tf);
  scaleBoxUV(endGeo, [td, H, tf]);
  const endCount = Math.ceil(T1.width / tf);
  const endWall = new THREE.InstancedMesh(endGeo, M.timber, endCount);
  for (let i = 0; i < endCount; i++) {
    m.makeRotationY(Math.PI / 2);
    m.setPosition(-hw + i * tf + tf / 2, H / 2, len + td / 2);
    endWall.setMatrixAt(i, m); endWall.setColorAt(i, col.setHSL(0.06, 0.16, 0.20 + jitter(i + 7000, 0.045)));
  }
  g.add(endWall);
  g.add(buildVentShaft(M, 0, H, len - 1.2, T1.ventShaft));

  // ---- Nine capped pipe risers through the roof (PERMIT §2.1.1). Positions INFERRED, evenly spread.
  const riserGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 12);
  const risers = new THREE.InstancedMesh(riserGeo, M.blackSteel, T1.riserCount);
  for (let i = 0; i < T1.riserCount; i++) {
    const z = 8 + (len - 16) * (i / (T1.riserCount - 1));
    const x = (i % 3 - 1) * 0.9;
    m.makeTranslation(x, H - 0.1, z);
    risers.setMatrixAt(i, m);
  }
  g.add(risers);

  // Tilt the storage area to the 1% downgrade toward the south, hinged at the door.
  g.rotation.x = Math.atan(T1.grade);
  root.add(g);
  return root;
}

export function buildVentShaft(M, x, ceilingY, z, size) {
  const g = new THREE.Group();
  const h = 4; // shaft rises through the roof and 2.4 m of fill; top is capped (blanked) — we only see the dark shaft
  for (const [dx, dz, w, d] of [[size / 2 + 0.1, 0, 0.2, size + 0.4], [-size / 2 - 0.1, 0, 0.2, size + 0.4], [0, size / 2 + 0.1, size, 0.2], [0, -size / 2 - 0.1, size, 0.2]]) {
    const wallM = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.concrete);
    wallM.position.set(x + dx, ceilingY + h / 2, z + dz);
    g.add(wallM);
  }
  const cap = new THREE.Mesh(new THREE.BoxGeometry(size + 0.4, 0.2, size + 0.4), M.blackSteel);
  cap.position.set(x, ceilingY + h, z);
  g.add(cap);
  return g;
}

function jitter(i, amp) {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return (s - Math.floor(s) - 0.5) * 2 * amp;
}

// Make each face of a box carry UVs in meters so the wood grain runs along the long axis.
function scaleBoxUV(geo, [sx, sy, sz], grainAlongX = false) {
  const uv = geo.attributes.uv;
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z ; 4 verts each
  const faceScale = [
    [sz, sy], [sz, sy], [sx, sz], [sx, sz], [sx, sy], [sx, sy],
  ];
  for (let f = 0; f < 6; f++) {
    const [su, sv] = faceScale[f];
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      let u = uv.getX(i) * su, w = uv.getY(i) * sv;
      if (grainAlongX) [u, w] = [w, u]; // rotate grain for ceiling timbers (long axis = x)
      uv.setXY(i, u, w);
    }
  }
  uv.needsUpdate = true;
}
