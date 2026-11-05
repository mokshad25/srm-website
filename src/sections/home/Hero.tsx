import { useRef, useSyncExternalStore, type PointerEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import AskBar from '../../components/ask/AskBar';
import Button from '../../components/Button';
import Photo from '../../components/Photo';
import campus from '../../data/campus.json';
import home from '../../data/home.json';
import site from '../../data/site.json';
import { useExplored } from '../../lib/explored';
import { useIntroDone } from '../../lib/intro';

const ease = [0.22, 1, 0.36, 1] as const;

// The pin only exists on desktop. Phones scroll the hero normally, so its copy must not fade.
const DESKTOP = '(min-width: 1024px)';
const watchDesktop = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

function Line({ children, ready, delay }: { children: string; ready: boolean; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={{ y: '110%' }}
        animate={{ y: ready ? 0 : '110%' }}
        transition={{ duration: 0.8, ease, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function ExploredCard() {
  const { explored } = useExplored();
  const total = campus.places.length;
  return (
    <Link
      to="/#campus"
      data-hero-explored
      className="group block w-full border border-ink/15 bg-off-white p-4 text-ink transition-colors duration-200 hover:border-ink lg:w-72"
    >
      <span className="block text-17 font-semibold">{explored.length} of {total} places explored</span>
      <span aria-hidden className="mt-3 block h-1 bg-ink/15">
        <span className="block h-full origin-left bg-royal transition-transform duration-500" style={{ transform: `scaleX(${explored.length / total})` }} />
      </span>
      <span className="mt-3 block text-14 font-medium underline underline-offset-4">Open the campus map</span>
    </Link>
  );
}

export default function Hero() {
  const wrap = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const ready = useIntroDone();
  const desktop = useSyncExternalStore(watchDesktop, () => window.matchMedia(DESKTOP).matches);
  const h = home.hero;

  // Pinned for 100vh; the rest of the page rises over it (see Home.tsx).
  const { scrollYProgress: p } = useScroll({ target: wrap, offset: ['start start', 'end end'] });
  const textY = useTransform(p, [0, 1], [0, -240]);
  const textO = useTransform(p, [0.3, 0.8], [1, 0]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 60, damping: 20 });
  const y = useSpring(my, { stiffness: 60, damping: 20 });
  const onMove = (e: PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse') return;
    mx.set((e.clientX / window.innerWidth - 0.5) * -14);
    my.set((e.clientY / window.innerHeight - 0.5) * -10);
  };

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: ready ? 1 : 0, y: ready ? 0 : 16 },
    transition: { duration: 0.6, ease, delay },
  });

  return (
    <section id="hero" ref={wrap} onPointerMove={onMove} className="relative bg-night text-off-white motion-safe:lg:h-[200svh]">
      <div className="relative flex min-h-svh flex-col justify-end overflow-hidden lg:sticky lg:top-0 lg:h-svh lg:justify-center">
        <motion.div style={reduce ? undefined : { x, y }} className="absolute -inset-[3%]">
          <Photo slot="home.hero" eager className={`object-[52%_60%] ${ready ? 'ken-burns' : ''}`} />
        </motion.div>
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-night/45"
        />
        <motion.div
          style={reduce || !desktop ? undefined : { y: textY, opacity: textO }}
          className="relative max-w-[816px] px-6 pt-48 pb-10 md:px-14 lg:py-24 [text-shadow:0_1px_12px_rgb(6_15_36/0.45)]"
        >
          <motion.p {...rise(0.05)} className="flex items-center gap-3 text-14 font-medium tracking-[0.12em] uppercase">
            <span aria-hidden className="h-0.5 w-9 bg-amber" />
            {h.eyebrow}
          </motion.p>
          <h1 className="mt-7 font-display text-[clamp(3.25rem,min(7.6vw,14vh),7rem)] leading-[1]">
            <Line ready={ready} delay={0.1}>Find your place</Line>
            <Line ready={ready} delay={0.2}>at SRM.</Line>
          </h1>
          <motion.p {...rise(0.3)} className="mt-7 max-w-[720px] text-22">{h.sub}</motion.p>
          <motion.div {...rise(0.38)} className="mt-7 [text-shadow:none]"><AskBar /></motion.div>
          <motion.div {...rise(0.46)} className="mt-7 flex flex-wrap gap-3 [text-shadow:none]">
            <Button href="/#campus" variant="royal">Explore Campus</Button>
            <Button href={site.applyUrl}>Apply Now</Button>
          </motion.div>
          <motion.div {...rise(0.54)} className="mt-7 lg:hidden"><ExploredCard /></motion.div>
        </motion.div>
        <motion.div {...rise(0.6)} className="absolute right-14 bottom-10 hidden lg:block"><ExploredCard /></motion.div>
        <motion.a
          {...rise(0.66)}
          href="#placements"
          className="absolute bottom-10 left-14 hidden items-center gap-3 text-14 font-semibold lg:flex [@media(max-height:800px)]:!hidden"
        >
          <span aria-hidden className="block h-10 w-0.5 overflow-hidden bg-off-white/30">
            <span className="block h-full w-0.5 bg-amber" style={{ animation: 'scroll-cue 1.8s ease-in-out infinite' }} />
          </span>
          Scroll
        </motion.a>
      </div>
    </section>
  );
}
