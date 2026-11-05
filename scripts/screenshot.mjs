// Saves a full-page JPG of every route to out/. Reduced motion is on so scroll
// reveals are settled and the horizontal tracks lay out as grids in one image.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4173;
const ROUTES = {
  home: '/',
  engineering: '/engineering',
  medicine: '/medicine',
  'learn-leap-lead': '/learn-leap-lead',
};
const width = Number(process.argv[2] ?? 1440);
const suffix = width === 1440 ? '' : `-${width}`;

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', detached: true });
const stop = () => { try { process.kill(-server.pid); } catch { /* already gone */ } };

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(`http://localhost:${PORT}/`)).ok) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Preview server did not start');
}

// The moving states, with motion on.
async function journey(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const save = async (name) => {
    await page.screenshot({ path: `out/${name}.jpg`, type: 'jpeg', quality: 92 });
    console.log(`out/${name}.jpg`);
  };
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForSelector('[data-phase=reveal]');
  await page.waitForTimeout(450);
  await save('preloader-transition');
  await page.waitForSelector('[data-preloader]', { state: 'detached' });
  await page.waitForTimeout(1400);
  await save('hero');
  await page.goto(`http://localhost:${PORT}/#campus`);
  await page.waitForSelector('[data-marker=lib]');
  await page.evaluate(() => {
    const f = document.querySelector('.campus-scene');
    window.scrollTo({ top: f.getBoundingClientRect().top + scrollY - 88, behavior: 'instant' });
  });
  await page.waitForTimeout(5000);
  await save('map-default');
  await page.locator('[data-marker=lib]').click();
  await page.waitForTimeout(1900);
  await save('map-selected-route');
  await page.locator('[data-night-toggle]').click();
  await page.waitForTimeout(900);
  await save('map-night');
  await page.close();
}

try {
  await waitForServer();
  mkdirSync('out', { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  for (const [name, path] of Object.entries(ROUTES)) {
    await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      // Scroll through once so lazy images load and reveals fire.
      for (let y = 0; y < document.body.scrollHeight; y += 300) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 90));
      }
      window.scrollTo(0, 0);
      await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `out/${name}${suffix}.jpg`, type: 'jpeg', quality: 92, fullPage: true });
    console.log(`out/${name}${suffix}.jpg`);
  }
  if (width === 1440) await journey(browser);
  await browser.close();
} finally {
  stop();
}
