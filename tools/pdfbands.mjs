import { chromium } from 'playwright';
const [,, outDir, ...specs] = process.argv; // spec: page:y0:y1 (fractions of page height)
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const s = 3.6;
for (const spec of specs) {
  const [p, y0, y1] = spec.split(':').map(Number);
  const page = await browser.newPage({ viewport: { width: Math.ceil(612 * s) + 20, height: Math.ceil(792 * s) + 20 } });
  await page.goto(`http://localhost:5173/_tmp_pdfview.html?p=${p}&s=${s}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__done, null, { timeout: 120000 });
  const H = 792 * s, W = 612 * s;
  const top = Math.floor(H * y0), bottom = Math.ceil(H * y1);
  const step = 430, overlap = 40;
  let i = 0;
  for (let y = top; y < bottom; y += step - overlap, i++) {
    const h = Math.min(step, bottom - y);
    if (h < 60) break;
    await page.screenshot({ path: `${outDir}/p${p}_band${i}.png`, clip: { x: 60, y, width: W - 120, height: h } });
  }
  console.log('page', p, 'bands', i);
  await page.close();
}
await browser.close();
