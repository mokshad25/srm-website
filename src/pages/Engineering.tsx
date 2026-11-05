import { useMemo, useState } from 'react';
import Button from '../components/Button';
import HorizontalScroll from '../components/HorizontalScroll';
import PageHero from '../components/PageHero';
import PhotoPanel from '../components/PhotoPanel';
import Section, { Reveal } from '../components/Section';
import Stat from '../components/Stat';
import data from '../data/engineering.json';
import site from '../data/site.json';
import { CentreDiagram, Gears } from '../sections/engineering/Diagrams';

function Glance() {
  const g = data.glance;
  return (
    <Section label={g.label}>
      <div className="grid gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-32 font-bold tracking-tight md:text-52">
            Engineers who solve for the <em className="font-serif font-normal">world.</em>
          </h2>
          <p className="mt-8 text-22 font-normal">{g.body}</p>
          <p className="mt-6 text-17">{g.attribution}</p>
        </Reveal>
        <Reveal className="grid grid-cols-2 gap-x-8 gap-y-10 border-t-4 border-ink pt-8">
          {g.stats.map((s) => (
            <div key={s.label} className="border-b border-ink/15 pb-8">
              <Stat {...s} />
            </div>
          ))}
        </Reveal>
      </div>
      <Reveal className="mt-16 grid md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-ink p-8 text-off-white">
          <p className="font-serif text-32 italic">IDEAL</p>
          <p className="mt-3 text-17">{g.ideal}</p>
        </div>
        {g.paths.map((p) => (
          <div key={p.n} className="border-l border-ink/15 bg-ink/5 p-8">
            <p className="eyebrow">{p.n}</p>
            <h3 className="mt-3 text-22 font-bold">{p.t}</h3>
            <p className="mt-2 text-17">{p.d}</p>
          </div>
        ))}
      </Reveal>
    </Section>
  );
}

function Disciplines() {
  return (
    <HorizontalScroll id="disciplines">
      <div className="flex flex-col justify-center p-6 md:p-14">
        <p className="eyebrow">02 · Disciplines</p>
        <h2 className="mt-6 text-52 font-extrabold tracking-tight">Find your field. Shape the future.</h2>
        <p className="mt-6 text-22">Six ways into 22 departments.</p>
        <p className="mt-3 text-14">{site.stockNote}</p>
      </div>
      {data.disciplines.map((d, i) => (
        <PhotoPanel key={d.n} slot={`engineering.disc-${i + 1}`} href={d.href}>
          <span className="text-84 font-extrabold">{d.n}</span>
          <div>
            <span className="eyebrow block">{d.dept}</span>
            <h3 className="mt-4 text-32 font-bold tracking-tight">{d.t}</h3>
            <span className="mt-4 block text-17">{d.desc}</span>
          </div>
        </PhotoPanel>
      ))}
    </HorizontalScroll>
  );
}

function Research() {
  const [i, setI] = useState(0);
  const c = data.centres[i];
  return (
    <Section
      id="research"
      tone="ink"
      grid
      label="03 · Research & centres of excellence"
      heading="Knowledge is made here."
      intro="FET is committed to creating knowledge through research across all disciplines. Students willing to put in the work get advanced labs, equipment and research-oriented faculty and scholars working on real problems."
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <ul>
          {data.centres.map((x, k) => (
            <li key={x.n} className="border-b border-off-white/20">
              <button
                type="button"
                aria-pressed={k === i}
                onClick={() => setI(k)}
                onMouseEnter={() => setI(k)}
                className={`flex w-full items-baseline gap-4 py-4 text-left text-22 ${k === i ? 'font-bold underline decoration-amber decoration-2 underline-offset-8' : ''}`}
              >
                <span className="text-14">{x.n}</span>
                {x.t}
              </button>
            </li>
          ))}
        </ul>
        <div className="border border-off-white/20 p-8">
          <p className="eyebrow">Fig. {c.n} · {c.fig}</p>
          <div className="my-6">
            <CentreDiagram name={c.diagram} title={c.fig} />
          </div>
          <h3 className="text-22 font-bold">{c.t}</h3>
          <p className="mt-2 text-17">{c.d}</p>
          <a href={c.href} className="mt-4 inline-block text-17 font-semibold underline">Visit the centre →</a>
        </div>
      </div>
    </Section>
  );
}

function Departments() {
  const [like, setLike] = useState<string | null>(null);
  const [tab, setTab] = useState<0 | 1>(0);
  const [q, setQ] = useState('');
  const likes = data.likes as Record<string, string[]>;
  const hl = useMemo(() => (like ? likes[like] : []), [like, likes]);
  const list = tab === 0 ? data.departments : data.centresList;
  const ql = q.trim().toLowerCase();
  let rows = list.filter((r) => !ql || r.t.toLowerCase().includes(ql));
  if (tab === 0 && hl.length) rows = [...rows].sort((a, b) => Number(hl.includes(b.t)) - Number(hl.includes(a.t)));

  return (
    <Section
      id="departments"
      label="04 · Departments & centres"
      heading={<>7 Schools. 22 Departments. One <em className="font-serif font-normal">campus.</em></>}
      intro="Each school is headed by a Dean and groups departments by domain expertise."
    >
      <p className="text-22 font-bold">Not sure where you fit? Pick what you like.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {Object.keys(likes).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={like === k}
            onClick={() => { setLike(like === k ? null : k); setTab(0); }}
            className={`border-2 border-ink px-4 py-2 text-17 font-semibold ${like === k ? 'bg-ink text-off-white' : 'hover:bg-ink/10'}`}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-b border-ink/15">
        <div role="tablist" aria-label="Directory" className="flex gap-6">
          {[`Departments (${data.departments.length})`, `Centres of Excellence (${data.centresList.length})`].map((t, k) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k as 0 | 1)}
              className={`border-b-4 pb-3 text-17 font-semibold ${tab === k ? 'border-amber' : 'border-transparent'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <label className="mb-3 flex items-center gap-3 text-14 font-semibold">
          Search
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} className="border border-ink px-3 py-1.5 text-17 font-normal" />
        </label>
      </div>
      <ul className="grid md:grid-cols-2">
        {rows.map((r) => (
          <li key={r.t} className="border-b border-ink/15">
            <a
              href={r.href}
              data-match={tab === 0 && hl.includes(r.t) ? 'true' : undefined}
              className={`flex items-center justify-between gap-4 px-3 py-3 text-17 hover:underline ${tab === 0 && hl.includes(r.t) ? 'bg-amber font-semibold' : ''}`}
            >
              {r.t} <span aria-hidden>↗</span>
            </a>
          </li>
        ))}
      </ul>
      {rows.length === 0 && (
        <p className="py-6 text-17">
          No match for "{q}".{' '}
          <button type="button" className="underline" onClick={() => setQ('')}>Clear search</button>
        </p>
      )}
      <p className="mt-4 text-14">
        {rows.length} of {list.length} shown{tab === 0 && like ? ` · highlighted for "${like}"` : ''} · links open the official SRMIST pages
      </p>
    </Section>
  );
}

function Dean() {
  const d = data.dean;
  return (
    <Section tone="mist" label="05 · Dean's message">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <blockquote className="font-serif text-32 md:text-52">“{d.quote}”</blockquote>
          <p className="mt-8 text-17 font-bold">{d.name}</p>
          <p className="text-17">{d.role}</p>
          <a href={`mailto:${d.email}`} className="text-17 underline">{d.email}</a>
        </Reveal>
        <Reveal className="grid gap-5">
          {d.body.map((p) => (
            <p key={p.slice(0, 20)} className="text-17">{p}</p>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}

function Careers() {
  const c = data.careers;
  return (
    <Section id="careers" tone="ink" label="06 · Careers & placements" heading="Recruiters come to you." intro={c.intro}>
      <div className="grid gap-8 border-t-4 border-amber pt-8 md:grid-cols-3">
        {c.stats.map((s) => <Stat key={s.label} {...s} />)}
      </div>
      <p className="mt-6 text-14">{c.statsNote}</p>
      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h3 className="eyebrow">Industry collaboration</h3>
          <a href={c.volvo.href} className="mt-4 block text-22 font-semibold hover:underline">{c.volvo.t} →</a>
        </div>
        <div>
          <h3 className="eyebrow">Career development</h3>
          <ul className="mt-4 grid gap-2">
            {c.careerDev.map((x) => <li key={x} className="border-b border-off-white/20 pb-2 text-17">{x}</li>)}
          </ul>
          <a href={c.cdc} className="mt-4 inline-block text-17 font-semibold underline">FET Career Development Center →</a>
        </div>
      </div>
    </Section>
  );
}

function Cta() {
  const c = data.cta;
  return (
    <Section tone="paper">
      <p className="eyebrow">{c.eyebrow}</p>
      <h2 className="mt-4 text-52 font-extrabold tracking-tight lg:text-84">Your engineering journey starts here.</h2>
      <div className="mt-10 flex flex-wrap gap-4">
        <Button href={c.apply}>Apply Now</Button>
        <Button href={c.programmes} variant="outline-dark">Explore Programmes</Button>
        <Button href={c.prospectus} variant="outline-dark">Download Prospectus</Button>
      </div>
      <p className="mt-8 text-17">
        Engineering, Agriculture & Architecture admissions: <a href={c.phone.href} className="font-semibold underline">{c.phone.t}</a>
      </p>
    </Section>
  );
}

export default function Engineering() {
  const h = data.hero;
  return (
    <>
      <PageHero
        eyebrow={h.eyebrow}
        lines={h.lines}
        accent={h.accent}
        sub={h.sub}
        slot="engineering.hero"
        actions={
          <>
            <Button href="#disciplines">Explore Disciplines →</Button>
            <Button href="#research" variant="outline-dark">Discover Research</Button>
          </>
        }
        aside={
          <div className="flex h-full flex-col items-center justify-center gap-6 p-10">
            <Gears className="w-full max-w-[420px]" />
            <p className="text-14">{h.coords}</p>
          </div>
        }
      />
      <Glance />
      <Disciplines />
      <Research />
      <Departments />
      <Dean />
      <Careers />
      <Cta />
    </>
  );
}
