// Blocks driven by JSON. Each renders nothing while its file is empty.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Photo from '../../components/Photo';
import Section from '../../components/Section';
import Tag from '../../components/Tag';
import home from '../../data/home.json';
import locations from '../../data/locations.json';
import news from '../../data/news.json';
import recruiters from '../../data/recruiters.json';
import testimonials from '../../data/testimonials.json';
import site from '../../data/site.json';
import { photoFor } from '../../lib/photos';

interface Testimonial { name: string; programme: string; quote: string; video?: string; slot?: string }
interface NewsItem { title: string; category: string; start: string; date: string; href: string }
interface Location { name: string; lat: number; lon: number }

function VideoCard({ t, onOpen }: { t: Testimonial; onOpen: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <article className="bg-ink text-off-white">
      {t.video ? (
        <button
          type="button"
          data-cursor="Play"
          aria-label={`Play video from ${t.name}`}
          onClick={onOpen}
          onPointerEnter={() => void ref.current?.play().catch(() => {})}
          onPointerLeave={() => ref.current?.pause()}
          className="block w-full"
        >
          <video ref={ref} muted loop playsInline preload="none" className="aspect-video w-full object-cover"><source src={t.video} /></video>
        </button>
      ) : t.slot ? (
        <Photo slot={t.slot} reveal className="aspect-video" />
      ) : null}
      <div className="p-6">
        <p className="text-17">“{t.quote}”</p>
        <p className="mt-3 text-14 font-semibold">{t.name} · {t.programme}</p>
      </div>
    </article>
  );
}

export function Testimonials() {
  const items = testimonials as Testimonial[];
  const [playing, setPlaying] = useState<Testimonial | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (playing) dialog.current?.showModal();
  }, [playing]);
  if (!items.length) return null;
  return (
    <Section id="stories" label="Student testimonials" heading="In their own words">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((t) => <VideoCard key={t.name} t={t} onOpen={() => setPlaying(t)} />)}
      </div>
      {/* A native dialog: Esc closes it and focus returns on its own. */}
      <dialog ref={dialog} onClose={() => setPlaying(null)} aria-label={playing ? `Video from ${playing.name}` : undefined} className="m-auto w-[min(960px,92vw)] bg-ink backdrop:bg-ink/80">
        {playing && <video controls autoPlay className="w-full"><source src={playing.video} /></video>}
        <form method="dialog" className="p-3 text-right"><button className="min-h-11 px-4 text-14 font-semibold text-off-white underline">Close</button></form>
      </dialog>
    </Section>
  );
}

function Countdown({ item }: { item: NewsItem }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, new Date(`${item.start}T00:00:00+05:30`).getTime() - now);
  const days = Math.floor(left / 86400000);
  const hours = Math.floor((left % 86400000) / 3600000);
  return (
    <p data-countdown className="mt-4 text-17">
      <span className="font-display text-32 font-bold tabular-nums">{days}</span> days{' '}
      <span className="font-display text-32 font-bold tabular-nums">{hours}</span> hours to go
    </p>
  );
}

export function NewsEvents() {
  const [cat, setCat] = useState('All');
  const items = (news as NewsItem[]).filter((n) => new Date(`${n.start}T23:59:59+05:30`).getTime() >= Date.now());
  if (!items.length) return null;
  const cats = ['All', ...new Set(items.map((n) => n.category))];
  const shown = items.filter((n) => cat === 'All' || n.category === cat).slice(0, 5);
  return (
    <Section id="news" tone="paper" label="What's happening right now" heading="News and events">
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={`min-h-11 border-2 border-ink px-4 text-14 font-semibold transition-colors duration-200 ${cat === c ? 'bg-ink text-off-white' : 'hover:bg-ink/10'}`}>{c}</button>
        ))}
      </div>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((n, i) => (
            <motion.li
              key={n.title}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className={`bg-white p-6 ${i === 0 ? 'md:col-span-2 md:row-span-2 md:flex md:flex-col md:justify-end md:bg-ink md:text-off-white' : ''}`}
            >
              <Tag className="self-start">{n.category}</Tag>
              <a href={n.href} className={`mt-3 block font-bold hover:underline ${i === 0 ? 'text-32' : 'text-22'}`}>{n.title}</a>
              <p className="mt-2 text-14">{n.date}</p>
              {i === 0 && <Countdown item={n} />}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Section>
  );
}

export function Recruiters() {
  const { names, source } = recruiters;
  const row = (hidden: boolean) => names.map((n) => (
    <li key={`${n}${hidden}`} aria-hidden={hidden || undefined} className={`px-8 font-display text-32 font-bold whitespace-nowrap ${hidden ? 'motion-reduce:hidden' : ''}`}>{n}</li>
  ));
  return (
    <section id="recruiters" aria-label="Recruiters" className="on-light bg-off-white py-[72px] text-ink lg:py-[120px]">
      <p className="eyebrow px-6 md:px-14">Who recruits at SRM</p>
      <div className="marquee-box mt-8 overflow-hidden motion-reduce:overflow-visible">
        <ul className="marquee flex w-max motion-reduce:w-auto motion-reduce:flex-wrap">
          {row(false)}
          {row(true)}
        </ul>
      </div>
      <p className="mt-8 px-6 text-14 md:px-14">Names from <a href={source} className="underline underline-offset-2">SRM's Career Centre</a>.</p>
    </section>
  );
}

/* Coarse land mask, 72 columns by 28 rows (5° per cell, 80N to 60S). */
const LAND = [
  '........................................................................',
  '.........#####....#######..........####.......##########################',
  '...#############...####............#######.##############################',
  '...###############..##.............#####################################.',
  '.....#############..................########################..####.......',
  '.......###########................##########################..##........',
  '.......##########.................#########################.............',
  '.........#######...................##..###################..#............',
  '.........#####.....................##########.##########.................',
  '..........###.....................#############.#####.###................',
  '...........###....................############..##...##..................',
  '............###...................#############..#...###.................',
  '..............####.................#####.#####.......###.##..............',
  '...............#######.................######........#####...............',
  '...............########................#####..........##.##..............',
  '................#########..............#####............######...........',
  '................#########..............######............#####...........',
  '.................#######................#####.##..........##.............',
  '.................######.................####.##.........########........',
  '.................#####..................###..#...........#########.......',
  '.................####...................##...............#########.......',
  '.................###........................................#######......',
  '.................##...........................................###....#...',
  '.................##..................................................##..',
  '.................#......................................................',
  '........................................................................',
  '.................#......................................................',
  '........................................................................',
];

export function WorldMap() {
  const items = locations as Location[];
  if (!items.length) return null;
  const x = (lon: number) => ((lon + 180) / 5) * 12;
  const y = (lat: number) => ((80 - lat) / 5) * 12;
  return (
    <Section id="world" tone="ink" label="SRM around the world" heading="Campuses and partners">
      <svg viewBox="0 0 864 336" role="img" aria-label="Dotted world map with SRM locations" className="h-auto w-full">
        {LAND.flatMap((row, r) =>
          [...row].map((c, k) => (c === '#' ? <circle key={`${r}-${k}`} cx={k * 12 + 6} cy={r * 12 + 6} r={3} fill="var(--color-off-white)" fillOpacity=".3" /> : null)),
        )}
        {items.map((l) => (
          <circle key={l.name} cx={x(l.lon)} cy={y(l.lat)} r={6} fill="var(--color-amber)"><title>{l.name}</title></circle>
        ))}
      </svg>
      <ul className="mt-6 grid gap-2 text-14 md:grid-cols-4">
        {items.map((l) => <li key={l.name}>{l.name}</li>)}
      </ul>
    </Section>
  );
}

export function LiveLearnPlay() {
  const strips = home.life.filter((s) => photoFor(s.slot));
  const [active, setActive] = useState(0);
  if (strips.length < 2) return null;
  return (
    <Section id="life" tone="night" label="Campus life" heading={<>Live. Learn. <em>Play.</em></>}>
      <div className="flex h-[420px] gap-1 md:h-[560px] md:gap-2">
        {strips.map((s, i) => (
          <button
            key={s.slot}
            type="button"
            aria-pressed={active === i}
            data-strip={i}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            style={{ flexGrow: active === i ? 5 : 1, transition: 'flex-grow 600ms cubic-bezier(0.22, 1, 0.36, 1)' }}
            className="relative min-w-0 flex-1 overflow-hidden text-left"
          >
            <Photo slot={s.slot} className="absolute inset-0" />
            <span className="absolute inset-x-0 bottom-0 bg-ink/80 p-3 text-17 font-bold whitespace-nowrap text-off-white">{s.t}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-14">{site.stockNote}</p>
    </Section>
  );
}
