import { useState } from 'react';
import Button from '../components/Button';
import Section from '../components/Section';
import Stat from '../components/Stat';
import home from '../data/home.json';
import site from '../data/site.json';
import CampusSection from '../sections/home/CampusSection';
import CampusPulseTicker from '../components/CampusPulseTicker';
import Discover from '../sections/home/Discover';
import Hero from '../sections/home/Hero';
import { LiveLearnPlay, NewsEvents, Recruiters, Testimonials, WorldMap } from '../sections/home/Optional';
import Programmes from '../sections/home/Programmes';

function Trust() {
  return (
    <section id="placements" aria-label="Accreditation and placements" className="on-light bg-amber px-6 py-8 text-ink md:px-14">
      <ul className="mx-auto grid max-w-[1328px] grid-cols-2 gap-6 md:grid-cols-5">
        {home.trust.map((t) => (
          <li key={t.label}><Stat {...t} size="32" /></li>
        ))}
      </ul>
    </section>
  );
}

function Research() {
  const r = home.research;
  return (
    <Section id="research" tone="night" grid label="Research and innovation" heading="Where science meets discovery." intro={r.intro}>
      <div className="grid gap-8 border-t-4 border-amber pt-8 md:grid-cols-3">
        {r.stats.map((s) => <Stat key={s.label} {...s} />)}
      </div>
    </Section>
  );
}

function Cta() {
  const c = home.cta;
  return (
    <Section id="admissions" tone="royal">
      <p className="eyebrow">{c.eyebrow}</p>
      <h2 className="mt-4 !font-serif !font-normal !tracking-normal">Your next chapter starts here.</h2>
      <div className="mt-10 flex flex-wrap gap-4">
        <Button href={site.applyUrl}>Apply Now</Button>
        <Button href="/#programmes" variant="outline">Explore Programmes</Button>
        <Button href={c.prospectus} variant="outline">Download Prospectus</Button>
        <Button href={c.tour} variant="outline">Take the virtual tour</Button>
      </div>
      <ol className="mt-14 grid gap-6 border-t border-off-white/30 pt-8 md:grid-cols-5">
        {c.steps.map((s) => (
          <li key={s.n}>
            <span className="font-display text-22 font-bold">{s.n}</span>
            <h3 className="text-22 font-bold">{s.t}</h3>
            <p className="text-17">{s.d}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-14">{c.note}</p>
    </Section>
  );
}

export default function Home() {
  const [pid, setPid] = useState<string | null>(null);

  return (
    <div className="home bg-night">
      <CampusPulseTicker />
      <Hero />
      {/* Rises over the pinned hero during its first 100vh. */}
      <div className="relative z-10 motion-safe:lg:-mt-[100svh]">
        <Trust />
        <CampusSection />
        <Discover />
        <Programmes persona={pid} onPersona={setPid} />
        <Testimonials />
        <NewsEvents />
        <WorldMap />
        <LiveLearnPlay />
        <Research />
        <Recruiters />
        <Cta />
      </div>
    </div>
  );
}
