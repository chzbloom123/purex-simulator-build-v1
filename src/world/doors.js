// doors.js — the water-fillable shielding doors and their concrete door structures.
// Canon: 7.5 m high × 6.6 m wide × 2.1 m thick, 1.3 cm steel plate, hollow; raised by electric
// hoists into a reinforced-concrete structure above (PERMIT §2.1.1). In 1999 both are down and sealed.
import * as THREE from 'three';
import { DOOR, APPROACH } from '../canon.js';
import { getMaterials } from '../materials.js';

/**
 * @param axisX  track centerline x
 * @param innerZ tunnel-side (south) face of the door structure
 * @param opening {w,h} or {arch: {R, cy, footY}} — shape of the tunnel opening on the south face
 */
export function buildDoorHouse(axisX, innerZ, opening) {
  const M = getMaterials();
  const g = new THREE.Group();
  const len = DOOR.houseLength;
  const z0 = innerZ - len, z1 = innerZ;
  const hw = DOOR.width / 2;           // interior half-width = door width (INFERRED: door runs in guides flush with walls)
  const H = APPROACH.height;           // interior ceiling height in the vestibules
  const wallT = APPROACH.wallThickness;

  // Side walls
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(wallT, H + 0.6, len), M.concrete);
    w.position.set(axisX + s * (hw + wallT / 2), (H + 0.6) / 2 - 0.3, (z0 + z1) / 2);
    setUV(w.geometry, len, H);
    g.add(w);
  }
  // Ceiling with the door slot open above the slab (the slot rises into the hoist tower)
  const zc = (z0 + z1) / 2;
  const slotHalf = DOOR.thickness / 2 + 0.15;
  for (const [za, zb] of [[z0, zc - slotHalf], [zc + slotHalf, z1]]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(hw * 2 + wallT * 2, 0.6, zb - za), M.concrete);
    c.position.set(axisX, H + 0.3, (za + zb) / 2);
    g.add(c);
  }
  // Slot shaft walls (dark concrete going up ~9 m into the tower)
  const shaftH = 9;
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(hw * 2 + wallT * 2, shaftH, 0.3), M.concrete);
    w.position.set(axisX, H + shaftH / 2, zc + s * (slotHalf + 0.15));
    g.add(w);
  }
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.3, shaftH, slotHalf * 2), M.concrete);
    w.position.set(axisX + s * (hw + 0.15), H + shaftH / 2, zc);
    g.add(w);
  }
  const cap = new THREE.Mesh(new THREE.BoxGeometry(hw * 2 + 1, 0.3, slotHalf * 2), M.concrete);
  cap.position.set(axisX, H + shaftH, zc);
  g.add(cap);

  // The door slab itself: hollow steel box, plate seams, horizontal stiffener bands.
  const slab = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(DOOR.width - 0.04, DOOR.height, DOOR.thickness), M.doorSteel);
  setUV(body.geometry, DOOR.width, DOOR.height);
  slab.add(body);
  // Plate seams as thin raised strips on both faces (INFERRED detailing: 8-ft plate courses)
  const courses = Math.floor(DOOR.height / 2.44);
  for (let i = 1; i <= courses; i++) {
    for (const f of [-1, 1]) {
      const seam = new THREE.Mesh(new THREE.BoxGeometry(DOOR.width - 0.04, 0.09, 0.025), M.doorSeam);
      seam.position.set(0, -DOOR.height / 2 + i * 2.44, f * (DOOR.thickness / 2 + 0.01));
      slab.add(seam);
    }
  }
  for (const f of [-1, 1]) for (const s of [-1, 1]) {
    const vs = new THREE.Mesh(new THREE.BoxGeometry(0.09, DOOR.height, 0.025), M.doorSeam);
    vs.position.set(s * DOOR.width / 4, 0, f * (DOOR.thickness / 2 + 0.01));
    slab.add(vs);
  }
  // Edge frame / guide rails
  for (const s of [-1, 1]) {
    const guide = new THREE.Mesh(new THREE.BoxGeometry(0.12, DOOR.height + 0.4, DOOR.thickness + 0.2), M.blackSteel);
    guide.position.set(s * (DOOR.width / 2 - 0.02), 0.2, 0);
    slab.add(guide);
  }
  slab.position.set(axisX, DOOR.height / 2, zc);
  g.add(slab);

  // South face wall: fills the door-house section around the tunnel opening
  const face = buildFaceWall(hw * 2 + wallT * 2, H + 0.6, opening, M.concrete);
  face.position.set(axisX, -0.3, z1 - 0.01);
  g.add(face);

  return g;
}

// A wall spanning (width × height) with a hole shaped like `opening`, lying in the XY plane, facing -Z (north into the vestibule).
function buildFaceWall(width, height, opening, material) {
  const shape = new THREE.Shape();
  if (opening.arch) {
    // Outer profile = the Quonset section (so the end wall fills the arch); the wall sits 0.3 below the rail datum.
    const { R, cy, footY, footX } = opening.arch;
    shape.moveTo(-footX - 0.4, 0); shape.lineTo(footX + 0.4, 0); shape.lineTo(footX + 0.4, footY + 0.3);
    shape.lineTo(footX, footY + 0.3);
    const a0 = Math.atan2(footY - cy, footX), a1 = Math.atan2(footY - cy, -footX);
    shape.absarc(0, cy + 0.3, R + 0.02, a0, a1, false);
    shape.lineTo(-footX - 0.4, footY + 0.3); shape.closePath();
  } else {
    shape.moveTo(-width / 2, 0); shape.lineTo(width / 2, 0); shape.lineTo(width / 2, height); shape.lineTo(-width / 2, height); shape.closePath();
  }
  // Door opening = the usable storage envelope, 5.8 m wide × 6.7 m high above top-of-rail (PERMIT §2.1.2)
  const ow = opening.w ?? 5.8, oh = opening.h ?? 6.7;
  const hole = new THREE.Path();
  hole.moveTo(-ow / 2, 0.3); hole.lineTo(ow / 2, 0.3);
  hole.lineTo(ow / 2, oh + 0.3); hole.lineTo(-ow / 2, oh + 0.3); hole.closePath();
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false });
  const mesh = new THREE.Mesh(geo, material);
  mesh.rotation.y = Math.PI; // extrude along -Z so the wall sits north of the face plane
  return mesh;
}

export function setUV(geometry, sx, sy) {
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * sx, uv.getY(i) * sy);
  uv.needsUpdate = true;
}
