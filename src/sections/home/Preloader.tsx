import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import site from '../../data/site.json';
import { finishIntro, useIntroDone } from '../../lib/intro';
import { photoFor } from '../../lib/photos';

const COUNT = 1.5; // Seconds of counting, then REVEAL seconds of flight: about 2.4 s in all.
const REVEAL = 0.9;

/** Finds the R's upright by drawing it: serif letters have no fixed proportions to assume. */
function measureStem(size: number) {
  const px = 200;
  const c = document.createElement('canvas');
  c.width = px;
  c.height = px;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.font = `700 ${px * 0.8}px "Cormorant Garamond"`;
  g.textBaseline = 'alphabetic';
  g.fillText('R', 0, px * 0.8);
  const advance = g.measureText('R').width;
  const row = g.getImageData(0, Math.round(px * 0.65), px, 1).data;
  let start = -1;
  let end = -1;
  for (let x = 0; x < px; x++) {
    const ink = row[x * 4 + 3] > 128;
    if (ink && start < 0) start = x;
    if (!ink && start >= 0) { end = x; break; }
  }
  if (start < 0 || end < 0) return { at: 0.28, width: size * 0.09 };
  return { at: (start + end) / 2 / advance, width: ((end - start) / (px * 0.8)) * size };
}

/**
 * Off-white sheet with "SRM" cut out of it, over the campus photo. The sheet then
 * scales around the stem of the R until the letter is wider than the screen, so the
 * view flies through it. The photo sits exactly where the hero's does, so there is no cut.
 */
export default function Preloader() {
  const done = useIntroDone();
  const [gone, setGone] = useState(done);
  const root = useRef<HTMLDivElement>(null);
  const sheet = useRef<SVGSVGElement>(null);
  const word = useRef<SVGTextElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const photo = photoFor('home.hero');

  useEffect(() => {
    if (done) return;
    if (!photo) {
      finishIntro();
      setGone(true);
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const html = document.documentElement;
    if (!reduce) html.style.overflow = 'hidden';

    let alive = true;
    const end = () => {
      html.style.overflow = '';
      finishIntro();
      setGone(true);
    };

    const start = () => {
      if (!alive || !root.current || !sheet.current || !word.current) return;
      gsap.set(word.current, { opacity: 1 });

      if (reduce) {
        if (counter.current) counter.current.textContent = '100';
        gsap.set(bar.current, { scaleX: 1 });
        tl.current = gsap.timeline({ onComplete: end }).to(root.current, { opacity: 0, duration: 0.4, delay: 0.5 });
        return;
      }

      const r = word.current.getExtentOfChar(1);
      const size = parseFloat(getComputedStyle(word.current).fontSize);
      const stem = measureStem(size);
      const ox = r.x + r.width * stem.at;
      const oy = r.y + r.height / 2;
      const scale = (Math.max(ox, innerWidth - ox) / (stem.width / 2)) * 1.15;
      gsap.set(sheet.current, { transformOrigin: `${ox}px ${oy}px` });

      const n = { v: 0 };
      tl.current = gsap
        .timeline({ onComplete: end })
        .to(n, {
          v: 100,
          duration: COUNT,
          ease: 'power1.inOut',
          onUpdate: () => {
            if (counter.current) counter.current.textContent = String(Math.round(n.v));
            gsap.set(bar.current, { scaleX: n.v / 100 });
          },
        })
        .call(() => root.current?.setAttribute('data-phase', 'reveal'))
        .to(chrome.current, { opacity: 0, duration: 0.2 })
        .to(sheet.current, { scale, duration: REVEAL, ease: 'power3.in' }, '<')
        .call(finishIntro, undefined, '-=0.12')
        .to(root.current, { opacity: 0, duration: 0.22, ease: 'none' }, `-=${0.2}`);
    };

    // The letters are measured, so they have to be in Sora first. Don't hold up for a slow font.
    void Promise.race([document.fonts.load('700 100px "Cormorant Garamond"'), new Promise((r) => setTimeout(r, 400))]).then(start);

    const skip = () => tl.current?.timeScale(5);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && skip();
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchmove', skip, { passive: true });
    return () => {
      alive = false;
      tl.current?.kill();
      html.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchmove', skip);
    };
    // Runs once for the load; `done` turning true must not tear down the closing fade.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone || !photo) return null;

  return (
    <div ref={root} data-preloader aria-label="Loading" className="fixed inset-0 z-[60] overflow-hidden">
      <div aria-hidden className="absolute -inset-[3%]">
        <img src={photo.src} alt="" fetchPriority="high" className="h-full w-full object-cover object-[52%_60%]" />
      </div>
      <svg ref={sheet} aria-hidden width="100%" height="100%" className="absolute inset-0 overflow-visible">
        <defs>
          <mask id="srm-letters" maskUnits="userSpaceOnUse" x="-100%" y="-100%" width="300%" height="300%">
            <rect x="-100%" y="-100%" width="300%" height="300%" fill="#fff" />
            <text
              ref={word}
              x="50%"
              y="48%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#000"
              opacity={0}
              className="font-serif"
              style={{ fontSize: 'min(42vw, 72vh)', fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              SRM
            </text>
          </mask>
        </defs>
        <rect x="-100%" y="-100%" width="300%" height="300%" fill="var(--color-off-white)" mask="url(#srm-letters)" />
      </svg>
      <div ref={chrome} className="on-light absolute inset-0 text-ink">
        <button
          type="button"
          onClick={() => tl.current?.timeScale(5)}
          className="absolute top-6 right-6 min-h-11 px-3 text-14 font-semibold underline underline-offset-4 md:right-14"
        >
          Skip intro
        </button>
        <div className="absolute inset-x-6 bottom-8 md:inset-x-14">
          <div className="flex items-end justify-between gap-6">
            <p className="max-w-[46ch] text-14 tracking-[0.12em] uppercase">{site.institute} · Kattankulathur, Chennai</p>
            <p aria-hidden className="font-display text-32 font-bold tabular-nums">
              <span ref={counter}>0</span>
            </p>
          </div>
          <span aria-hidden className="mt-4 block h-0.5 bg-ink/15">
            <span ref={bar} className="block h-full origin-left scale-x-0 bg-royal" />
          </span>
        </div>
      </div>
    </div>
  );
}
