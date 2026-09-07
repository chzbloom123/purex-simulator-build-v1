// junction.js — the below-grade railroad tunnel stub and the cast-in-place spur to Tunnel 2.
// Canon: T1 is a straight extension southward; T2's spur "angles eastward then angles southward"
// (PERMIT §2.1.2); the 1964 spur is "cast-in-place" (CHPRC-03365). Interior dimensions INFERRED.
import * as THREE from 'three';
import { APPROACH, DOOR } from '../canon.js';
import { L } from './layout.js';
import { getMaterials } from '../materials.js';
import { buildTrack } from './track.js';
import { setUV } from './doors.js';

const M = () => getMaterials();

// Wall panel between two XZ points, vertical, height H, facing the interior (normal given by `flip`).
function wall(ax, az, bx, bz, H, flip = false, mat = M().concrete, y0 = 0) {
  const len = Math.hypot(bx - ax, bz - az);
  const geo = new THREE.PlaneGeometry(len, H);
  setUV(geo, len, H);
  const m = new THREE.Mesh(geo, mat);
  m.position.set((ax + bx) / 2, y0 + H / 2, (az + bz) / 2);
  const yaw = Math.atan2(bx - ax, bz - az);
  m.rotation.y = yaw + (flip ? -Math.PI / 2 : Math.PI / 2);
  return m;
}

// Intersection of two 2D lines given point+direction.
function lineIntersect(p, d, q, e) {
  const den = d.x * e.y - d.y * e.x;
  const t = ((q.x - p.x) * e.y - (q.y - p.y) * e.x) / den;
  return new THREE.Vector2(p.x + d.x * t, p.y + d.y * t);
}

export function buildJunction() {
  const g = new THREE.Group();
  const H = APPROACH.height, hw = APPROACH.width / 2;
  const northZ = L.approach.northZ;
  const t1HouseN = L.t1.doorInnerZ - DOOR.houseLength;
  const t2HouseN = L.t2.doorInnerZ - DOOR.houseLength;

  // ---- Spur edge lines
  const { p0, p1, dir } = L.spur;
  const n = new THREE.Vector2(dir.y, -dir.x); // east-pointing normal of the angled leg
  const eastEdgeP = p0.clone().addScaledVector(n, hw), westEdgeP = p0.clone().addScaledVector(n, -hw);
  const south = new THREE.Vector2(0, 1);
  // where the spur edges leave the main tunnel's east wall (x = hw)
  const eastLeave = lineIntersect(eastEdgeP, dir, new THREE.Vector2(hw, 0), south);
  const westLeave = lineIntersect(westEdgeP, dir, new THREE.Vector2(hw, 0), south);
  // where they meet the straight leg's walls (x = axis ± hw)
  const eastBend = lineIntersect(eastEdgeP, dir, new THREE.Vector2(L.t2.axisX + hw, 0), south);
  const westBend = lineIntersect(westEdgeP, dir, new THREE.Vector2(L.t2.axisX - hw, 0), south);

  // ---- Main railroad tunnel walls
  g.add(wall(-hw, northZ, -hw, t1HouseN, H, false));                 // west wall (full)
  g.add(wall(hw, northZ, hw, eastLeave.y, H, true));                 // east wall north of the turnout
  g.add(wall(hw, westLeave.y, hw, t1HouseN, H, true));               // east wall south of the turnout
  // North end wall (simulation limit; the railroad tunnel continues to 202-A)
  g.add(wall(-hw, northZ, hw, northZ, H, false));

  // ---- Spur walls: angled leg then straight leg
  g.add(wall(eastLeave.x, eastLeave.y, eastBend.x, eastBend.y, H, true));
  g.add(wall(westLeave.x, westLeave.y, westBend.x, westBend.y, H, false));
  g.add(wall(L.t2.axisX + hw, eastBend.y, L.t2.axisX + hw, t2HouseN, H, true));
  g.add(wall(L.t2.axisX - hw, westBend.y, L.t2.axisX - hw, t2HouseN, H, false));

  // ---- Floor (ballast) and ceiling (concrete): single planes covering the junction footprint.
  const x0 = -hw - 1, x1 = L.t2.axisX + hw + 1, za = northZ - 0.5, zb = L.t2.doorInnerZ + 0.5;
  const floorGeo = new THREE.PlaneGeometry(x1 - x0, zb - za);
  setUV(floorGeo, (x1 - x0) / 1.5, (zb - za) / 1.5);
  const floor = new THREE.Mesh(floorGeo, M().gravel);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set((x0 + x1) / 2, 0, (za + zb) / 2);
  g.add(floor);
  const ceilGeo = new THREE.PlaneGeometry(x1 - x0, zb - za);
  setUV(ceilGeo, (x1 - x0) / 2, (zb - za) / 2);
  const ceil = new THREE.Mesh(ceilGeo, M().concrete);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set((x0 + x1) / 2, H, (za + zb) / 2);
  g.add(ceil);

  // ---- Track: main line runs from the north limit through the T1 door; spur branches at p0.
  const main = buildTrack([new THREE.Vector3(0, 0, northZ), new THREE.Vector3(0, 0, L.t1.doorInnerZ + 0.01)]);
  g.add(main);
  const spurPts = [
    new THREE.Vector3(p0.x, 0, p0.y - 6),   // blend into the main line a little north of the turnout
    new THREE.Vector3(p0.x + 0.4, 0, p0.y - 1),
    new THREE.Vector3(p1.x, 0, p1.y),
    new THREE.Vector3(p1.x, 0, L.t2.doorInnerZ + 0.01),
  ];
  g.add(buildTrack(spurPts));

  return g;
}
