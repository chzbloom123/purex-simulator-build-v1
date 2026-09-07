// layout.js — where everything sits in the world frame, derived from canon.js.
// Also the walkability model: corridors (polyline + half-width), blockers (boxes), ground height.
import * as THREE from 'three';
import { T1, T2, SITE, DOOR, APPROACH, CAR, PRESENT } from '../canon.js';
import { TUNNEL1, TUNNEL2 } from '../data/inventory.js';

const deg = (d) => (d * Math.PI) / 180;

// ---- Key stations -----------------------------------------------------------
export const L = {
  t1: {
    axisX: 0,
    doorInnerZ: 0,                     // south (tunnel-side) face of the T1 door structure
    start: 0, end: T1.length,          // storage area z-range
    bumperZ: T1.length - T1.bumperFromSouthEnd,
    railY: (z) => -T1.grade * z,
    halfWidth: T1.width / 2,
  },
  t2: {
    axisX: SITE.t2DoorEastOffset,
    doorInnerZ: SITE.t2DoorSouthOffset,
    start: SITE.t2DoorSouthOffset, end: SITE.t2DoorSouthOffset + T2.length,
    bumperZ: SITE.t2DoorSouthOffset + T2.length - T2.bumperFromSouthEnd,
    railY: (z) => -T2.grade * (z - SITE.t2DoorSouthOffset),
    archCenterY: T2.archCenterAboveRail,
    R: T2.archRadius,
    walkHalfWidth: 5.0,                // INFERRED presentation limit: headroom under the arch drops below eye height beyond this
  },
  approach: {
    halfWidth: APPROACH.width / 2,
    height: APPROACH.height,
    northZ: SITE.railroadTunnelNorthLimit,
  },
};

// T2 spur centerline: turnout on the main line, angled leg, then straight south to the T2 door house.
(function computeSpur() {
  const h = deg(SITE.t2DoglegHeadingDeg);
  const p0 = new THREE.Vector2(0, SITE.t2BranchZ);
  const dz = SITE.t2DoorEastOffset / Math.tan(h);
  const p1 = new THREE.Vector2(SITE.t2DoorEastOffset, SITE.t2BranchZ + dz);
  const p2 = new THREE.Vector2(SITE.t2DoorEastOffset, L.t2.doorInnerZ - DOOR.houseLength);
  L.spur = { p0, p1, p2, heading: h, dir: new THREE.Vector2(Math.sin(h), Math.cos(h)) };
})();

// ---- T2 floor profile (local |x| from axis → height above rail bed) ----------
export function t2Profile(ax) {
  const toe = T2.ballastShoulderHalf;
  const run = T2.sideSlopeTop / T2.sideSlope;       // horizontal run of the 1:1.5 slope
  if (ax <= toe) return 0;
  if (ax <= toe + run) return (ax - toe) * T2.sideSlope;
  return T2.sideSlopeTop;
}
export const T2_SLOPE_TOE = T2.ballastShoulderHalf;
export const T2_SLOPE_TOP_X = T2.ballastShoulderHalf + T2.sideSlopeTop / T2.sideSlope;
// where the arch meets the footing ledge (y = sideSlopeTop)
export const T2_ARCH_FOOT_X = Math.sqrt(L.t2.R ** 2 - (L.t2.archCenterY - T2.sideSlopeTop) ** 2);
export const T2_ARCH_FOOT_ANGLE = Math.asin((T2.sideSlopeTop - L.t2.archCenterY) / L.t2.R); // negative: below springline

// ---- Car placement ------------------------------------------------------------
export function layoutCars() {
  const cars = [];
  const place = (tunnel, list, axisX, bumperZ) => {
    let zEnd = bumperZ;
    for (const item of list) {
      const len = item.car === 'flat-short' ? CAR.shortLength : CAR.length;
      const zStart = zEnd - len;
      cars.push({ tunnel, ...item, axisX, zStart, zEnd, length: len, zCenter: (zStart + zEnd) / 2 });
      zEnd = zStart;
    }
  };
  place(1, TUNNEL1, L.t1.axisX, L.t1.bumperZ);
  place(2, TUNNEL2, L.t2.axisX, L.t2.bumperZ);
  return cars;
}

// ---- Walkability -----------------------------------------------------------------
function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const l2 = dx * dx + dz * dz || 1e-9;
  let t = ((px - ax) * dx + (pz - az) * dz) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

export function makeWalkModel(cars) {
  const r = PRESENT.playerRadius;
  const corridors = [
    // main railroad tunnel down to the T1 door house
    { pts: [[0, L.approach.northZ + 0.5], [0, L.t1.doorInnerZ]], hw: L.approach.halfWidth - r },
    // T2 spur
    { pts: [[L.spur.p0.x, L.spur.p0.y], [L.spur.p1.x, L.spur.p1.y], [L.spur.p2.x, L.t2.doorInnerZ]], hw: L.approach.halfWidth - r },
    // Tunnel 1 storage
    { pts: [[0, L.t1.start], [0, L.t1.end - 0.2]], hw: L.t1.halfWidth - r },
    // Tunnel 2 storage
    { pts: [[L.t2.axisX, L.t2.start], [L.t2.axisX, L.t2.end - 0.2]], hw: L.t2.walkHalfWidth - r },
  ];
  const blockers = [];
  // door slabs
  for (const t of [L.t1, L.t2]) {
    const zc = t.doorInnerZ - DOOR.houseLength / 2;
    blockers.push({ x0: t.axisX - DOOR.width, x1: t.axisX + DOOR.width, z0: zc - DOOR.thickness / 2 - r, z1: zc + DOOR.thickness / 2 + r });
  }
  // cars (deck footprint + margin)
  for (const c of cars) {
    blockers.push({ x0: c.axisX - CAR.width / 2 - r, x1: c.axisX + CAR.width / 2 + r, z0: c.zStart - r, z1: c.zEnd + r });
  }
  // bumpers
  for (const t of [L.t1, L.t2]) blockers.push({ x0: t.axisX - 1.1 - r, x1: t.axisX + 1.1 + r, z0: t.bumperZ - r, z1: t.bumperZ + 0.4 + r });
  // T1 south vent shaft footing / end wall handled by corridor end; T2 the same.

  function inCorridor(x, z) {
    for (const c of corridors) {
      for (let i = 0; i < c.pts.length - 1; i++) {
        if (distToSegment(x, z, c.pts[i][0], c.pts[i][1], c.pts[i + 1][0], c.pts[i + 1][1]) <= c.hw) return true;
      }
    }
    return false;
  }
  function blocked(x, z) {
    for (const b of blockers) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) return true;
    return false;
  }
  function isWalkable(x, z) { return inCorridor(x, z) && !blocked(x, z); }

  function region(x, z) {
    if (z >= L.t2.start && Math.abs(x - L.t2.axisX) <= L.t2.R + 1 && z <= L.t2.end) return 't2';
    if (z >= L.t1.start && Math.abs(x) <= L.t1.halfWidth + 1 && z <= L.t1.end) return 't1';
    return 'junction';
  }
  function groundHeight(x, z) {
    const rg = region(x, z);
    if (rg === 't2') return L.t2.railY(z) + t2Profile(Math.abs(x - L.t2.axisX));
    if (rg === 't1') return L.t1.railY(z);
    return 0;
  }
  return { isWalkable, groundHeight, region, corridors, blockers };
}

// Doors the visitor may "step through" (presentation conceit).
export function doorList() {
  return [L.t1, L.t2].map((t, i) => {
    const zc = t.doorInnerZ - DOOR.houseLength / 2;
    return {
      id: i === 0 ? 'door-t1' : 'door-t2',
      name: i === 0 ? 'Tunnel 1 water-fillable door' : 'Tunnel 2 water-fillable door',
      axisX: t.axisX,
      zNorth: zc - DOOR.thickness / 2,  // north face
      zSouth: zc + DOOR.thickness / 2,  // south face
    };
  });
}
