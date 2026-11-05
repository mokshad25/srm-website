// Checks the built site against the brief. Needs `npm run build` first.
import { spawn } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4174;
const BASE = `http://localhost:${PORT}`;
const ROUTES = ['/', '/engineering', '/medicine', '/learn-leap-lead', '/campus-explorer'];
const BANNED = ['sample', 'placeholder', 'to be supplied', '[', 'todo', 'lorem'];
const SCALE = [12, 14, 17, 22, 32, 52, 84];

const failures = [];
const pass = [];
const check = (name, ok, detail = '') => {
  (ok ? pass : failures).push(detail ? `${name}: ${detail}` : name);
};

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', detached: process.platform !== 'win32' });
const stop = () => {
  try {
    if (process.platform === 'win32') server.kill();
    else process.kill(-server.pid);
  } catch { /* gone */ }
};

const settle = (page) =>
  page.evaluate(async () => {
    await document.fonts.ready;
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 800));
  });

// Runs in the page: audits every visible text node.
const audit = () => {
  const parse = (c) => {
    const m = c.match(/[\d.]+/g).map(Number);
    return { r: m[0], g: m[1], b: m[2], a: m[3] ?? 1 };
  };
  const over = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const background = (el) => {
    const stack = [];
    for (let e = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c.a > 0) { stack.push(c); if (c.a === 1) break; }
    }
    return stack.reverse().reduce((b, f) => over(f, b), { r: 255, g: 255, b: 255, a: 1 });
  };
  const out = { sizes: new Set(), low: [], blue: [], small: [] };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    // The clear header sits on the hero photo, which this audit can't read.
    if (!n.textContent.trim() || el.closest('svg, script, style, .sr-only, option, header[data-header=clear].text-off-white')) continue;
    if (!el.getClientRects().length) continue;
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    out.sizes.add(size);
    if (size < 14) out.small.push(n.textContent.trim().slice(0, 30));
    const fg = parse(cs.color);
    let opacity = 1;
    for (let e = el; e; e = e.parentElement) opacity *= +getComputedStyle(e).opacity;
    const bg = background(el);
    const text = over({ ...fg, a: fg.a * opacity }, bg);
    const [a, b] = [lum(text), lum(bg)].sort((x, y) => y - x);
    const ratio = (a + 0.05) / (b + 0.05);
    const large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    if (ratio < (large ? 3 : 4.5)) out.low.push(`${n.textContent.trim().slice(0, 30)} (${ratio.toFixed(2)})`);
    if (cs.color === 'rgb(27, 63, 160)') out.blue.push(n.textContent.trim().slice(0, 30));
  }
  return { ...out, sizes: [...out.sizes] };
};

try {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(BASE)).ok) break; } catch { /* wait */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  const browser = await chromium.launch();

  // Data files must be clean too, so hidden states cannot leak banned words.
  for (const f of readdirSync('src/data')) {
    const walk = (v) => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(walk) : []);
    const hits = walk(JSON.parse(readFileSync(`src/data/${f}`, 'utf8'))).filter((s) => !s.startsWith('http') && BANNED.some((b) => s.toLowerCase().includes(b)));
    check(`data clean: ${f}`, hits.length === 0, hits.join(' | '));
  }

  for (const width of [1440, 1024, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(String(e)));
    for (const r of ROUTES) {
      await page.goto(BASE + r, { waitUntil: 'networkidle' });
      await settle(page);
      const tag = `${r} @${width}`;
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      check(`no sideways scroll ${tag}`, sw <= width, `${sw}px`);
      if (width !== 1440) continue;
      const text = (await page.evaluate(() => document.body.innerText)).toLowerCase();
      const found = BANNED.filter((b) => text.includes(b));
      check(`banned text ${tag}`, found.length === 0, found.join(', '));
      check(`spelling ${tag}`, !/\bprograms?\b/.test(text));
      const a = await page.evaluate(audit);
      check(`contrast 4.5:1 ${tag}`, a.low.length === 0, a.low.slice(0, 8).join(' | '));
      check(`no blue text ${tag}`, a.blue.length === 0, a.blue.slice(0, 5).join(' | '));
      check(`nothing under 14px ${tag}`, a.small.length === 0, a.small.slice(0, 5).join(' | '));
      // Home follows the recording's fluid headlines, by decision. See TODO.md.
      const off = a.sizes.filter((s) => !SCALE.includes(s));
      if (r !== '/') check(`type scale ${tag}`, off.length === 0, off.join(', '));
      const sem = await page.evaluate(() => ({
        h1: document.querySelectorAll('h1').length,
        noAlt: [...document.images].filter((i) => !i.alt).length,
        landmarks: ['header', 'nav', 'main', 'footer'].every((t) => document.querySelector(t)),
      }));
      check(`semantics ${tag}`, sem.h1 === 1 && sem.noAlt === 0 && sem.landmarks, JSON.stringify(sem));
    }
    check(`no console errors @${width}`, errors.length === 0, errors.slice(0, 3).join(' | '));
    await ctx.close();
  }

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  check('homepage cinematic campus section', (await page.locator('#campus').count()) === 1);
  check('campus CTA points to explorer', await page.getByRole('link', { name: /Explore Our Campus/ }).getAttribute('href') === '/campus-explorer');
  const photosData = JSON.parse(readFileSync('src/data/photos.json', 'utf8'));
  const unsourced = photosData.photos.filter((p) => p.source === 'stock' && !(p.url && p.licence));
  check('every stock photo has a source and licence', unsourced.length === 0, unsourced.map((p) => p.id).join(', '));
  const claims = photosData.photos.filter((p) => p.source === 'stock' && /srm/i.test(p.alt));
  check('no stock photo claims to be SRM', claims.length === 0);

  // Visible focus ring
  await page.waitForSelector('[data-preloader]', { state: 'detached' });
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const ring = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  check('keyboard focus ring', ring === 'solid', ring);

  // 1. Persona chips
  await page.click('[data-persona=graduate]');
  check('persona shows its sub-line', (await page.locator('[data-persona-sub]').count()) === 1);
  check('persona highlights programmes', (await page.locator('[data-highlight=true]').count()) === 4);
  check('highlighted programmes sort first', (await page.locator('[data-programme]').first().getAttribute('data-highlight')) === 'true');
  await page.click('[data-persona=graduate]');

  // 2. Programme finder
  await page.getByRole('button', { name: 'PG', exact: true }).click();
  check('UG/PG filter', (await page.locator('[data-programme]').count()) === 5);
  await page.locator('#programmes').getByRole('button', { name: 'All', exact: true }).click();
  await page.getByLabel('Search programmes').fill('mba');
  check('finder search', (await page.locator('[data-programme]').count()) === 1);
  await page.getByLabel('Search programmes').fill('');
  await page.locator('[data-programme=mbbs] > button').click();
  await page.locator('[data-programme=mbbs]').getByRole('button', { name: 'Compare' }).click();
  await page.locator('[data-programme=bba] > button').click();
  await page.locator('[data-programme=bba]').getByRole('button', { name: 'Compare' }).click();
  check('compare table', (await page.locator('[data-compare] th[scope=col]').count()) === 3);
  check('apply link in row', await page.locator('[data-programme=bba] a', { hasText: 'Apply' }).isVisible());

  // 3. Fee estimator
  const fees = JSON.parse(readFileSync('src/data/fees.json', 'utf8'));
  await page.getByLabel('Programme', { exact: true }).selectOption('mba');
  await page.getByLabel('Scholarship category', { exact: true }).selectOption('2');
  await page.getByLabel('Hostel', { exact: true }).selectOption('1');
  const want = fees.tuition.mba * (1 - fees.scholarships[2].pct / 100) + fees.hostels[1].amount;
  const got = Number((await page.locator('[data-fee-total]').innerText()).replace(/\D/g, ''));
  check('fee total is live and correct', got === want, `${got} vs ${want}`);

  // 7. Campus map
  const nearCampus = async (p) => {
    await p.goto(BASE + '/campus-explorer', { waitUntil: 'networkidle' });
    await p.locator('.campus-scene').scrollIntoViewIfNeeded();
    await p.waitForSelector('[data-marker=food]', { timeout: 15000 });
  };
  await nearCampus(page);
  check('map has 24 places', (await page.locator('[data-marker]').count()) === 24);
  check('map is SVG, not WebGL', (await page.locator('.campus-scene canvas').count()) === 0);
  check('map marked illustrative', (await page.locator('.campus-scene').innerText()).includes('Illustrative map'));
  await page.locator('[data-marker=lib]').click();
  await page.getByLabel('Jump to a place').selectOption('food');
  await page.waitForTimeout(600); // The previous card slides out.
  check('map card opens', (await page.locator('[data-card]').innerText()).includes('Food Court'));
  check('card offers 360 and directions', (await page.locator('[data-card]').getByText('Enter 360° view').count()) === 1 && (await page.locator('[data-card]').getByText('Directions').count()) === 1);
  check('route draws with a walk time', (await page.locator('[data-route]').count()) === 1 && /min walk/.test(await page.locator('[data-walk]').innerText()));
  check('selection dims other buildings', (await page.locator('[data-b][data-dim]').count()) === 23);
  check('explored count rises', (await page.locator('[data-explored-count]').innerText()).replace(/\s+/g, ' ').startsWith('2 of'));
  await page.keyboard.press('Escape');
  await page.locator('[data-filter=hostel]').click();
  check('filter dims other places', (await page.locator('[data-b][data-dim]').count()) === 21);
  await page.locator('[data-filter=all]').click();
  await page.getByRole('button', { name: 'Rotate right' }).click();
  await page.waitForTimeout(400);
  check('rotation keeps every marker', (await page.locator('[data-marker]').count()) === 24);
  await page.getByRole('button', { name: '2D' }).click();
  await page.waitForTimeout(400);
  check('2D view renders', (await page.locator('[data-b]').count()) === 24);
  await page.getByRole('button', { name: '3D' }).click();
  await page.waitForTimeout(400);
  await page.locator('[data-night-toggle]').click();
  check('night mode', (await page.locator('.campus-scene[data-night]').count()) === 1);
  await page.locator('[data-night-toggle]').click();
  const markerHits = await page.evaluate(() => {
    const rects = [...document.querySelectorAll('[data-marker] > span')].map((m) => ({ id: m.parentElement.dataset.marker, r: m.getBoundingClientRect() }));
    const hits = [];
    rects.forEach((a, i) => rects.slice(i + 1).forEach((b) => {
      if (a.r.left < b.r.right && b.r.left < a.r.right && a.r.top < b.r.bottom && b.r.top < a.r.bottom) hits.push(`${a.id}/${b.id}`);
    }));
    return hits;
  });
  check('map markers do not overlap', markerHits.length === 0, markerHits.join(', '));
  await page.reload({ waitUntil: 'networkidle' });
  await nearCampus(page);
  check('explored count survives reload', (await page.locator('[data-explored-count]').innerText()).replace(/\s+/g, ' ').startsWith('2 of'));
  await page.getByRole('button', { name: 'Reset progress' }).click();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await settle(page);

  // Real content blocks.
  check('recruiter marquee shows real names', (await page.locator('#recruiters').innerText()).includes('Infosys'));
  check('event countdown', (await page.locator('[data-countdown]').count()) === 1);
  check('stats keep their units on one line', await page.locator('#placements p', { hasText: 'LPA' }).first().evaluate((e) => e.getClientRects().length >= 1 && e.offsetHeight < 60));

  // 4. Live. Learn. Play. accordion
  const strip = (i) => page.locator(`[data-strip="${i}"]`).evaluate((e) => e.getBoundingClientRect().width);
  await page.locator('[data-strip="3"]').scrollIntoViewIfNeeded();
  await page.locator('[data-strip="3"]').hover();
  await page.waitForTimeout(600);
  check('accordion expands the hovered strip', (await strip(3)) > (await strip(0)) * 3);

  // 5. Departments picker
  await page.goto(BASE + '/engineering', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'I like coding' }).click();
  check('departments picker highlights', (await page.locator('[data-match=true]').count()) === 4);
  await page.getByRole('button', { name: 'I like health tech' }).click();
  check('departments picker updates', (await page.locator('[data-match=true]').count()) === 3);

  // 6. Body diagram
  await page.goto(BASE + '/medicine', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Skeletal system/ }).click();
  check('body list updates panel', await page.getByRole('heading', { name: 'Skeletal system', level: 3 }).isVisible());
  await page.locator('[data-system="2"] path').nth(1).click({ force: true });
  check('body SVG click updates panel', await page.getByRole('heading', { name: 'Respiratory system', level: 3 }).isVisible());

  await ctx.close();

  // Sticky horizontal tracks, with motion on.
  const motion = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const motionErrors = [];
  motion.on('pageerror', (e) => motionErrors.push(String(e)));
  motion.on('console', (m) => m.type() === 'error' && motionErrors.push(m.text()));
  await motion.goto(BASE + '/', { waitUntil: 'networkidle' });
  await motion.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const head = () => motion.locator('[data-header]').getAttribute('data-header');
  check('header hidden on the preloader', (await head()) === 'hidden');
  await motion.waitForSelector('[data-phase=reveal]');
  await motion.waitForTimeout(450);
  const flight = await motion.locator('[data-preloader] svg').evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a);
  check('reveal scales through the letters', flight > 1.5, String(flight));
  await motion.waitForSelector('[data-preloader]', { state: 'detached' });
  check('header clear over the hero', (await head()) === 'clear');
  check('preloader ends on the hero', await motion.locator('h1').isVisible());
  await motion.evaluate(() => window.scrollTo(0, 120));
  await motion.waitForTimeout(400);
  check('header solid after 80 px', (await head()) === 'solid');
  await motion.reload({ waitUntil: 'networkidle' });
  check('preloader plays once a session', (await motion.locator('[data-preloader]').count()) === 0);
  const homeTrack = await motion.evaluate(async () => {
    const s = document.getElementById('discover');
    window.scrollTo(0, s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) / 2);
    await new Promise((r) => setTimeout(r, 1000));
    return new DOMMatrix(getComputedStyle(s.querySelector('.w-max')).transform).m41;
  });
  check('Discover scrolls sideways', homeTrack < -500, String(homeTrack));
  check('no errors with motion on', motionErrors.length === 0, motionErrors.slice(0, 3).join(' | '));
  await motion.goto(BASE + '/engineering', { waitUntil: 'networkidle' });
  const moved = await motion.evaluate(async () => {
    const s = document.getElementById('disciplines');
    const track = s.querySelector('.w-max');
    const top = s.getBoundingClientRect().top + scrollY;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, top + (s.offsetHeight - innerHeight) / 2);
    await new Promise((r) => setTimeout(r, 1000));
    return { tall: s.offsetHeight > innerHeight * 2, x: new DOMMatrix(getComputedStyle(track).transform).m41 };
  });
  check('horizontal track scrolls sideways', moved.tall && moved.x < -300, JSON.stringify(moved));

  await browser.close();
} finally {
  stop();
}

console.log(`${pass.length} passed`);
if (failures.length) {
  console.error(`${failures.length} failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
