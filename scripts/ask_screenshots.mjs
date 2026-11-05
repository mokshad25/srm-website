// Saves Ask SRM screenshots to out/ from live API responses, never mocked text.
// Needs `npm run build` first, and the backend running with ingested documents
// on port 8000 (vite preview proxies /api to it).
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4175;
const BASE = `http://localhost:${PORT}`;
const ANSWERED = ['Which hostels are available?', 'What library facilities are available on campus?'];
// In scope, but too specific for the indexed pages. Tried until one comes back unverified.
const UNVERIFIED = [
  'What is the SRM campus laundry price per kilogram?',
  'What is the bus number from Tambaram to the SRM campus at 7 am?',
  'Which day does the SRM library book bank close in January?',
  'What is the phone number of the SRM hostel barber shop?',
];

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', detached: true });
const stop = () => { try { process.kill(-server.pid); } catch { /* already gone */ } };

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(`${BASE}/api/health`)).ok) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Preview server or backend did not start');
}

async function askUntil(page, questions, status) {
  for (const question of questions) {
    await page.goto(BASE);
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.waitForSelector('[data-ask-bar]');
    await page.fill('[data-ask-bar]', question);
    await page.keyboard.press('Enter');
    const turn = page.locator('[data-ask-turn]').last();
    await turn.locator('[data-ask-loading]').waitFor({ state: 'detached', timeout: 30_000 });
    const got = await turn.getAttribute('data-status');
    console.log(`${got}: ${question}`);
    if (got === status) return;
    // Pause so a run of retries stays under the API's rate limit.
    await page.waitForTimeout(2500);
  }
  throw new Error(`No question returned a live "${status}" response`);
}

const shot = (page, name) => page.screenshot({ path: `out/${name}.jpg`, type: 'jpeg', quality: 92 });

let failed = false;
try {
  await waitForServer();
  mkdirSync('out', { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(BASE);
  await page.waitForSelector('[data-ask-bar]');
  await page.evaluate(() => document.fonts.ready);
  await shot(page, 'ask-hero');
  await askUntil(page, ANSWERED, 'answered');
  await shot(page, 'ask-answered');
  await askUntil(page, UNVERIFIED, 'unverified');
  await shot(page, 'ask-unverified');
  await browser.close();
} catch (error) {
  failed = true;
  console.error(error.message);
} finally {
  stop();
}
process.exit(failed ? 1 : 0);
