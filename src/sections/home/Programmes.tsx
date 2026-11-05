import { useMemo, useState } from 'react';
import Button from '../../components/Button';
import Section from '../../components/Section';
import fees from '../../data/fees.json';
import home from '../../data/home.json';
import programmes from '../../data/programmes.json';
import site from '../../data/site.json';

const tuition = fees.tuition as Record<string, number>;
const unpublished = fees.unpublished as Record<string, string>;
const inr = (n: number) => `₹ ${Math.round(n).toLocaleString('en-IN')}`;
const tuitionText = (id: string) => (tuition[id] ? inr(tuition[id]) : unpublished[id]);
const levelName = (l: string) => (l === 'UG' ? 'Undergraduate' : 'Postgraduate');

function Compare({ ids, onClear }: { ids: string[]; onClear: () => void }) {
  const cp = ids.map((id) => programmes.find((p) => p.id === id)!);
  if (cp.length === 1) return <p className="mt-4 text-17">1 selected. Pick one more to compare (up to 3).</p>;
  if (cp.length < 2) return null;
  const rows: [string, (p: (typeof programmes)[number]) => string][] = [
    ['Discipline', (p) => p.discipline],
    ['Level', (p) => levelName(p.level)],
    ['Duration', (p) => p.duration],
    ['Eligibility', (p) => p.eligibility],
    ['Annual tuition', (p) => tuitionText(p.id)],
  ];
  return (
    <div data-compare className="mt-8 overflow-x-auto bg-ink p-6 text-off-white">
      <div className="flex items-center justify-between">
        <h3 className="text-22 font-bold">Compare</h3>
        <button type="button" onClick={onClear} className="text-14 font-semibold underline">Clear</button>
      </div>
      <table className="mt-4 w-full min-w-[640px] text-left text-14">
        <thead>
          <tr className="border-b border-off-white/30">
            <th scope="col"><span className="sr-only">Attribute</span></th>
            {cp.map((p) => <th key={p.id} scope="col" className="p-2 text-17 font-bold">{p.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, f]) => (
            <tr key={k} className="border-b border-off-white/15">
              <th scope="row" className="p-2 font-semibold">{k}</th>
              {cp.map((p) => <td key={p.id} className="p-2">{f(p)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Finder({ highlighted }: { highlighted: string[] }) {
  const [q, setQ] = useState('');
  const [level, setLevel] = useState('All');
  const [open, setOpen] = useState<string | null>(null);
  const [cmp, setCmp] = useState<string[]>([]);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const list = programmes.filter(
      (p) => (level === 'All' || p.level === level) && (!ql || `${p.name} ${p.discipline}`.toLowerCase().includes(ql)),
    );
    return [...list].sort((a, b) => Number(highlighted.includes(b.id)) - Number(highlighted.includes(a.id)));
  }, [q, level, highlighted]);

  const toggleCmp = (id: string) =>
    setCmp((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {['All', 'UG', 'PG'].map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={level === l}
              onClick={() => setLevel(l)}
              className={`border-2 border-ink px-4 py-2 text-17 font-semibold ${level === l ? 'bg-ink text-off-white' : ''}`}
            >
              {l}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3 text-14 font-semibold max-md:w-full">
          Search programmes
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border border-ink bg-white px-3 py-1.5 text-17 font-normal max-md:min-w-0 max-md:flex-1"
          />
        </label>
      </div>
      <ul className="mt-6 border-t border-ink/20">
        {rows.map((p) => {
          const isOpen = open === p.id;
          const inCmp = cmp.includes(p.id);
          const hot = highlighted.includes(p.id);
          return (
            <li key={p.id} data-programme={p.id} data-highlight={hot ? 'true' : undefined} className={`border-b border-ink/20 ${hot ? 'border-l-8 border-l-amber pl-4' : ''}`}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : p.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span>
                  <span className="block text-22 font-bold">{p.name}</span>
                  <span className="block text-14">{p.discipline} · {levelName(p.level)} · {p.duration}</span>
                </span>
                <span aria-hidden className="text-32 font-light">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="grid gap-4 pb-5 md:grid-cols-[2fr_1fr_auto] md:items-end">
                  <p className="text-17"><strong>Eligibility.</strong> {p.eligibility}</p>
                  <p className="text-17"><strong>Annual tuition.</strong> {tuitionText(p.id)}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-pressed={inCmp}
                      onClick={() => toggleCmp(p.id)}
                      className={`border-2 border-ink px-4 py-2 text-17 font-semibold ${inCmp ? 'bg-ink text-off-white' : ''}`}
                    >
                      {inCmp ? 'Remove from compare' : 'Compare'}
                    </button>
                    <Button href={site.applyUrl}>Apply</Button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {rows.length === 0 && (
        <p className="py-6 text-17">
          No programmes match.{' '}
          <button type="button" className="underline" onClick={() => { setQ(''); setLevel('All'); }}>Clear filters</button>
        </p>
      )}
      <Compare ids={cmp} onClear={() => setCmp([])} />
    </div>
  );
}

function Estimator() {
  const priced = programmes.filter((x) => tuition[x.id]);
  const [pid, setPid] = useState(priced[0].id);
  const [s, setS] = useState(0);
  const [h, setH] = useState(0);
  const base = tuition[pid];
  const sch = fees.scholarships[s];
  const hostel = fees.hostels[h];
  const discount = (base * sch.pct) / 100;
  const total = base - discount + hostel.amount;

  const field = 'mt-1 w-full border border-off-white/60 px-3 py-2 text-17 text-off-white';
  return (
    <div id="fees" className="-mx-6 mt-16 bg-night p-8 text-off-white md:-mx-14 md:px-14 md:py-16">
      <h2 className="!font-serif !font-normal">What will it cost?</h2>
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="grid gap-5">
          <label className="text-14 font-semibold">
            Programme
            <select aria-label="Programme" value={pid} onChange={(e) => setPid(e.target.value)} className={field}>
              {priced.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </label>
          <label className="text-14 font-semibold">
            Scholarship category
            <select aria-label="Scholarship category" value={s} onChange={(e) => setS(+e.target.value)} className={field}>
              {fees.scholarships.map((x, i) => <option key={x.t} value={i}>{x.t}</option>)}
            </select>
          </label>
          <label className="text-14 font-semibold">
            Hostel
            <select aria-label="Hostel" value={h} onChange={(e) => setH(+e.target.value)} className={field}>
              {fees.hostels.map((x, i) => <option key={x.t} value={i}>{x.t}</option>)}
            </select>
          </label>
        </div>
        <div>
          <dl className="grid gap-2 text-17">
            {[
              ['Tuition', inr(base)],
              [`Scholarship: ${sch.pct}% of tuition`, `− ${inr(discount)}`],
              ['Hostel', inr(hostel.amount)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-off-white/20 pb-2">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-17 font-semibold">Estimated first year</p>
          <p data-fee-total aria-live="polite" className="text-52 font-extrabold tracking-tight">{inr(total)}</p>
          <p className="mt-3 max-w-[52ch] text-14">{fees.label}</p>
        </div>
      </div>
    </div>
  );
}

function Personas({ persona, onPersona }: { persona: string | null; onPersona: (id: string | null) => void }) {
  const chosen = home.personas.find((x) => x.id === persona);
  return (
    <div className="mb-8">
      <div role="group" aria-label="I am" className="flex flex-wrap items-center gap-2">
        <span aria-hidden className="mr-2 text-14 font-semibold">I am</span>
        {home.personas.map((x) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={persona === x.id}
            data-persona={x.id}
            onClick={() => onPersona(persona === x.id ? null : x.id)}
            className={`border-2 border-ink px-4 py-2 text-14 font-semibold ${persona === x.id ? 'bg-ink text-off-white' : ''}`}
          >
            {x.t}
          </button>
        ))}
      </div>
      {chosen && <p data-persona-sub className="mt-4 max-w-[60ch] text-17">{chosen.sub}</p>}
    </div>
  );
}

interface Props {
  persona: string | null;
  onPersona: (id: string | null) => void;
}

export default function Programmes({ persona, onPersona }: Props) {
  const highlighted = home.personas.find((p) => p.id === persona)?.programmes ?? [];
  return (
    <Section
      id="programmes"
      tone="paper"
      className="pb-0 lg:pb-0"
      label="Programme explorer"
      heading="Find the right programme"
      intro="Confirm eligibility on the official SRM admissions page."
    >
      <Personas persona={persona} onPersona={onPersona} />
      <Finder highlighted={highlighted} />
      <Estimator />
    </Section>
  );
}
