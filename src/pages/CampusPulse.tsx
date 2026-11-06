import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Photo from '../components/Photo';
import { EventFacts, Empty, Filters, ItemPhoto, Provenance, published, ReadMore, useHeaderBottom, when } from '../components/pulse/PulseParts';
import Section, { Reveal } from '../components/Section';
import site from '../data/site.json';
import { byDate, byNewest, eventsSource, featuredItem, formatDate, loadPulse, pulseHref, search, usePulse, visible } from '../lib/pulse';
import type { PulseItem } from '../lib/pulse';

const ALL = 'All';
const ANNOUNCEMENT_TYPES = ['General', 'Academic', 'Admissions', 'Examination', 'Administrative', 'Campus Notices'];
const EVENT_TYPES = ['Technical Events', 'Workshops', 'Conferences', 'Cultural Festivals', 'Sports Events', 'Guest Lectures', 'Student Clubs'];
const SECTIONS = [['announcements', 'Announcements'], ['events', 'Events'], ['achievements', 'Achievements'], ['research-highlights', 'Research'], ['campus-highlights', 'Campus']];

const of = (items: PulseItem[], kind: PulseItem['kind']) => items.filter((item) => item.kind === kind);
const categories = (items: PulseItem[], known: string[] = []) => [ALL, ...new Set([...known, ...items.map((item) => item.category)])];
const pick = (items: PulseItem[], category: string) => (category === ALL ? items : items.filter((item) => item.category === category));

function Hero({ featured }: { featured?: PulseItem }) {
  return (
    <section className="grid gap-10 px-6 pt-28 pb-12 md:px-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end lg:pt-36 lg:pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
        <p className="eyebrow flex items-center gap-3"><span aria-hidden className="h-0.5 w-9 bg-royal" />SRMIST news and updates</p>
        <h1 className="mt-5 text-52 font-bold tracking-tight xl:text-84">Campus <em className="font-serif font-normal">Pulse</em></h1>
        <p className="mt-5 max-w-[60ch] text-17 md:text-22">
          Stay connected with everything happening at SRMIST. Discover events, achievements, research breakthroughs and the latest university updates.
        </p>
      </motion.div>
      <div className="relative">
        <Photo slot="pulse.hero" eager className="aspect-[16/9] lg:aspect-[3/2]" />
        {featured && (
          <article data-pulse-featured={featured.id} className="group relative -mt-16 ml-4 bg-ink p-5 text-off-white sm:ml-12 lg:absolute lg:right-0 lg:bottom-0 lg:left-12 lg:mt-0 lg:ml-0">
            <p className="flex flex-wrap items-center gap-2 text-12 font-semibold tracking-[0.1em] uppercase">Featured update <Provenance item={featured} /></p>
            <h2 className="mt-2 !text-22 leading-tight"><Link to={pulseHref(featured)} className="hover:underline">{featured.title}</Link></h2>
            <p className="mt-1 text-14">{when(featured)}</p>
          </article>
        )}
      </div>
    </section>
  );
}

function SectionBar({ query, onQuery }: { query: string; onQuery: (value: string) => void }) {
  const top = useHeaderBottom();
  return (
    <div data-pulse-bar style={{ top }} className="z-20 border-y border-ink/15 bg-off-white lg:sticky">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-6 py-2 md:px-14 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Campus Pulse sections" className="no-scrollbar -mx-6 flex gap-1 overflow-x-auto px-6 md:mx-0 md:px-0">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => onQuery('')} className="flex min-h-11 shrink-0 items-center px-3 text-14 font-semibold hover:underline">{label}</a>
          ))}
        </nav>
        <label className="flex items-center gap-2 lg:w-80">
          <span className="sr-only">Search Campus Pulse</span>
          <input
            type="search"
            data-pulse-search
            value={query}
            placeholder="Search Campus Pulse"
            onChange={(event) => onQuery(event.target.value)}
            className="min-h-11 w-full border-2 border-ink bg-white px-3 text-14 placeholder:text-ink/70"
          />
        </label>
      </div>
    </div>
  );
}

function Notice({ fallback }: { fallback: boolean }) {
  return (
    <div className="mx-6 mt-8 max-w-[1328px] border-l-4 border-amber bg-white p-4 text-14 md:mx-14 xl:mx-auto" data-pulse-notice>
      <p>
        <strong>Official</strong> entries come from the{' '}
        <a href={eventsSource.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">SRMIST events page</a>, as listed on {formatDate(eventsSource.checkedOn)}.{' '}
        <strong>Demonstration</strong> entries only show how this page works and are not real university updates.
      </p>
      {fallback && <p className="mt-2 font-semibold" role="status">The latest updates couldn't be loaded, so this is the saved copy.</p>}
    </div>
  );
}

function Card({ item, dark }: { item: PulseItem; dark?: boolean }) {
  return (
    <article data-pulse-item={item.id} className={`group flex h-full flex-col ${dark ? 'bg-ink/60 text-off-white' : 'bg-white'}`}>
      <ItemPhoto item={item} className="aspect-video" />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-2 text-12 font-semibold"><Provenance item={item} />{item.category}{item.type && ` · ${item.type}`}</div>
        <h3 className="text-22 leading-tight font-bold">{item.title}</h3>
        <p className="text-14">{item.summary}</p>
        <p className="mt-auto pt-2 text-12">{when(item)}</p>
        <ReadMore item={item} />
      </div>
    </article>
  );
}

function Announcements({ items }: { items: PulseItem[] }) {
  const [category, setCategory] = useState(ALL);
  const shown = byNewest(pick(items, category));
  const lead = shown.find((item) => item.featured);
  const rest = shown.filter((item) => item !== lead);
  return (
    <Section id="announcements" tone="paper" label="University notices" heading="Announcements">
      <Filters label="Filter announcements" options={categories(items, ANNOUNCEMENT_TYPES)} value={category} onChange={setCategory} />
      {!shown.length && <div className="mt-6"><Empty>No announcements in {category} right now.</Empty></div>}
      {lead && (
        <article data-pulse-item={lead.id} data-pulse-lead className="group mt-6 grid bg-ink text-off-white lg:grid-cols-2">
          <ItemPhoto item={lead} className="aspect-video h-full lg:aspect-auto" />
          <div className="flex flex-col gap-3 p-6 lg:p-10">
            <div className="flex flex-wrap items-center gap-2 text-12 font-semibold"><Provenance item={lead} />Featured · {lead.category}</div>
            <h3 className="text-32 leading-tight font-bold">{lead.title}</h3>
            <p className="text-17">{lead.summary}</p>
            <p className="text-12">{published(lead)}</p>
            <ReadMore item={lead} />
          </div>
        </article>
      )}
      {rest.length > 0 && <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rest.map((item) => <li key={item.id}><Card item={item} /></li>)}</ul>}
    </Section>
  );
}

function EventRow({ item }: { item: PulseItem }) {
  return (
    <article data-pulse-item={item.id} data-pulse-event className="grid gap-3 border-t border-ink/15 py-6 md:grid-cols-[220px_minmax(0,1fr)_auto] md:gap-8">
      <p className="font-display text-22 leading-tight font-bold">{item.event?.dateLabel}</p>
      <div>
        <div className="flex flex-wrap items-center gap-2 text-12 font-semibold"><Provenance item={item} />{item.category}</div>
        <h3 className="mt-2 text-22 leading-tight font-bold">{item.title}</h3>
        <p className="mt-2 text-14">{item.summary}</p>
        {item.event?.venue && <div className="mt-3"><EventFacts item={item} /></div>}
      </div>
      <div className="flex flex-wrap items-start gap-4 md:flex-col md:gap-0">
        <ReadMore item={item} label="Details" />
        {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-14 font-bold underline underline-offset-4">Official page</a>}
      </div>
    </article>
  );
}

function Events({ items }: { items: PulseItem[] }) {
  const [category, setCategory] = useState(ALL);
  const [order, setOrder] = useState<'soonest' | 'latest'>('soonest');
  const shown = byDate(pick(items, category), order);
  return (
    <Section id="events" tone="white" label="What's coming up" heading="Upcoming events">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <Filters label="Filter events" options={categories(items, EVENT_TYPES)} value={category} onChange={setCategory} />
        <label className="flex shrink-0 items-center gap-2 text-14 font-semibold">
          Sort by date
          <select data-pulse-sort value={order} onChange={(event) => setOrder(event.target.value as typeof order)} className="min-h-11 border-2 border-ink bg-white px-2 text-14">
            <option value="soonest">Soonest first</option>
            <option value="latest">Latest first</option>
          </select>
        </label>
      </div>
      <div className="mt-6">
        {shown.length ? <ul>{shown.map((item) => <li key={item.id}><EventRow item={item} /></li>)}</ul> : <Empty>No upcoming events in {category} right now.</Empty>}
      </div>
    </Section>
  );
}

function Achievements({ items }: { items: PulseItem[] }) {
  const [category, setCategory] = useState(ALL);
  const shown = byNewest(pick(items, category));
  return (
    <Section id="achievements" tone="night" label="Students at SRMIST" heading="Student achievements">
      <Filters label="Filter achievements" tone="dark" options={categories(items)} value={category} onChange={setCategory} />
      <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{shown.map((item) => <li key={item.id}><Card item={item} dark /></li>)}</ul>
    </Section>
  );
}

function Research({ items }: { items: PulseItem[] }) {
  const [category, setCategory] = useState(ALL);
  const shown = byNewest(pick(items, category));
  return (
    <Section id="research-highlights" tone="paper" label="Discovery" heading="Research highlights">
      <Filters label="Filter research by domain" options={categories(items)} value={category} onChange={setCategory} />
      <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{shown.map((item) => <li key={item.id}><Card item={item} /></li>)}</ul>
    </Section>
  );
}

function Highlights({ items }: { items: PulseItem[] }) {
  return (
    <Section id="campus-highlights" tone="ink" label="Around campus" heading="Campus highlights">
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <li key={item.id} className={i === 0 || i === 5 ? 'sm:col-span-2' : ''}>
            <Link to={pulseHref(item)} data-pulse-item={item.id} className="group relative block aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-72">
              <ItemPhoto item={item} className="absolute inset-0" />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1 p-4">
                <Provenance item={item} />
                <span className="text-22 leading-tight font-bold text-off-white">{item.title}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-14">{site.stockNote}</p>
    </Section>
  );
}

function Results({ items, query }: { items: PulseItem[]; query: string }) {
  return (
    <Section tone="paper" className="!py-10">
      <p role="status" data-pulse-count className="text-17 font-semibold">{items.length} {items.length === 1 ? 'result' : 'results'} for “{query.trim()}”</p>
      {items.length > 0
        ? <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <li key={item.id}><Card item={item} /></li>)}</ul>
        : <div className="mt-4"><Empty>Nothing matches that search. Try a broader word.</Empty></div>}
    </Section>
  );
}

export default function CampusPulse() {
  const { status, items, fallback } = usePulse();
  const [query, setQuery] = useState('');
  const shown = useMemo(() => visible(items), [items]);
  const searching = query.trim().length > 0;

  return (
    <div className="on-light bg-off-white text-ink">
      <Hero featured={featuredItem(items)} />
      <SectionBar query={query} onQuery={setQuery} />
      <Notice fallback={fallback} />
      {status === 'loading' && <div role="status" data-pulse-loading className="skeleton m-6 h-96 md:mx-14"><span className="sr-only">Loading Campus Pulse</span></div>}
      {status === 'error' && (
        <Reveal className="px-6 py-16 md:px-14">
          <p role="alert" className="text-22 font-bold">Campus Pulse couldn't be loaded.</p>
          <button type="button" data-pulse-retry onClick={() => void loadPulse()} className="mt-4 min-h-11 border-2 border-ink px-4 text-14 font-bold hover:bg-ink hover:text-off-white">Try again</button>
        </Reveal>
      )}
      {status === 'ready' && !shown.length && <div className="px-6 py-16 md:px-14"><Empty>There are no updates to show yet.</Empty></div>}
      {status === 'ready' && shown.length > 0 && (
        searching ? <Results items={search(shown, query)} query={query} /> : (
          <>
            <Announcements items={of(shown, 'announcement')} />
            <Events items={of(shown, 'event')} />
            <Achievements items={of(shown, 'achievement')} />
            <Research items={of(shown, 'research')} />
            <Highlights items={of(shown, 'highlight')} />
          </>
        )
      )}
      <div className="px-6 py-10 md:px-14"><Button href="/" variant="outline-dark">Back to homepage</Button></div>
    </div>
  );
}
