import { useState } from 'react';
import Button from '../components/Button';
import HorizontalScroll from '../components/HorizontalScroll';
import PageHero from '../components/PageHero';
import Photo from '../components/Photo';
import PhotoPanel from '../components/PhotoPanel';
import Section, { Reveal } from '../components/Section';
import Stat from '../components/Stat';
import data from '../data/medicine.json';
import site from '../data/site.json';
import BodyDiagram from '../sections/medicine/BodyDiagram';

function Ecg() {
  return (
    <svg viewBox="0 0 600 70" fill="none" aria-hidden className="mt-8 h-auto w-full max-w-[600px]">
      <path
        d="M0 40h170l18-32 22 60 22-68 20 52 12-12h336"
        stroke="var(--color-teal)"
        strokeWidth="3"
        strokeDasharray="1000"
        style={{ animation: 'ecg-draw 2s ease-out' }}
      />
    </svg>
  );
}

function About() {
  const a = data.about;
  return (
    <Section id="about" label="01 · At a glance">
      <div className="grid gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-32 font-bold tracking-tight md:text-52">
            A legacy of learning. A future of discovery.
          </h2>
          <p className="mt-8 text-22">{a.body}</p>
          <ul className="mt-8">
            {a.facts.map((f) => (
              <li key={f} className="flex gap-3 border-t border-ink/15 py-3 text-17">
                <span aria-hidden className="font-bold">+</span>
                {f}
              </li>
            ))}
          </ul>
          <figure className="mt-6">
            <Photo slot="medicine.about" parallax className="aspect-[16/7]" />
            <figcaption className="mt-2 text-14">SRM Kattankulathur campus</figcaption>
          </figure>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-2 gap-x-8 gap-y-8">
            {a.stats.map((s) => (
              <div key={s.label} className="border-b border-ink/15 pb-6">
                <Stat {...s} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-14">{a.statsNote}</p>
          <div className="mt-8 bg-teal/10 p-8">
            <h3 className="text-22 font-bold">NIRF 2025</h3>
            <ol className="mt-4 grid grid-cols-2 gap-1 sm:grid-cols-4">
              {a.ranks.map((r, i) => (
                <li key={r.label} className={`p-4 ${i < 3 ? 'bg-ink text-off-white' : 'bg-white'}`}>
                  <span className="block text-32 font-extrabold">#{r.rank}</span>
                  <span className="text-14">{r.label}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-14">{a.ranksNote}</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Anatomy() {
  const [sys, setSys] = useState(1);
  const y = data.systems[sys];
  return (
    <Section
      id="anatomy"
      tone="ink"
      grid
      label="02 · Anatomy explorer"
      heading="Understand the human body. Explore the science of life."
    >
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr_1.1fr]">
        <ul>
          {data.systems.map((s, i) => (
            <li key={s.n} className="border-b border-off-white/20">
              <button
                type="button"
                aria-pressed={sys === i}
                onClick={() => setSys(i)}
                className={`flex w-full items-center justify-between py-3 text-left text-22 ${sys === i ? 'font-bold underline decoration-teal decoration-2 underline-offset-8' : ''}`}
              >
                {s.t} <span className="text-14 font-normal">{s.n}</span>
              </button>
            </li>
          ))}
        </ul>
        <BodyDiagram active={sys} onPick={setSys} label={`Human body illustration highlighting the ${y.t.toLowerCase()}`} />
        <div aria-live="polite" className="border border-off-white/20 p-8">
          <p className="eyebrow">System {y.n}</p>
          <h3 className="mt-2 text-32 font-bold">{y.t}</h3>
          <p className="mt-4 text-17">{y.d}</p>
          <h4 className="eyebrow mt-6">Related disciplines</h4>
          <p className="mt-2 text-17">{y.related.join(' · ')}</p>
          <h4 className="eyebrow mt-6">Learning areas</h4>
          <ul className="mt-2 grid gap-1">
            {y.learn.map((l) => <li key={l} className="text-17">→ {l}</li>)}
          </ul>
        </div>
      </div>
      <p className="mt-8 text-14">Simplified educational illustration, not to anatomical scale.</p>
    </Section>
  );
}

function Schools() {
  return (
    <HorizontalScroll id="schools">
      <div className="flex flex-col justify-center p-6 md:p-14">
        <p className="eyebrow">03 · Schools</p>
        <h2 className="mt-6 text-52 font-extrabold tracking-tight">Explore the science behind every speciality.</h2>
        <p className="mt-6 text-22">Seven schools.</p>
        <p className="mt-3 text-14">{site.stockNote}</p>
      </div>
      {data.schools.map((s, i) => (
        <PhotoPanel key={s.n} slot={`medicine.school-${i + 1}`} href={s.href}>
          <span className="text-84 font-extrabold">{s.n}</span>
          <div>
            <h3 className="text-32 font-bold tracking-tight">{s.t}</h3>
            <span className="mt-4 block text-17">{s.d}</span>
          </div>
        </PhotoPanel>
      ))}
    </HorizontalScroll>
  );
}

function Clinical() {
  const [j, setJ] = useState(0);
  const s = data.journey[j];
  return (
    <Section
      id="clinical"
      tone="mist"
      label="04 · Clinical experience"
      heading={<>Learning medicine beyond the <em className="font-serif font-normal">classroom.</em></>}
      intro={data.clinicalIntro}
    >
      <ol className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {data.journey.map((x, i) => (
          <li key={x.n}>
            <button
              type="button"
              aria-pressed={j === i}
              onClick={() => setJ(i)}
              className={`w-full border-t-4 py-3 text-left text-17 font-semibold ${i <= j ? 'border-teal' : 'border-ink/20'}`}
            >
              {x.n} {x.t}
            </button>
          </li>
        ))}
      </ol>
      <div aria-live="polite" className="mt-8 grid gap-8 bg-white p-8 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Stage {s.n}</p>
          <h3 className="mt-2 text-32 font-bold">{s.t}</h3>
          <p className="mt-3 text-22">{s.text}</p>
        </div>
        <ul className="grid gap-3 self-center">
          {s.points.map((p) => <li key={p} className="border-b border-ink/15 pb-3 text-17">+ {p}</li>)}
        </ul>
      </div>
    </Section>
  );
}

function Research() {
  const [i, setI] = useState(0);
  const r = data.research;
  const a = r.areas[i];
  return (
    <Section id="research" tone="ink" grid label="05 · Research & innovation" heading="Where science meets discovery." intro={r.intro}>
      <div className="grid gap-8 border-t-4 border-teal pt-8 md:grid-cols-3">
        {r.stats.map((s) => <Stat key={s.label} {...s} />)}
      </div>
      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <ul>
          {r.areas.map((x, k) => (
            <li key={x.n} className="border-b border-off-white/20">
              <button
                type="button"
                aria-pressed={k === i}
                onClick={() => setI(k)}
                className={`flex w-full gap-4 py-4 text-left text-22 ${k === i ? 'font-bold underline decoration-teal decoration-2 underline-offset-8' : ''}`}
              >
                <span className="text-14">{x.n}</span>{x.t}
              </button>
            </li>
          ))}
        </ul>
        <div className="border border-off-white/20 p-8">
          <p className="eyebrow">{a.k}</p>
          <h3 className="mt-2 text-22 font-bold">{a.t}</h3>
          <p className="mt-2 text-17">{a.d}</p>
          <a href={a.href} className="mt-4 inline-block text-17 font-semibold underline">{a.cta} →</a>
        </div>
      </div>
    </Section>
  );
}

function Finder() {
  const [kind, setKind] = useState('All');
  const [q, setQ] = useState('');
  const all = [
    ...data.schools.map((s) => ({ t: s.t, d: s.d, k: 'School', href: s.href })),
    ...data.admissions,
  ];
  const ql = q.trim().toLowerCase();
  const rows = all.filter(
    (r) =>
      (kind === 'All' || (kind === 'Schools' ? r.k === 'School' : r.k !== 'School')) &&
      (!ql || `${r.t} ${r.d}`.toLowerCase().includes(ql)),
  );
  return (
    <Section id="programmes" label="06 · Programmes & admissions" heading="Find your route in.">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {['All', 'Schools', 'Admissions'].map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={`border-2 border-ink px-4 py-2 text-17 font-semibold ${kind === k ? 'bg-ink text-off-white' : ''}`}
            >
              {k}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3 text-14 font-semibold">
          Search
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} className="border border-ink px-3 py-1.5 text-17 font-normal" />
        </label>
      </div>
      <ul className="mt-6 border-t border-ink/15">
        {rows.map((r, i) => (
          <li key={`${r.t}-${r.k}`} className="border-b border-ink/15">
            <a href={r.href} className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-3 hover:underline">
              <span className="text-14">{String(i + 1).padStart(2, '0')}</span>
              <span>
                <span className="block text-17 font-semibold">{r.t}</span>
                <span className="block text-14">{r.d}</span>
              </span>
              <span className={`px-2 text-14 font-semibold ${r.k === 'School' ? 'bg-teal/20' : 'bg-amber/40'}`}>{r.k}</span>
            </a>
          </li>
        ))}
      </ul>
      {rows.length === 0 && (
        <p className="py-6 text-17">
          No match for "{q}". <button type="button" className="underline" onClick={() => setQ('')}>Clear search</button>
        </p>
      )}
      <p className="mt-3 text-14">{rows.length} of {all.length} shown · links open official SRMIST pages</p>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <a href={data.tour} className="block bg-ink p-8 text-off-white hover:underline">
          <span className="eyebrow block">Virtual tour</span>
          <span className="mt-2 block text-22 font-bold">Take the 360° campus tour ↗</span>
        </a>
        <div className="bg-teal/10 p-8">
          <h3 className="eyebrow">Helplines · {data.hours}</h3>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
            {data.helplines.map((h) => (
              <li key={h}><a href={`tel:${h.replace(/\s/g, '')}`} className="text-17 font-semibold underline">{h}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

function Cta() {
  const c = data.contact;
  return (
    <Section tone="paper">
      <p className="eyebrow">Admissions 2026–27</p>
      <h2 className="mt-4 text-52 font-extrabold tracking-tight lg:text-84">Your journey in medicine starts here.</h2>
      <div className="mt-10 flex flex-wrap gap-4">
        <Button href={c.apply}>Apply Now</Button>
        <Button href="#programmes" variant="outline-dark">Explore Programmes</Button>
        <Button href={data.tour} variant="outline-dark">Discover Campus</Button>
        <Button href={c.phone.href} variant="outline-dark">Contact Admissions</Button>
      </div>
      <dl className="mt-12 grid gap-6 text-17 md:grid-cols-3">
        <div><dt className="font-bold">Hospital</dt><dd>{c.hospital}</dd></div>
        <div><dt className="font-bold">Head office</dt><dd>{c.office}</dd></div>
        <div>
          <dt className="font-bold">Contact</dt>
          <dd><a className="underline" href={`mailto:${c.email}`}>{c.email}</a></dd>
          <dd><a className="underline" href={c.phone.href}>{c.phone.t}</a></dd>
        </div>
      </dl>
    </Section>
  );
}

export default function Medicine() {
  const h = data.hero;
  return (
    <>
      <PageHero
        eyebrow={h.eyebrow}
        lines={h.lines}
        accent={h.accent}
        sub={h.sub}
        slot="medicine.hero"
        rule="teal"
        actions={
          <>
            <Button href="#programmes">Explore Programmes →</Button>
            <Button href="#clinical" variant="outline-dark">Discover Clinical Training</Button>
          </>
        }
        aside={
          <div className="flex h-full items-center justify-center p-6 md:p-14">
            <div className="flex max-w-[440px] gap-4 bg-white p-6 text-ink">
              <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center bg-teal/20 text-32 font-bold">+</span>
              <p>
                <span className="block text-22 font-bold">{h.hospital[0]}</span>
                <span className="text-17">{h.hospital[1]}</span>
              </p>
            </div>
          </div>
        }
      >
        <Ecg />
      </PageHero>
      <About />
      <Anatomy />
      <Schools />
      <Clinical />
      <Research />
      <Finder />
      <Cta />
    </>
  );
}
