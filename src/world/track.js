// track.js — rails and ties along a polyline; ballast surfaces are built by each tunnel module.
import * as THREE from 'three';
import { TRACK } from '../canon.js';
import { sweepProfile, railProfile } from '../geometry/sweep.js';
import { getMaterials } from '../materials.js';

/**
 * Build rails + ties along a polyline of THREE.Vector3 points (y = top-of-tie level).
 * Returns a Group.
 */
export function buildTrack(points, { tieLength = TRACK.tieLength, ties = true } = {}) {
  const M = getMaterials();
  const g = new THREE.Group();
  const half = TRACK.gauge / 2 + TRACK.railHead / 2;
  const prof = railProfile(TRACK.railHeight, TRACK.railHead, TRACK.railBase);

  // Offset the polyline left/right for each rail
  for (const side of [-1, 1]) {
    const path = [], ups = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
      const dir = new THREE.Vector3().subVectors(b, a).normalize();
      const right = new THREE.Vector3(dir.z, 0, -dir.x); // perpendicular in the XZ plane
      // rails sit on tie plates ~2 cm above the tie top
      path.push(points[i].clone().addScaledVector(right, side * half).add(new THREE.Vector3(0, 0.02, 0)));
      ups.push(new THREE.Vector3(0, 1, 0));
    }
    const geo = sweepProfile(prof, path, ups, true);
    const rail = new THREE.Mesh(geo, M.rail);
    rail.frustumCulled = true;
    g.add(rail);
  }

  if (ties) {
    // Count ties along the polyline
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) total += points[i].distanceTo(points[i + 1]);
    const n = Math.floor(total / TRACK.tieSpacing);
    const geo = new THREE.BoxGeometry(tieLength, TRACK.tieHeight, TRACK.tieWidth);
    const inst = new THREE.InstancedMesh(geo, M.tie, n);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1);
    let seg = 0, segStart = 0, segLen = points[0].distanceTo(points[1]);
    const dir = new THREE.Vector3().subVectors(points[1], points[0]).normalize();
    for (let k = 0; k < n; k++) {
      const d = k * TRACK.tieSpacing + TRACK.tieSpacing / 2;
      while (d > segStart + segLen && seg < points.length - 2) {
        segStart += segLen; seg++;
        segLen = points[seg].distanceTo(points[seg + 1]);
        dir.subVectors(points[seg + 1], points[seg]).normalize();
      }
      const p = points[seg].clone().addScaledVector(dir, d - segStart);
      p.y -= TRACK.tieHeight / 2 - 0.012; // tie top ~1 cm proud of the ballast
      const yaw = Math.atan2(dir.x, dir.z);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
      m.compose(p, q, s);
      inst.setMatrixAt(k, m);
    }
    inst.instanceMatrix.needsUpdate = true;
    g.add(inst);
  }
  return g;
}

/** Rail bumper: steel post-and-beam stop across the track (dimensions INFERRED). */
export function buildBumper(x, y, z) {
  const M = getMaterials();
  const g = new THREE.Group();
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 0.3), M.blackSteel);
  beam.position.set(x, y + 0.85, z + 0.15);
  g.add(beam);
  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.0, 0.25), M.blackSteel);
    post.position.set(x + s * 0.9, y + 0.5, z + 0.15);
    g.add(post);
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 1.4), M.blackSteel);
    brace.position.set(x + s * 0.9, y + 0.55, z + 0.8);
    brace.rotation.x = -0.6;
    g.add(brace);
  }
  return g;
}
