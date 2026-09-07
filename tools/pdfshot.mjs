import { chromium } from 'playwright';
const [,, outDir, ...pages] = process.argv;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
for (const p of pages) {
  const page = await browser.newPage({ viewport: { width: 1700, height: 2200 } });
  page.on('pageerror', (e) => console.log('ERR', e.message));
  await page.goto(`http://localhost:5173/_tmp_pdfview.html?p=${p}&s=2.2`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__done, null, { timeout: 120000 });
  const n = await page.evaluate(() => window.__pages);
  await page.locator('#cv').screenshot({ path: `${outDir}/permit_p${p}.png` });
  console.log('page', p, 'of', n);
  await page.close();
}
await browser.close();
