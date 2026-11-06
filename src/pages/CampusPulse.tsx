import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Photo from '../components/Photo';
import Section from '../components/Section';
import Tag from '../components/Tag';
import { pulseItems, type PulseItem, type PulseKind, upcomingPulseEvents } from '../lib/campusPulse';

const kinds: { id: 'all' | PulseKind; label: string }[] = [
  { id: 'all', label: 'All updates' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'event', label: 'Events' },
  { id: 'achievement', label: 'Achievements' },
  { id: 'research', label: 'Research' },
  { id: 'campus', label: 'Campus highlights' },
];

function EmptyState({ label }: { label: string }) {
  return <p className="border-t border-ink/15 py-8 text-17 text-ink/70">No verified {label.toLowerCase()} are currently published. Check back for updates.</p>;
}

function PulseCard({ item, detailed = false }: { item: PulseItem; detailed?: boolean }) {
  return (
    <article id={item.id} className="flex min-w-0 flex-col overflow-hidden border border-ink/15 bg-white">
      {item.imageSlot && <Photo slot={item.imageSlot} reveal className="aspect-[16/9]" />}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tag>{item.category}</Tag>
          {item.date && <time className="text-14 text-ink/70">{item.date}</time>}
        </div>
        <h3 className="mt-4 text-22 font-bold leading-tight">{item.title}</h3>
        <p className="mt-3 text-17">{item.description}</p>
        {detailed && (
          <dl className="mt-4 grid gap-1 border-t border-ink/15 pt-4 text-14">
            {item.time && <div><dt className="inline font-semibold">Time: </dt><dd className="inline">{item.time}</dd></div>}
            {item.venue && <div><dt className="inline font-semibold">Venue: </dt><dd className="inline">{item.venue}</dd></div>}
            {item.organiser && <div><dt className="inline font-semibold">Organiser: </dt><dd className="inline">{item.organiser}</dd></div>}
          </dl>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
          {item.href && <a href={item.href} target="_blank" rel="noreferrer" className="text-14 font-bold underline underline-offset-4">Read more ↗</a>}
          <span className="text-12 text-ink/60">Source: {item.source}</span>
        </div>
      </div>
    </article>
  );
}

function ContentSection({ kind, title, intro }: { kind: PulseKind; title: string; intro: string }) {
  const items = pulseItems(kind);
  const id = kind === 'research' ? 'research-highlights' : kind === 'campus' ? 'campus-highlights' : `${kind}s`;
  return (
    <Section id={id} tone={kind === 'campus' ? 'paper' : 'white'} label={title} heading={intro}>
      {items.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => <PulseCard key={item.id} item={item} />)}</div>
      ) : <EmptyState label={title} />}
    </Section>
  );
}

export default function CampusPulse() {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | PulseKind>('all');
  const [sortNewest, setSortNewest] = useState(false);
  const events = upcomingPulseEvents();
  const featured = pulseItems().find((item) => item.featured) ?? events[0];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = pulseItems().filter((item) => (kind === 'all' || item.kind === kind) && (!q || `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(q)));
    return [...result].sort((a, b) => sortNewest ? (b.start ?? '').localeCompare(a.start ?? '') : (a.start ?? '').localeCompare(b.start ?? ''));
  }, [kind, query, sortNewest]);

  return (
    <div className="on-light bg-off-white text-ink">
      <section className="relative overflow-hidden bg-night px-6 pt-32 pb-16 text-off-white md:px-14 md:pt-40 md:pb-24">
        <div className="mx-auto grid max-w-[1328px] gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="eyebrow flex items-center gap-3"><span aria-hidden className="h-0.5 w-9 bg-amber" />SRMIST information hub</p>
            <h1 className="mt-6 max-w-[800px] font-display text-6xl font-extrabold leading-none tracking-tight md:text-8xl">Campus <em className="font-serif font-normal text-amber">Pulse.</em></h1>
            <p className="mt-7 max-w-[660px] text-17 md:text-22">Stay connected with everything happening at SRMIST. Discover events, achievements, research breakthroughs and the latest university updates.</p>
          </div>
          {featured && (
            <div className="border-l-4 border-amber bg-off-white p-6 text-ink">
              <p className="eyebrow">Featured update</p>
              <h2 className="mt-3 text-32 font-bold">{featured.title}</h2>
              <p className="mt-3 text-17">{featured.description}</p>
              <Link to={`#${featured.id}`} className="mt-5 inline-block text-14 font-bold underline underline-offset-4">Explore this update ↓</Link>
            </div>
          )}
        </div>
      </section>

      <Section id="announcements" tone="paper" label="01 · Announcements" heading="What the university wants you to know.">
        <div className="flex flex-wrap gap-2">
          {kinds.map((entry) => <button key={entry.id} type="button" onClick={() => setKind(entry.id)} className={`min-h-11 border-2 border-ink px-4 text-14 font-semibold ${kind === entry.id ? 'bg-ink text-off-white' : 'hover:bg-ink/10'}`}>{entry.label}</button>)}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="flex min-w-0 items-center gap-3 text-14 font-semibold">Search updates
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 border border-ink bg-white px-3 py-2 text-17 font-normal" />
          </label>
          <label className="flex items-center gap-2 text-14 font-semibold"><input type="checkbox" checked={sortNewest} onChange={(event) => setSortNewest(event.target.checked)} /> Newest first</label>
        </div>
        <div className="mt-8">
          {filtered.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((item) => <PulseCard key={item.id} item={item} detailed />)}</div> : <EmptyState label="updates" />}
        </div>
      </Section>

      <Section id="events" tone="white" label="02 · Upcoming events" heading="Make room for what is next.">
        {events.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{events.map((item) => <PulseCard key={item.id} item={item} detailed />)}</div> : <EmptyState label="events" />}
      </Section>
      <ContentSection kind="achievement" title="03 · Student achievements" intro="Ideas, effort and excellence worth celebrating." />
      <ContentSection kind="research" title="04 · Research highlights" intro="Knowledge that moves the world forward." />
      <ContentSection kind="campus" title="05 · Campus highlights" intro="The people and places that make SRMIST feel like home." />
    </div>
  );
}
