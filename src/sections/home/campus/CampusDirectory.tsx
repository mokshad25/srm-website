import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import { directory, inFilter, places } from './scene';

const glyphs: Record<string, ReactNode> = {
  all: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.25" /></>,
  academic: <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 11.5V16c1.4 1.3 3 2 5 2s3.6-.7 5-2v-4.5" /></>,
  research: <><path d="M10 3h4M11 3v6l-5.4 9.2A1.2 1.2 0 0 0 6.6 20h10.8a1.2 1.2 0 0 0 1-1.8L13 9V3" /><path d="M8.5 14h7" /></>,
  hostel: <><path d="M3 18V7M3 14h18v4M21 14v-1.5A3.5 3.5 0 0 0 17.5 9H11v5" /><circle cx="7" cy="11" r="1.5" /></>,
  sports: <><circle cx="12" cy="12" r="8.5" /><path d="M5 6.5c3 2 4.5 5.8 3.8 11M19 6.5c-3 2-4.5 5.8-3.8 11" /></>,
  green: <><path d="M4 6h16v9H9l-4 3.5V15H4V6Z" /><path d="M8.5 10.5h7" /></>,
  library: <><path d="M12 6.5C10.3 5 8 4.5 4 4.5v13c4 0 6.3.5 8 2 1.7-1.5 4-2 8-2v-13c-4 0-6.3.5-8 2Z" /><path d="M12 6.5v13" /></>,
  dining: <><path d="M7 3v18M4.5 3v5A2.5 2.5 0 0 0 7 10.5 2.5 2.5 0 0 0 9.5 8V3" /><path d="M17 21v-7h-2.5V7.5C14.5 5 15.7 3 17 3v11" /></>,
  other: <><circle cx="6" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" /></>,
};

const Glyph = ({ id }: { id: string }) => (
  <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    {glyphs[id]}
  </svg>
);

const ring = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber';

interface Props {
  filter: string;
  selected: string | null;
  onFilter: (id: string) => void;
  onPlace: (id: string) => void;
  onHover: (id: string | null) => void;
}

/** A floating directory over the map's filter and selection. It holds no campus data or state of its own. */
export default function CampusDirectory({ filter, selected, onFilter, onPlace, onHover }: Props) {
  const strip = useRef<HTMLUListElement>(null);
  const active = directory.find((group) => group.id === filter || group.cats.includes(filter));
  const shown = filter === 'all' ? [] : places.filter((place) => inFilter(place.cat, filter));

  // On the sideways strip, the chosen category slides into view. A plain scrollIntoView would move the page too.
  useEffect(() => {
    const list = strip.current;
    const chip = list?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (list && chip && list.scrollWidth > list.clientWidth) list.scrollTo({ left: chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
  }, [filter]);

  const rows = (compact: boolean) => shown.map((place) => (
    <li key={place.id} className={compact ? 'shrink-0' : ''}>
      <button
        type="button"
        data-directory-place={place.id}
        aria-pressed={selected === place.id}
        onClick={() => onPlace(place.id)}
        onPointerEnter={() => onHover(place.id)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(place.id)}
        onBlur={() => onHover(null)}
        className={compact
          ? `min-h-11 rounded-full border px-3 text-14 whitespace-nowrap transition-colors duration-200 ${ring} ${selected === place.id ? 'border-off-white bg-off-white font-semibold text-ink' : 'border-off-white/25 text-off-white'}`
          : `flex min-h-9 w-full items-center gap-2 rounded-lg py-1 pr-2 pl-3 text-left text-14 transition-colors duration-200 ${ring} ${selected === place.id ? 'bg-off-white font-semibold text-ink' : 'text-off-white/85 hover:bg-off-white/10 hover:text-off-white'}`}
      >
        {!compact && <span className="w-5 shrink-0 text-right text-12 tabular-nums opacity-70">{place.n}</span>}
        <span className="min-w-0">{place.name}</span>
      </button>
    </li>
  ));

  const category = (id: string, label: string, count: number, on: boolean) => (
    <li key={id} className="max-xl:shrink-0">
      <button
        type="button"
        data-directory={id}
        aria-pressed={on}
        onClick={() => onFilter(on && id !== 'all' ? 'all' : id)}
        className={`group relative flex min-h-11 w-full items-center gap-2.5 rounded-full px-3 text-left text-14 font-medium whitespace-nowrap transition-colors duration-200 xl:min-h-10 xl:rounded-lg ${ring} ${on ? 'text-amber max-xl:bg-amber max-xl:text-ink' : 'text-off-white/85 hover:text-off-white'}`}
      >
        {on && <motion.span layoutId="directory-active" aria-hidden className="absolute inset-0 rounded-lg border border-amber/40 bg-amber/10 max-xl:hidden" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
        <span className="relative flex items-center gap-2.5"><Glyph id={id} />{label}</span>
        <span className={`relative ml-auto text-12 tabular-nums ${on ? '' : 'opacity-60'}`}>{count}</span>
      </button>
      <AnimatePresence initial={false}>
        {on && id !== 'all' && (
          <motion.ul
            aria-label={`Places in ${label}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden max-xl:hidden"
          >
            <div className="grid gap-0.5 py-1">{rows(false)}</div>
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );

  return (
    <motion.nav
      aria-label="Campus directory"
      data-campus-nav
      data-lenis-prevent
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-[73px] z-20 border-b border-amber/25 bg-ink/90 text-off-white backdrop-blur-md md:top-[77px] lg:top-[81px] xl:absolute xl:top-20 xl:left-14 xl:max-h-[calc(100%-13rem)] xl:w-[248px] xl:overflow-y-auto xl:overscroll-contain xl:rounded-2xl xl:border xl:shadow-xl"
    >
      <div className="px-4 pt-4 pb-2 max-xl:hidden">
        <p className="text-12 font-semibold tracking-[0.14em] text-amber/90 uppercase">Find your way</p>
        <h2 className="mt-0.5 font-display !text-22 leading-tight">Campus Directory</h2>
      </div>
      <ul ref={strip} className="no-scrollbar relative flex gap-1.5 overflow-x-auto px-3 py-1.5 xl:grid xl:gap-0.5 xl:overflow-visible xl:px-2 xl:pt-0 xl:pb-2">
        {category('all', 'All locations', places.length, filter === 'all')}
        {directory.map((group) => category(group.id, group.t, places.filter((place) => inFilter(place.cat, group.id)).length, active?.id === group.id))}
      </ul>
      {shown.length > 0 && (
        <ul aria-label={`Places in ${active?.t ?? 'this category'}`} className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pb-1.5 xl:hidden">
          {rows(true)}
        </ul>
      )}
    </motion.nav>
  );
}
