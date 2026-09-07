// sweep.js — sweep a closed 2D profile along a path of points to make structural members
// (I-beams bent around the arch, rails, wales). Profile is in the (right, up) plane of each
// path frame; the path frame's "up" is supplied per point so ribs point their webs radially.
import * as THREE from 'three';

/**
 * @param {Array<[number,number]>} profile  closed polygon, CCW, in (r, u) local coords
 * @param {Array<THREE.Vector3>} path        points along the member
 * @param {Array<THREE.Vector3>} ups         per-point "up" (radial) direction, unit
 * @param {boolean} caps                     close the ends
 */
export function sweepProfile(profile, path, ups, caps = true) {
  const n = path.length, m = profile.length;
  const positions = [], normals = [], uvs = [], indices = [];
  const tangent = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3();

  // Per-edge flat shading: duplicate vertices per profile edge so the I-beam corners stay crisp.
  for (let i = 0; i < n; i++) {
    if (i < n - 1) tangent.subVectors(path[i + 1], path[i]).normalize();
    else tangent.subVectors(path[i], path[i - 1]).normalize();
    up.copy(ups[i]).normalize();
    right.crossVectors(tangent, up).normalize();
    up.crossVectors(right, tangent).normalize();
    for (let j = 0; j < m; j++) {
      const a = profile[j], b = profile[(j + 1) % m];
      // edge normal in profile space (outward for CCW polygon)
      const ex = b[0] - a[0], ey = b[1] - a[1];
      const el = Math.hypot(ex, ey) || 1;
      const nr = ey / el, nu = -ex / el;
      for (const p of [a, b]) {
        positions.push(
          path[i].x + right.x * p[0] + up.x * p[1],
          path[i].y + right.y * p[0] + up.y * p[1],
          path[i].z + right.z * p[0] + up.z * p[1],
        );
        normals.push(right.x * nr + up.x * nu, right.y * nr + up.y * nu, right.z * nr + up.z * nu);
        uvs.push(j / m, i / (n - 1));
      }
    }
  }
  const ring = m * 2;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < m; j++) {
      const a = i * ring + j * 2, b = a + 1, c = a + ring, d = b + ring;
      indices.push(a, c, b, b, c, d);
    }
  }
  if (caps) {
    // fan caps (profile assumed convex-ish; I-beam is not convex but the fan from the centroid works for our symmetric profiles)
    for (const end of [0, n - 1]) {
      const base = positions.length / 3;
      const t = end === 0 ? -1 : 1;
      if (end < n - 1) tangent.subVectors(path[end + 1], path[end]).normalize();
      else tangent.subVectors(path[end], path[end - 1]).normalize();
      up.copy(ups[end]).normalize();
      right.crossVectors(tangent, up).normalize();
      up.crossVectors(right, tangent).normalize();
      let cx = 0, cy = 0;
      for (const p of profile) { cx += p[0]; cy += p[1]; }
      cx /= m; cy /= m;
      positions.push(path[end].x + right.x * cx + up.x * cy, path[end].y + right.y * cx + up.y * cy, path[end].z + right.z * cx + up.z * cy);
      normals.push(tangent.x * t, tangent.y * t, tangent.z * t); uvs.push(0.5, 0.5);
      for (let j = 0; j < m; j++) {
        const p = profile[j];
        positions.push(path[end].x + right.x * p[0] + up.x * p[1], path[end].y + right.y * p[0] + up.y * p[1], path[end].z + right.z * p[0] + up.z * p[1]);
        normals.push(tangent.x * t, tangent.y * t, tangent.z * t); uvs.push(p[0], p[1]);
      }
      for (let j = 0; j < m; j++) {
        const a = base, b = base + 1 + j, c = base + 1 + ((j + 1) % m);
        if (t > 0) indices.push(a, b, c); else indices.push(a, c, b);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  return g;
}

/** I-beam profile, CCW, centered. depth along u, flange along r. */
export function iBeamProfile(depth, flange, web = depth * 0.06, tf = depth * 0.08) {
  const d = depth / 2, f = flange / 2, w = web / 2;
  return [
    [-f, -d], [f, -d], [f, -d + tf], [w, -d + tf], [w, d - tf], [f, d - tf],
    [f, d], [-f, d], [-f, d - tf], [-w, d - tf], [-w, -d + tf], [-f, -d + tf],
  ];
}

/** Rail profile (simplified ASCE section), CCW. r across, u up; base at u=0. */
export function railProfile(height = 0.152, head = 0.066, base = 0.14, web = 0.016) {
  const h = head / 2, b = base / 2, w = web / 2, hh = 0.04, bh = 0.02;
  return [
    [-b, 0], [b, 0], [b, bh], [w, bh + 0.01], [w, height - hh - 0.005], [h, height - hh],
    [h, height], [-h, height], [-h, height - hh], [-w, height - hh - 0.005], [-w, bh + 0.01], [-b, bh],
  ];
}

/** Straight path helper along a line from a to b with a constant up. */
export function linePath(a, b, segments = 1) {
  const path = [], ups = [];
  for (let i = 0; i <= segments; i++) {
    path.push(new THREE.Vector3().lerpVectors(a, b, i / segments));
    ups.push(new THREE.Vector3(0, 1, 0));
  }
  return { path, ups };
}
