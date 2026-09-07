// tools/build-placards.mjs — assemble public/placards.json from the static placards and the
// per-car inventory. Run: node tools/build-placards.mjs
import { writeFileSync } from 'node:fs';
import { STATIC } from '../src/data/placards-static.js';
import { TUNNEL1, TUNNEL2, SOURCE } from '../src/data/inventory.js';

// Mirror of layout.js car placement (kept in plain numbers so this script has no three.js dependency).
const CAR_LEN = 12.8, SHORT = 12.8 - 9 * 0.3048;
const T1 = { axisX: 0, bumperZ: 109.1 - 2.4 };
const T2 = { axisX: 18.3, bumperZ: 57.9 + 514.5 - 2.4 };

function carPlacards(tunnel, list, T, boardOffsetX) {
  const out = [];
  let zEnd = T.bumperZ;
  for (const item of list) {
    const len = item.car === 'flat-short' ? SHORT : CAR_LEN;
    const zStart = zEnd - len;
    out.push({
      id: `car-${tunnel}-${item.pos}`,
      register: 'documented',
      pos: [T.axisX + boardOffsetX, 0, zStart + 1.2],
      face: boardOffsetX < 0 ? Math.PI / 2 : -Math.PI / 2,
      title: `Tunnel ${tunnel}, position ${item.pos} — ${item.title}`,
      body: item.body + (item.sketch ? ` Table 1 sketch: ${item.sketch}` : ''),
      source: SOURCE[item.sheet],
      car: { tunnel, pos: item.pos, placed: item.placed, carId: item.carId || null },
    });
    zEnd = zStart;
  }
  return out;
}

const placards = [
  ...STATIC,
  ...carPlacards(1, TUNNEL1, T1, -2.75),
  ...carPlacards(2, TUNNEL2, T2, -3.6),
];
writeFileSync(new URL('../public/placards.json', import.meta.url), JSON.stringify({
  generated: new Date().toISOString().slice(0, 10),
  registers: ['documented'],
  note: 'v1 ships the documented register only. Every entry traces to a line in canon.md.',
  placards,
}, null, 1));
console.log('wrote', placards.length, 'placards');
