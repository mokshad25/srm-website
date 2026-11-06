import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIntroDone } from '../../lib/intro';
import { useHeaderBottom } from './PulseParts';
import { pulseHref, tickerItems, usePulse } from '../../lib/pulse';
import type { PulseItem } from '../../lib/pulse';

const SPEED = 56; // Pixels a second: quick enough to feel alive, slow enough to read.

function Headlines({ items, copy }: { items: PulseItem[]; copy: boolean }) {
  return (
    <ul aria-hidden={copy || undefined} className="flex shrink-0 items-center">
      {items.map((item) => (
        <li key={item.id} className="flex shrink-0 items-center">
          <Link
            to={pulseHref(item)}
            tabIndex={copy ? -1 : undefined}
            data-ticker-link={copy ? undefined : item.id}
            className="whitespace-nowrap px-4 py-1.5 text-14 font-medium text-off-white hover:text-amber hover:underline focus-visible:text-amber focus-visible:outline-offset-[-3px]"
          >
            {item.event && <span className="font-semibold text-amber">{item.event.dateLabel}: </span>}
            {item.headline ?? item.title}
          </Link>
          <span aria-hidden className="h-1 w-1 shrink-0 rotate-45 bg-amber/70" />
        </li>
      ))}
    </ul>
  );
}

/** Sits under the fixed header, wherever its height lands. It scrolls away with the top of the page. */
export default function PulseTicker() {
  const { items } = usePulse();
  const ready = useIntroDone();
  const reduce = !!useReducedMotion();
  const top = useHeaderBottom();
  const window_ = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const [repeat, setRepeat] = useState(1);
  const [time, setTime] = useState(60);
  const [keyboard, setKeyboard] = useState(false);
  const headlines = tickerItems(items);

  // Each half of the track has to fill the strip, or a gap would show before the loop.
  useEffect(() => {
    const box = window_.current;
    const set = group.current;
    if (!box || !set || !headlines.length) return;
    const measure = () => {
      const one = set.scrollWidth / repeat;
      if (!one) return;
      setRepeat(Math.max(1, Math.ceil(box.clientWidth / one)));
      setTime((one * Math.max(1, Math.ceil(box.clientWidth / one))) / SPEED);
    };
    const watch = new ResizeObserver(measure);
    watch.observe(box);
    measure();
    void document.fonts.ready.then(measure);
    return () => watch.disconnect();
  }, [headlines.length, repeat]);

  if (!ready || !headlines.length) return null;

  return (
    <section
      aria-label="Campus Pulse updates"
      data-pulse-ticker
      style={{ top }}
      className="absolute inset-x-0 z-20 flex h-[45px] items-stretch overflow-hidden border-b border-amber/30 bg-night text-off-white"
    >
      <Link
        to="/campus-pulse"
        data-ticker-label
        className="flex shrink-0 items-center bg-amber px-3 text-12 font-bold tracking-[0.1em] whitespace-nowrap text-ink uppercase transition-colors duration-200 hover:bg-off-white focus-visible:outline-offset-[-3px] focus-visible:outline-ink sm:px-5 sm:text-14"
      >
        Campus Pulse
      </Link>
      <div
        ref={window_}
        data-ticker-window
        data-keyboard={keyboard || undefined}
        onFocus={(event) => event.target.matches(':focus-visible') && setKeyboard(true)}
        onBlur={(event) => {
          if (event.currentTarget.contains(event.relatedTarget)) return;
          setKeyboard(false);
          event.currentTarget.scrollLeft = 0;
        }}
        className={`pulse-window no-scrollbar min-w-0 flex-1 ${reduce ? 'overflow-x-auto' : 'overflow-hidden'}`}
      >
        <div
          data-ticker-track
          style={{ '--ticker-time': `${time}s` } as CSSProperties}
          className={`flex h-full w-max items-center ${reduce ? '' : 'pulse-track'}`}
        >
          <div ref={group} className="flex shrink-0">
            {Array.from({ length: repeat }, (_, i) => <Headlines key={i} items={headlines} copy={i > 0} />)}
          </div>
          {!reduce && (
            <div className="flex shrink-0">
              {Array.from({ length: repeat }, (_, i) => <Headlines key={i} items={headlines} copy />)}
            </div>
          )}
        </div>
      </div>
      <Link
        to="/campus-pulse"
        data-ticker-all
        aria-label="View all updates"
        className="flex shrink-0 items-center gap-2 border-l border-off-white/20 px-3 text-14 font-semibold whitespace-nowrap transition-colors duration-200 hover:bg-off-white hover:text-ink focus-visible:outline-offset-[-3px] sm:px-5"
      >
        <span className="hidden sm:inline">View All Updates</span>
        <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
