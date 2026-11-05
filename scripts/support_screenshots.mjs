// Saves support chat and emergency screenshots to out/ from live API responses, never mocked text.
// Needs `npm run build` first, and the backend running with ingested documents
// on port 8000 (vite preview proxies /api to it).
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4176;
const BASE = `http://localhost:${PORT}`;
const REAL = [
  ['How do I apply for 2026-27?', null],
  ['Which hostels are available?', null],
  ['What is the fee for B.Tech CSE?', null],
  ['Who is the prime minister?', null],
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

const shot = (page, name) => page.screenshot({ path: `out/${name}.jpg`, type: 'jpeg', quality: 92 });

async function newPage(browser, viewport, touch = false) {
  const context = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch, reducedMotion: 'reduce' });
  await context.addInitScript(() => sessionStorage.setItem('srm-intro-seen', '1'));
  return context.newPage();
}

async function askLive(page, question) {
  await page.fill('[data-ask-input]', question);
  await page.press('[data-ask-input]', 'Enter');
  const turn = page.locator('[data-ask-turn]').last();
  await turn.locator('[data-ask-loading]').waitFor({ state: 'detached', timeout: 40_000 });
  await page.waitForTimeout(300);
  return turn;
}

let failed = false;
try {
  await waitForServer();
  mkdirSync('out', { recursive: true });
  const browser = await chromium.launch();

  const page = await newPage(browser, { width: 1440, height: 900 });
  await page.goto(`${BASE}/engineering`);
  await page.waitForSelector('[data-chat-greeting]', { timeout: 9000 });
  await shot(page, 'support-launcher');

  await page.click('[data-chat-launcher]');
  await page.waitForSelector('[data-ask-empty]');
  await shot(page, 'support-welcome');

  for (const item of REAL) {
    // A fresh session each time, so no question inherits context from the one before.
    if (await page.locator('[data-ask-turn]').count()) {
      await page.click('[data-chat-menu]');
      await page.getByRole('menuitem', { name: 'Start new chat' }).click();
    }
    const turn = await askLive(page, item[0]);
    const status = await turn.getAttribute('data-status');
    const sources = await turn.locator('[data-ask-sources] a').count();
    const text = (await turn.innerText()).replace(/\s+/g, ' ').slice(0, 420);
    console.log(`${item[0]}\n  status: ${status}, sources: ${sources}\n  ${text}`);
    await turn.locator('[data-ask-sources], [data-chat-followups]').last().scrollIntoViewIfNeeded();
    if (status === 'answered' && sources > 0 && !item[1]) { await shot(page, 'support-answered'); item[1] = 'shot'; }
    if (status === 'unverified') await shot(page, 'support-unverified');
    await page.waitForTimeout(4000); // Stays under the free LLM tier's per-minute limit.
  }

  const sheet = await newPage(browser, { width: 1440, height: 900 });
  await sheet.goto(`${BASE}/engineering`);
  await sheet.click('header [data-emergency-button]');
  await sheet.waitForSelector('[data-emergency-sheet][open]');
  await sheet.waitForTimeout(300);
  await shot(sheet, 'support-emergency-desktop');

  const phone = await newPage(browser, { width: 390, height: 844 }, true);
  await phone.goto(`${BASE}/engineering`);
  await phone.click('header [data-emergency-button]');
  await phone.waitForSelector('[data-emergency-sheet][open]');
  await phone.waitForTimeout(300);
  await shot(phone, 'support-emergency-mobile');

  await browser.close();
} catch (error) {
  failed = true;
  console.error(error.message);
} finally {
  stop();
}
process.exit(failed ? 1 : 0);
