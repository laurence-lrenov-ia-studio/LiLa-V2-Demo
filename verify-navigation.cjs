const { chromium } = require('playwright');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = __dirname;
const captures = path.resolve(root, '..', 'validation', 'demo-navigation-20261118');
fs.mkdirSync(captures, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const filename = path.resolve(root, '.' + pathname);
  if (!filename.startsWith(root + path.sep)) return res.writeHead(404).end();
  try { res.setHeader('Content-Type', mime[path.extname(filename)] || 'text/plain'); res.end(fs.readFileSync(filename)); }
  catch { res.writeHead(404).end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const base = `http://127.0.0.1:${server.address().port}/`;
    for (const [width, height] of [[320, 568], [390, 844], [430, 932], [768, 1024], [1440, 900]]) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      const errors = [], missing = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(base)) missing.push(response.url()); });
      await page.goto(base + '#/');
      await page.waitForFunction(() => document.querySelector('#view')?.dataset.route === '');
      await page.screenshot({ path: path.join(captures, `accueil-${width}x${height}.png`) });
      const dims = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, width: innerWidth, height: innerHeight, mobile: getComputedStyle(document.querySelector('.mobile-home')).display, desktop: getComputedStyle(document.querySelector('.desktop-home')).display }));
      assert.ok(dims.scrollWidth <= width, `${width}: horizontal overflow ${JSON.stringify(dims)}`);
      if (width <= 600) {
        assert.ok(dims.scrollHeight <= height, `${width}: vertical overflow ${JSON.stringify(dims)}`);
        assert.notEqual(dims.mobile, 'none');
        assert.equal(dims.desktop, 'none');
        assert.equal(await page.locator('.mobile-home-primary a').count(), 4);
        assert.equal(await page.locator('.mobile-home-secondary a').count(), 4);
        assert.equal(await page.locator('#quick-add').isVisible(), true);
        for (const route of ['hub', 'biens', 'recherches', 'crm', 'notes', 'taches', 'reseaux-pros', 'formations']) assert.equal(await page.locator(`.mobile-home a[href="#/${route}"]`).count(), 1);
      } else {
        assert.equal(dims.mobile, 'none');
        assert.notEqual(dims.desktop, 'none');
        assert.ok(await page.locator('.hero img, .hero-photo img').count() > 0);
      }
      assert.equal(errors.length, 0, `${width}: ${errors.join('; ')}`);
      assert.equal(missing.length, 0, `${width}: missing ${missing.join(', ')}`);
      if (width === 390 || width === 768) {
        await page.locator('#menu-toggle').click();
        assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'true');
        assert.equal(await page.locator('#sidebar-scrim').isVisible(), true);
        assert.equal(await page.locator('#navigation a').count(), 10);
        await page.locator('#navigation a[href="#/reseaux-pros"]').click();
        await page.waitForFunction(() => document.querySelector('#view')?.dataset.route === 'reseaux-pros');
        await page.waitForTimeout(300);
        assert.equal(await page.locator('#sidebar-scrim').isVisible(), false);
        assert.match(await page.locator('main').textContent(), /Li\.La Hub/);
        assert.equal(await page.getByRole('link', { name: 'Accéder à mon espace réseau' }).count(), 1);
        if (width === 390) await page.screenshot({ path: path.join(captures, 'reseaux-mobile.png'), fullPage: true });
      }
      if (width === 1440) {
        assert.equal(await page.locator('.sidebar').isVisible(), true);
        assert.equal(await page.locator('#navigation a').count(), 10);
        await page.locator('#sidebar-collapse').click();
        assert.equal(await page.locator('body').evaluate(el => el.classList.contains('sidebar-collapsed')), true);
        assert.equal(await page.locator('#navigation a[href="#/hub"]').getAttribute('title'), 'Hub Immobilier');
        await page.setViewportSize({ width: 390, height: 844 });
        await page.locator('#menu-toggle').click();
        assert.equal(await page.locator('#navigation a[href="#/hub"]').isVisible(), true);
        assert.notEqual(await page.locator('#navigation a[href="#/hub"] span').first().evaluate(el => getComputedStyle(el).display), 'none');
        await page.locator('#sidebar-scrim').click({ position: { x: 385, y: 400 } });
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.locator('#sidebar-collapse').click();
        await page.goto(base + '#/reseaux-pros');
        await page.waitForFunction(() => document.querySelector('#view')?.dataset.route === 'reseaux-pros');
        await page.screenshot({ path: path.join(captures, 'reseaux-ordinateur.png'), fullPage: true });
        await page.goto(base + '#/formations');
        await page.waitForFunction(() => document.querySelector('#view')?.dataset.route === 'formations');
        assert.equal(await page.locator('.training-card').count(), 3);
        await page.screenshot({ path: path.join(captures, 'formations-ordinateur.png'), fullPage: true });
      }
      await page.close();
      console.log(`OK ${width}x${height} ${JSON.stringify(dims)}`);
    }
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
