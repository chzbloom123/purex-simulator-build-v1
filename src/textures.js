// textures.js — procedural, license-free textures generated on a canvas at load time.
// Everything here is presentation: grain, gravel, corrugation. Dimensions come from canon.js.
import * as THREE from 'three';

function canvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

// Deterministic hash noise so the world looks the same every load.
function hash(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function smooth(t) { return t * t * (3 - 2 * t); }
function valueNoise(x, y, seed) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const a = hash(xi, yi, seed), b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed), d = hash(xi + 1, yi + 1, seed);
  const u = smooth(xf), v = smooth(yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, seed, octaves = 5, lac = 2.1, gain = 0.5) {
  let s = 0, amp = 1, f = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    s += amp * valueNoise(x * f, y * f, seed + i * 17);
    norm += amp; amp *= gain; f *= lac;
  }
  return s / norm;
}

function toTexture(c, repeatX = 1, repeatY = 1, colorSpace = THREE.SRGBColorSpace) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.colorSpace = colorSpace;
  t.anisotropy = 8;
  return t;
}

// Height field → tangent-space normal map.
function heightToNormal(heights, size, strength = 2) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const l = heights[y * size + ((x - 1 + size) % size)];
      const r = heights[y * size + ((x + 1) % size)];
      const u = heights[((y - 1 + size) % size) * size + x];
      const d = heights[((y + 1) % size) * size + x];
      const nx = (l - r) * strength, ny = (u - d) * strength, nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const i = (y * size + x) * 4;
      img.data[i] = 128 + 127 * nx / len;
      img.data[i + 1] = 128 + 127 * ny / len;
      img.data[i + 2] = 128 + 127 * nz / len;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// ---- Creosoted Douglas fir: near-black, oily, faint grain along the timber length (v axis).
export function makeTimberTextures(size = 512) {
  const c = canvas(size), ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const grain = fbm(x / 6, y / 90, 3, 4);        // stretched along y = along the timber
      const rings = 0.5 + 0.5 * Math.sin((x / size) * 60 + fbm(x / 40, y / 400, 9) * 6);
      const dirt = fbm(x / 70, y / 70, 21, 3);
      const v = 0.55 * grain + 0.25 * rings + 0.2 * dirt;
      heights[y * size + x] = v;
      const base = 22 + v * 34;                       // 22..56 — creosote black-brown
      const i = (y * size + x) * 4;
      img.data[i] = base * 1.15; img.data[i + 1] = base * 0.92; img.data[i + 2] = base * 0.72; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return {
    map: toTexture(c),
    normalMap: toTexture(heightToNormal(heights, size, 1.5), 1, 1, THREE.NoColorSpace),
  };
}

// ---- Bituminous-coated corrugated steel. Corrugations run along u (circumferential); repeated per meter of arc.
export function makeCorrugatedTextures(size = 512, pitchM = 6 * 0.0254, texMeters = 1.0) {
  const c = canvas(size), ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const heights = new Float32Array(size * size);
  const cyclesPerTex = texMeters / pitchM;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const corr = 0.5 + 0.5 * Math.sin((y / size) * Math.PI * 2 * cyclesPerTex); // y = along the arch
      const streak = fbm(x / 30, y / 300, 5, 4);
      const spots = fbm(x / 12, y / 12, 31, 3);
      heights[y * size + x] = corr * 0.96 + spots * 0.04;
      const shade = 14 + streak * 18 + spots * 8;     // black-grey bitumen with drips
      const i = (y * size + x) * 4;
      img.data[i] = shade; img.data[i + 1] = shade * 0.98; img.data[i + 2] = shade * 1.02; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return {
    map: toTexture(c),
    normalMap: toTexture(heightToNormal(heights, size, 3.5), 1, 1, THREE.NoColorSpace),
    roughnessMap: null,
  };
}

// ---- Gravel ballast.
export function makeGravelTextures(size = 512) {
  const c = canvas(size), ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const heights = new Float32Array(size * size);
  // Cellular-ish stones from jittered points
  const N = 96, pts = [];
  for (let i = 0; i < N * N; i++) {
    const gx = i % N, gy = Math.floor(i / N);
    pts.push([(gx + hash(gx, gy, 1)) * size / N, (gy + hash(gx, gy, 2)) * size / N, hash(gx, gy, 3)]);
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = Math.floor(x / (size / N)), gy = Math.floor(y / (size / N));
      let best = 1e9, second = 1e9, id = 0;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const cx = (gx + ox + N) % N, cy = (gy + oy + N) % N;
        const p = pts[cy * N + cx];
        let dx = p[0] - x, dy = p[1] - y;
        if (dx > size / 2) dx -= size; if (dx < -size / 2) dx += size;
        if (dy > size / 2) dy -= size; if (dy < -size / 2) dy += size;
        const d = dx * dx + dy * dy;
        if (d < best) { second = best; best = d; id = p[2]; } else if (d < second) second = d;
      }
      const edge = Math.sqrt(second) - Math.sqrt(best); // high in stone centers, 0 at cracks
      const stone = Math.min(1, edge / 2.5);
      const tone = 0.35 + 0.5 * id;
      heights[y * size + x] = stone * (0.6 + 0.4 * id);
      const dust = fbm(x / 50, y / 50, 44, 3);
      const base = (55 + tone * 75) * (0.5 + 0.5 * stone) * (0.85 + 0.3 * dust);
      const i = (y * size + x) * 4;
      img.data[i] = base * 1.03; img.data[i + 1] = base; img.data[i + 2] = base * 0.92; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return { map: toTexture(c), normalMap: toTexture(heightToNormal(heights, size, 3), 1, 1, THREE.NoColorSpace) };
}

// ---- Cast concrete with form lines.
export function makeConcreteTextures(size = 512) {
  const c = canvas(size), ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm(x / 40, y / 40, 61, 5);
      const pits = fbm(x / 6, y / 6, 71, 2) > 0.72 ? 0.3 : 0;
      const form = ((y % 128) < 2) ? 0.35 : 0;
      heights[y * size + x] = n * 0.4 - pits - form;
      const base = 105 + n * 55 - pits * 60 - form * 30;
      const i = (y * size + x) * 4;
      img.data[i] = base; img.data[i + 1] = base * 0.99; img.data[i + 2] = base * 0.95; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return { map: toTexture(c), normalMap: toTexture(heightToNormal(heights, size, 1.5), 1, 1, THREE.NoColorSpace) };
}

// ---- Weathered painted/rusted steel for cars and equipment.
export function makeSteelTextures(size = 512, tint = [0.55, 0.5, 0.46], rustAmount = 1.0) {
  const c = canvas(size), ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm(x / 60, y / 60, 81, 5);
      const rust = Math.max(0, fbm(x / 25, y / 25, 91, 4) - 0.55) * 2.2 * rustAmount;
      heights[y * size + x] = n * 0.2 + rust * 0.3;
      const base = 120 + n * 80;
      const i = (y * size + x) * 4;
      img.data[i] = base * tint[0] * (1 - rust) + 88 * rust;
      img.data[i + 1] = base * tint[1] * (1 - rust) + 48 * rust;
      img.data[i + 2] = base * tint[2] * (1 - rust) + 30 * rust;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return { map: toTexture(c), normalMap: toTexture(heightToNormal(heights, size, 1.2), 1, 1, THREE.NoColorSpace) };
}
