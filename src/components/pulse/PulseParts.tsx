import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Photo from '../Photo';
import { photoFor } from '../../lib/photos';
import { eventsSource, formatDate, pulseHref } from '../../lib/pulse';
import type { PulseItem } from '../../lib/pulse';

/** The fixed header's height, which changes with the screen and the text-size control. */
export function useHeaderBottom() {
  const [bottom, setBottom] = useState(0);
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('[data-header]');
    if (!header) return;
    const measure = () => setBottom(header.offsetHeight);
    const watch = new ResizeObserver(measure);
    watch.observe(header);
    measure();
    return () => watch.disconnect();
  }, []);
  return bottom;
}

/** Says what an entry is, on every entry, so a demonstration can't pass as news. */
export function Provenance({ item }: { item: PulseItem }) {
  return item.verified ? (
    <span data-provenance="official" className="inline-block bg-teal px-2 py-0.5 text-12 font-bold text-ink">Official</span>
  ) : (
    <span data-provenance="demo" className="inline-block bg-amber px-2 py-0.5 text-12 font-bold text-ink">Demonstration</span>
  );
}

export function Filters({ label, options, value, onChange, tone = 'light' }: {
  label: string;
  options: string[];
  value: string;
  onChange: (option: string) => void;
  tone?: 'light' | 'dark';
}) {
  const edge = tone === 'light' ? 'border-ink' : 'border-off-white';
  const on = tone === 'light' ? 'bg-ink text-off-white' : 'bg-off-white text-ink';
  const off = tone === 'light' ? 'hover:bg-ink/10' : 'hover:bg-off-white/15';
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          data-filter-option={option}
          onClick={() => onChange(option)}
          className={`min-h-11 border-2 px-3 text-14 font-semibold transition-colors duration-200 ${edge} ${value === option ? on : off}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export const Empty = ({ children }: { children: ReactNode }) => (
  <p role="status" data-pulse-empty className="border-l-4 border-amber py-3 pl-4 text-17">{children}</p>
);

export const ReadMore = ({ item, label = 'Read more' }: { item: PulseItem; label?: string }) => (
  <Link to={pulseHref(item)} className="inline-flex min-h-11 items-center gap-2 text-14 font-bold underline underline-offset-4 hover:no-underline">
    {label}<span className="sr-only">: {item.title}</span> <span aria-hidden>→</span>
  </Link>
);

export function ItemPhoto({ item, className }: { item: PulseItem; className: string }) {
  if (!item.image || !photoFor(item.image)) return null;
  return (
    <span className={`block overflow-hidden ${className}`}>
      <Photo slot={item.image} className="transition-transform duration-500 group-hover:scale-[1.03]" />
    </span>
  );
}

export const when = (item: PulseItem) =>
  item.event ? item.event.dateLabel : formatDate(item.publishedAt);

export const published = (item: PulseItem) =>
  item.event && item.verified ? `Listed ${formatDate(eventsSource.checkedOn)}` : `Published ${formatDate(item.publishedAt)}`;

/** The fields an event has. A real listing shows only what its source actually gave. */
export function EventFacts({ item }: { item: PulseItem }) {
  const { event } = item;
  if (!event) return null;
  const facts = [['Date', event.dateLabel], ['Time', event.time], ['Venue', event.venue], ['Organiser', event.department]].filter((fact) => fact[1]);
  return (
    <dl className="grid gap-x-6 gap-y-1 text-14 sm:grid-cols-[auto_1fr]">
      {facts.map(([term, detail]) => (
        <div key={term} className="contents">
          <dt className="font-semibold">{term}</dt>
          <dd>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}
