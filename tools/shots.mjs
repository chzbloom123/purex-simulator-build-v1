// tools/shots.mjs — headless screenshot pass using the system Edge/Chrome via Playwright.
// Usage: node tools/shots.mjs [outDir] [spot ...]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve(process.argv[2] || 'shots');
mkdirSync(out, { recursive: true });
const only = process.argv.slice(3);

// [name, jump key or [x,z], yaw, pitch]
const SPOTS = [
  ['01-approach', 'approach', Math.PI, 0],
  ['02-turnout', [0, -30], Math.PI - 0.5, 0.05],
  ['03-t1-door-outside', 'door-t1', Math.PI, 0.1],
  ['04-t1-inside-looking-south', 't1-inside', Math.PI, 0.05],
  ['05-t1-inside-looking-north', [-1.9, 3], 0, 0.15],
  ['06-t1-mid', [-2.1, 50], Math.PI, 0.05],
  ['07-t1-south-ha-column', 't1-south', Math.PI, 0.05],
  ['08-t1-ceiling', [0.0, 20], Math.PI, 0.9],
  ['09-t2-door-outside', 'door-t2', Math.PI, 0.1],
  ['10-t2-empty-arch', 't2-inside', Math.PI, 0.05],
  ['11-t2-arch-up', [18.3, 90], Math.PI, 0.7],
  ['12-t2-first-cars', 't2-cars', Math.PI, 0.05],
  ['13-t2-tank-car-side', [18.3 - 4.2, 225], Math.PI + 0.8, 0.1],
  ['14-t2-dissolver', 'car-2-7', Math.PI, 0.1],
  ['15-t2-south-bumper', 't2-south', Math.PI, 0.05],
  ['16-t2-ledge-walk', [18.3 + 4.4, 300], Math.PI, 0.0],
  ['17-inspection-fly', ['fly', 18.3 - 3.2, 236, 5.5], Math.PI - 0.5, -0.45],
  ['18-t2-rib-closeup', [18.3 + 3.6, 120], Math.PI + 1.1, 0.55],
  ['19-t2-wale-closeup', ['fly', 18.3 + 2.0, 121, 4.2], Math.PI + 1.3, 0.35],
  ['20-t2-crown-closeup', ['fly', 18.3, 122, 6.0], Math.PI, 0.9],
  ['21-t1-door-face-inside', [-1.2, 4.5], 0.35, 0.25],
];

const browser = await chromium.launch({
  channel: 'msedge', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('console:', m.text()); });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__sim, null, { timeout: 60000 });
await page.screenshot({ path: `${out}/00-entry.png` });
await page.click('#enter');
await page.waitForTimeout(500);

for (const [name, where, yaw, pitch] of SPOTS) {
  if (only.length && !only.some((o) => name.includes(o))) continue;
  await page.evaluate(([where, yaw, pitch]) => {
    const s = window.__sim;
    s.player.fly = false;
    if (typeof where === 'string') {
      if (s.jumps[where]) s.jumps[where]();
      else { const [, t, p] = where.split('-'); const c = s.world.cars.find((x) => x.tunnel === +t && x.pos === +p); s.player.setPosition(c.axisX + (t === '1' ? -2.1 : -2.6), c.zStart - 2.5, Math.PI); }
    } else if (where[0] === 'fly') {
      s.player.fly = true; s.player.pos.set(where[1], where[3], where[2]);
    } else {
      s.player.setPosition(where[0], where[1], Math.PI);
    }
    s.look(yaw, pitch);
  }, [where, yaw, pitch]);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log('shot', name);
}
const info = await page.evaluate(() => ({ calls: window.__sim.renderer.info.render.calls, tris: window.__sim.renderer.info.render.triangles, mem: window.__sim.renderer.info.memory }));
console.log(JSON.stringify(info));
await browser.close();
