// tunnel2.js — Tunnel 2 (218-E-15): the 1964 Quonset arch, 1,688 ft of corrugated steel on
// 6I12.5 ribs at 37 11/16" o.c., retrofit W12 wales hung from exterior concrete ribs at 15'-8¾" o.c.
// Local frame: x from the track axis, y from the rail bed, z from the door; tilted 0.1% south.
import * as THREE from 'three';
import { T2, IN } from '../canon.js';
import { L, t2Profile, T2_SLOPE_TOE, T2_SLOPE_TOP_X, T2_ARCH_FOOT_X, T2_ARCH_FOOT_ANGLE } from './layout.js';
import { getMaterials } from '../materials.js';
import { sweepProfile, iBeamProfile } from '../geometry/sweep.js';
import { buildTrack, buildBumper } from './track.js';
import { buildDoorHouse, setUV } from './doors.js';
import { buildVentShaft } from './tunnel1.js';

export function buildTunnel2() {
  const M = getMaterials();
  const root = new THREE.Group();
  const R = L.t2.R, cy = L.t2.archCenterY, len = T2.length;

  root.add(buildDoorHouse(L.t2.axisX, L.t2.doorInnerZ, {
    arch: { R, cy, footY: T2.sideSlopeTop, footX: T2_ARCH_FOOT_X },
  }));

  const g = new THREE.Group();
  g.position.set(L.t2.axisX, 0, L.t2.doorInnerZ);

  // ---- Corrugated shell: a partial cylinder from footing to footing. UVs in meters (u = arc length, v = z).
  const a0 = T2_ARCH_FOOT_ANGLE;                 // just below the springline on the east side
  const aStart = Math.PI - a0, aEnd = a0;        // west foot → over the crown → east foot (CCW seen from the south)
  const angSeg = 72, zSeg = Math.ceil(len / 4);
  const pos = [], nor = [], uv = [], idx = [];
  for (let j = 0; j <= zSeg; j++) {
    const z = (j / zSeg) * len;
    for (let i = 0; i <= angSeg; i++) {
      const a = aStart + (aEnd - aStart) * (i / angSeg);
      const x = R * Math.cos(a), y = cy + R * Math.sin(a);
      pos.push(x, y, z);
      nor.push(-Math.cos(a), -Math.sin(a), 0); // inward
      uv.push(R * (a - aEnd), z);
    }
  }
  for (let j = 0; j < zSeg; j++) for (let i = 0; i < angSeg; i++) {
    const a = j * (angSeg + 1) + i, b = a + 1, c = a + angSeg + 1, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const shellGeo = new THREE.BufferGeometry();
  shellGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  shellGeo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  shellGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  shellGeo.setIndex(idx);
  const shellMat = M.corrugated.clone(); shellMat.side = THREE.DoubleSide;
  const shell = new THREE.Mesh(shellGeo, shellMat);
  g.add(shell);

  // ---- Steel ribs: 6I12.5 bent to the arch, web radial, inner face at R - depth.
  const ribR = R - T2.steelRibDepth / 2 - 0.005;
  const ribPath = [], ribUps = [];
  const ribSegs = 48;
  for (let i = 0; i <= ribSegs; i++) {
    const a = aStart + (aEnd - aStart) * (i / ribSegs);
    ribPath.push(new THREE.Vector3(ribR * Math.cos(a), cy + ribR * Math.sin(a), 0));
    ribUps.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0)); // radial = "up" of the profile
  }
  const ribGeo = sweepProfile(iBeamProfile(T2.steelRibDepth, T2.steelRibFlange, 0.006, 0.008), ribPath, ribUps, true);
  const ribCount = Math.floor(len / T2.steelRibSpacing);
  const ribs = new THREE.InstancedMesh(ribGeo, M.blackSteel, ribCount);
  const m = new THREE.Matrix4();
  for (let i = 0; i < ribCount; i++) {
    m.makeTranslation(0, 0, i * T2.steelRibSpacing + T2.steelRibSpacing / 2);
    ribs.setMatrixAt(i, m);
  }
  g.add(ribs);

  // ---- Wales: five longitudinal W12 beams per side, hung below the ribs, webs radial.
  const waleR = R - T2.steelRibDepth - 0.04 - T2.waleDepth / 2;
  const waleProfile = iBeamProfile(T2.waleDepth, T2.waleFlange, 0.008, 0.012);
  const hangerStations = [];
  for (let zc = T2.concreteRibSpacing / 2; zc < len; zc += T2.concreteRibSpacing) hangerStations.push(zc);
  const bolts = [];
  for (const side of [-1, 1]) {
    for (const w of T2.wales) {
      const a = side < 0 ? Math.PI - (w.angleDeg * Math.PI) / 180 : (w.angleDeg * Math.PI) / 180;
      const x = waleR * Math.cos(a), y = cy + waleR * Math.sin(a);
      const path = [new THREE.Vector3(x, y, 0), new THREE.Vector3(x, y, len)];
      const ups = [new THREE.Vector3(Math.cos(a), Math.sin(a), 0), new THREE.Vector3(Math.cos(a), Math.sin(a), 0)];
      const wale = new THREE.Mesh(sweepProfile(waleProfile, path, ups, true), M.blackSteel);
      g.add(wale);
      for (const zc of hangerStations) bolts.push({ a, zc });
    }
  }

  // ---- Hanger bolts: two rods per wale per concrete-rib station, through a square plate under the wale flange.
  const rodLen = T2.steelRibDepth + 0.04 + T2.waleDepth + 0.12;
  const rodGeo = new THREE.CylinderGeometry(0.014, 0.014, rodLen, 8);
  const plateGeo = new THREE.BoxGeometry(0.18, 0.02, 0.18);
  const rods = new THREE.InstancedMesh(rodGeo, M.blackSteel, bolts.length * 2);
  const plates = new THREE.InstancedMesh(plateGeo, M.blackSteel, bolts.length);
  const q = new THREE.Quaternion(), s1 = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
  const zAxis = new THREE.Vector3(0, 0, 1), radial = new THREE.Vector3(), tangentDir = new THREE.Vector3();
  let bi = 0;
  for (const b of bolts) {
    radial.set(Math.cos(b.a), Math.sin(b.a), 0);
    // rotate the rod's local Y (cylinder axis) onto the radial direction
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), radial);
    const rodCenterR = R - rodLen / 2 - 0.005;
    tangentDir.crossVectors(zAxis, radial); // along the arch
    for (const side of [-1, 1]) {
      p.set(rodCenterR * radial.x, cy + rodCenterR * radial.y, b.zc).addScaledVector(tangentDir, side * (T2.waleFlange / 2 + 0.02));
      m.compose(p, q, s1);
      rods.setMatrixAt(bi * 2 + (side + 1) / 2, m);
    }
    const plateR = waleR - T2.waleDepth / 2 - 0.02;
    p.set(plateR * radial.x, cy + plateR * radial.y, b.zc);
    m.compose(p, q, s1);
    plates.setMatrixAt(bi, m);
    bi++;
  }
  g.add(rods, plates);

  // ---- Floor: ballast shoulder, 1:1½ earth slopes, concrete footing ledges.
  const strips = [
    { x0: -T2_SLOPE_TOE, x1: T2_SLOPE_TOE, mat: M.gravel },
    { x0: T2_SLOPE_TOE, x1: T2_SLOPE_TOP_X, mat: M.gravel },
    { x0: -T2_SLOPE_TOP_X, x1: -T2_SLOPE_TOE, mat: M.gravel },
    { x0: T2_SLOPE_TOP_X, x1: T2_ARCH_FOOT_X + 0.3, mat: M.concrete },
    { x0: -T2_ARCH_FOOT_X - 0.3, x1: -T2_SLOPE_TOP_X, mat: M.concrete },
  ];
  for (const s of strips) {
    const y0 = t2Profile(Math.abs(s.x0)), y1 = t2Profile(Math.abs(s.x1));
    const w = Math.hypot(s.x1 - s.x0, y1 - y0);
    const geo = new THREE.PlaneGeometry(w, len);
    setUV(geo, w / 1.5, len / 1.5);
    const mesh = new THREE.Mesh(geo, s.mat);
    // Plane starts in XY facing +Z. Lay it flat (face up), then tilt about the tunnel axis by the cross-slope.
    const mm = new THREE.Matrix4().multiplyMatrices(
      new THREE.Matrix4().makeRotationZ(Math.atan2(y1 - y0, s.x1 - s.x0)),
      new THREE.Matrix4().makeRotationX(-Math.PI / 2),
    );
    geo.applyMatrix4(mm);
    mesh.position.set((s.x0 + s.x1) / 2, (y0 + y1) / 2, len / 2);
    g.add(mesh);
  }

  g.add(buildTrack([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, len)], { tieLength: T2.tieLength }));
  g.add(buildBumper(0, 0, len - T2.bumperFromSouthEnd));

  // ---- Roof ports: 17 along the ridge on 29.3 m centers, each with a 7.6 cm bar plug on a chain.
  const portGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 12);
  const ports = new THREE.InstancedMesh(portGeo, M.blackSteel, T2.roofPortCount);
  const chainGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.6, 6);
  const chains = new THREE.InstancedMesh(chainGeo, M.blackSteel, T2.roofPortCount);
  const firstPort = (len - (T2.roofPortCount - 1) * T2.roofPortSpacing) / 2;
  for (let i = 0; i < T2.roofPortCount; i++) {
    const z = firstPort + i * T2.roofPortSpacing;
    m.makeTranslation(0, cy + R - 0.12, z); ports.setMatrixAt(i, m);
    m.makeTranslation(0.08, cy + R - 0.45, z); chains.setMatrixAt(i, m);
  }
  g.add(ports, chains);

  // ---- South end: flat concrete wall filling the arch (material INFERRED) with the vent shaft beside the crown
  const endShape = new THREE.Shape();
  endShape.moveTo(-T2_ARCH_FOOT_X, -0.2); endShape.lineTo(-T2_ARCH_FOOT_X, T2.sideSlopeTop);
  endShape.absarc(0, cy, R, Math.atan2(T2.sideSlopeTop - cy, -T2_ARCH_FOOT_X), Math.atan2(T2.sideSlopeTop - cy, T2_ARCH_FOOT_X), true);
  endShape.lineTo(T2_ARCH_FOOT_X, -0.2); endShape.closePath();
  const endGeo = new THREE.ShapeGeometry(endShape);
  setUV(endGeo, 1, 1);
  const endWall = new THREE.Mesh(endGeo, M.concrete);
  endWall.position.set(0, 0, len);
  endWall.rotation.y = Math.PI;
  g.add(endWall);
  g.add(buildVentShaft(M, 0, cy + R - 0.3, len - 1.6, T2.ventShaft));

  g.rotation.x = Math.atan(T2.grade);
  root.add(g);
  return root;
}
