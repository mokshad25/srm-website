import Button from '../components/Button';
import Photo from '../components/Photo';
import Section, { Reveal } from '../components/Section';
import Stat from '../components/Stat';
import data from '../data/learn.json';
import site from '../data/site.json';
import { photoFor } from '../lib/photos';

export default function LearnLeapLead() {
  const anyPhoto = data.panels.some((p) => photoFor(p.slot));
  return (
    <>
      <section className="on-light relative grid bg-off-white text-ink lg:grid-cols-2">
        <div className="px-6 pt-32 pb-20 md:px-14 lg:pt-40 lg:pb-28">
          <p className="eyebrow">{data.eyebrow}</p>
          <h1 className="mt-8 font-serif text-52 lg:text-84">
            {data.panels.map((p) => <span key={p.n} className="block">{p.t}</span>)}
          </h1>
        </div>
        <Photo slot="learn.hero" eager className="min-h-[320px]" />
        <div aria-hidden className="nav-scrim pointer-events-none absolute inset-x-0 top-0 h-32" />
      </section>
      {anyPhoto ? (
        data.panels.map((p, i) => (
          <Section key={p.n} tone={i === 1 ? 'mist' : 'white'}>
            <Reveal className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-14 font-semibold">{p.n} / 03</p>
                <h2 className="mt-3 font-serif text-52 lg:text-84">{p.t}</h2>
                <p className="mt-4 max-w-[44ch] text-22">{p.d}</p>
              </div>
              <Photo slot={p.slot} parallax className="aspect-[4/3]" />
            </Reveal>
          </Section>
        ))
      ) : (
        <Section>
          <Reveal className="grid gap-10 md:grid-cols-3">
            {data.panels.map((p) => (
              <div key={p.n} className="border-t-4 border-ink pt-6">
                <p className="text-14 font-semibold">{p.n} / 03</p>
                <h2 className="mt-3 font-serif text-52 lg:text-84">{p.t}</h2>
                <p className="mt-4 text-22">{p.d}</p>
              </div>
            ))}
          </Reveal>
        </Section>
      )}
      <Section tone="ink" label="Where it leads" heading="The numbers behind the promise">
        <div className="grid gap-8 border-t-4 border-amber pt-8 md:grid-cols-2 lg:grid-cols-4">
          {data.stats.map((s) => <Stat key={s.label} {...s} />)}
        </div>
        <p className="mt-6 text-14">{data.method}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href={site.applyUrl}>Apply Now</Button>
          <Button href="/#programmes" variant="outline">Explore Programmes</Button>
        </div>
      </Section>
    </>
  );
}
