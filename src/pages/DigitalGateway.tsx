import { useMemo, useState, type ReactNode } from 'react';
import Photo from '../components/Photo';
import Section, { Reveal } from '../components/Section';
import Tag from '../components/Tag';
import gateway from '../data/digitalGateway.json';

type Platform = (typeof gateway.platforms)[number];
const platforms = gateway.platforms as Platform[];
const categories = ['All Platforms', ...new Set(platforms.map((platform) => platform.category))];

function PlatformIcon({ kind }: { kind: string }) {
  const paths: Record<string, ReactNode> = {
    student: <><circle cx="12" cy="8" r="3" /><path d="M5 20c.7-3.1 2.8-5 7-5s6.3 1.9 7 5" /></>,
    academic: <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M6 11v5c2.8 2.5 9.2 2.5 12 0v-5M21 9v6" /></>,
    library: <><path d="M5 4v16M9 4v16M15 4v16M19 4v16M3 4h4M7 20h4M13 4h4M17 20h4" /></>,
    technical: <><path d="m12 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
    education: <><path d="M12 3v18M5 7h14M5 17h14M7 7v10M17 7v10" /></>,
  };
  return <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">{paths[kind]}</svg>;
}

function PlatformCard({ platform, compact = false }: { platform: Platform; compact?: boolean }) {
  return (
    <article className={`group flex min-w-0 flex-col overflow-hidden border border-ink/15 bg-white transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-royal hover:shadow-lg ${compact ? '' : ''}`}>
      {platform.imageSlot && <Photo slot={platform.imageSlot} reveal className="aspect-[16/7]" />}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center bg-ink text-amber"><PlatformIcon kind={platform.icon} /></div>
          <span aria-hidden className="text-22 text-ink/40 transition-colors group-hover:text-royal">↗</span>
        </div>
        <Tag className="mt-6 self-start">{platform.category}</Tag>
        <h3 className="mt-3 text-22 font-bold">{platform.name}</h3>
        <p className="mt-3 flex-1 text-17">{platform.description}</p>
        <a href={platform.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 self-start bg-royal px-5 py-3 text-14 font-bold text-off-white transition-colors hover:bg-ink">
          Visit Platform <span aria-hidden>↗</span>
        </a>
      </div>
    </article>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex min-w-0 items-center gap-3 border-2 border-ink bg-white px-4 py-3 text-14 font-semibold">
      <span aria-hidden className="text-22">⌕</span>
      <span className="sr-only">Search platforms and services</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} type="search" placeholder="What are you looking for? Search platforms and services..." className="min-w-0 flex-1 bg-transparent text-17 font-normal outline-none placeholder:text-ink/60" />
    </label>
  );
}

export default function DigitalGateway() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return platforms.filter((platform) => {
      const matchesCategory = category === categories[0] || platform.category === category;
      const searchable = `${platform.name} ${platform.category} ${platform.description} ${platform.keywords.join(' ')}`.toLowerCase();
      return matchesCategory && (!needle || searchable.includes(needle));
    });
  }, [category, query]);
  const featured = platforms.filter((platform) => platform.featured);
  const groups = categories.slice(1).map((entry) => ({ name: entry, items: filtered.filter((platform) => platform.category === entry) })).filter((group) => group.items.length);

  return (
    <div className="on-light bg-off-white text-ink">
      <section className="relative overflow-hidden border-b border-ink/10 bg-off-white px-6 pt-32 pb-14 text-ink md:px-14 md:pt-40 md:pb-24">
        <div aria-hidden className="pointer-events-none absolute -left-24 top-28 h-56 w-56 border-l border-t border-srm-blue/20 md:h-80 md:w-80" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-[46%] hidden h-40 w-px bg-amber/70 lg:block" />
        <div className="relative mx-auto grid max-w-[1328px] items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(460px,1.1fr)] lg:gap-20">
          <div className="relative z-10">
            <p className="eyebrow flex items-center gap-3 text-srm-blue"><span aria-hidden className="h-0.5 w-9 bg-amber" />SRMIST digital ecosystem</p>
            <h1 className="mt-6 max-w-[700px] font-sans text-52 font-bold leading-[1.02] tracking-[-0.04em] text-ink md:text-[clamp(3.25rem,5.8vw,5.5rem)]">Everything SRMIST, <span className="text-srm-blue">connected.</span></h1>
            <p className="mt-6 max-w-[600px] text-22 font-semibold leading-tight text-ink/80 md:text-32">One University. All Your Digital Destinations.</p>
            <p className="mt-5 max-w-[590px] text-17 text-ink/70 md:text-22">From academic resources to student services, discover and access the digital platforms that connect you to every part of SRMIST.</p>
            <div className="mt-9 max-w-[650px]"><SearchBox value={query} onChange={setQuery} /></div>
            <div className="mt-4 flex items-center gap-3 text-14 font-semibold text-ink/70">
              <span className="inline-flex h-9 min-w-9 items-center justify-center bg-amber px-2 text-ink">{platforms.length}</span>
              <span>official platforms, gathered in one place.</span>
            </div>
          </div>
          <div className="relative lg:pt-4">
            <div aria-hidden className="absolute -right-4 -top-4 h-20 w-20 border-r-4 border-t-4 border-amber md:-right-6 md:-top-6 md:h-28 md:w-28" />
            <div className="relative overflow-hidden border-8 border-white bg-white shadow-[0_20px_60px_rgba(5,14,43,0.16)]">
              <Photo slot="home.discover-5" eager className="aspect-[16/9] w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/85 px-4 py-3 text-off-white md:px-6">
                <span className="text-14 font-semibold uppercase tracking-[0.12em]">SRM Kattankulathur</span>
                <span aria-hidden className="text-amber">✦</span>
              </div>
            </div>
            <div aria-hidden className="absolute -bottom-5 -left-5 h-16 w-16 border-b-2 border-l-2 border-srm-blue/60 md:-bottom-8 md:-left-8 md:h-24 md:w-24" />
          </div>
        </div>
      </section>

      <Section id="featured-platforms" tone="paper" label="Start here" heading="The destinations students use most.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((platform) => <Reveal key={platform.id}><PlatformCard platform={platform} /></Reveal>)}
        </div>
      </Section>

      <Section id="platforms" tone="white" label="Complete platform directory" heading="Every digital destination, organised.">
        <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          {categories.map((entry) => <button key={entry} type="button" aria-pressed={category === entry} onClick={() => setCategory(entry)} className={`min-h-11 shrink-0 border-2 border-ink px-4 text-14 font-semibold transition-colors ${category === entry ? 'bg-ink text-off-white' : 'hover:bg-ink/10'}`}>{entry}</button>)}
        </div>
        <div className="mt-10">
          {query || category !== categories[0] ? (
            filtered.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((platform) => <Reveal key={platform.id}><PlatformCard platform={platform} compact /></Reveal>)}</div> : <EmptyState onClear={() => { setQuery(''); setCategory(categories[0]); }} />
          ) : groups.map((group) => (
            <div key={group.name} className="mb-14 last:mb-0">
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-ink/15 pb-4"><h3 className="font-display text-32 font-bold">{group.name}</h3><span className="text-14">{group.items.length} platforms</span></div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{group.items.map((platform) => <Reveal key={platform.id}><PlatformCard platform={platform} compact /></Reveal>)}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="new-to-srmist" tone="mist" label="A simple starting point" heading="New to SRMIST?">
        <p className="max-w-[620px] text-22">Just joined the university? Here&apos;s where to find what you need.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            ['Looking for student-related services?', 'SRM Student Portal', 'student-portal'],
            ['Need academic information?', 'Academia', 'academia'],
            ['Looking for books and digital resources?', 'Central Library or Knimbus Digital Library', 'central-library'],
            ['Need technical assistance?', 'IT Service Desk', 'it-service-desk'],
            ['Need to reset your university password?', 'Self Service Password Reset', 'ssp'],
            ['Looking for online education assistance?', 'Directorate of Online Education Support', 'online-education-support'],
          ].map(([question, answer, id]) => {
            const platform = platforms.find((entry) => entry.id === id)!;
            return <a key={question} href={platform.url} target="_blank" rel="noopener noreferrer" className="flex gap-4 border-t-4 border-amber bg-white p-5 transition-colors hover:bg-amber/20"><span className="font-display text-32 font-bold">↗</span><span><strong className="block text-17">{question}</strong><span className="mt-1 block text-17">Visit {answer}.</span></span></a>;
          })}
        </div>
      </Section>

      <Section id="quick-access" tone="ink" label="Quick access" heading="Your frequently needed destinations.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{platforms.map((platform) => <a key={platform.id} href={platform.url} target="_blank" rel="noopener noreferrer" className="flex min-h-16 items-center justify-between gap-3 border border-off-white/30 px-4 py-3 text-17 font-semibold transition-colors hover:border-amber hover:text-amber"><span>{platform.name}</span><span aria-hidden>↗</span></a>)}</div>
      </Section>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return <div className="border-t border-ink/15 py-10"><h3 className="text-22 font-bold">No platform found</h3><p className="mt-2 text-17">Try a different search term or return to all platforms.</p><button type="button" onClick={onClear} className="mt-5 underline underline-offset-4">Clear search and filters</button></div>;
}
