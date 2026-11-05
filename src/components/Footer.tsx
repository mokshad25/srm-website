import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import site from '../data/site.json';
import { headerKey } from './Header';

const SIZES = [100, 112.5, 125];

function Utility() {
  const { pathname } = useLocation();
  const utility: { t: string; href?: string }[] = site.headers[headerKey(pathname)].utility;
  const [size, setSize] = useState(0);
  const apply = (i: number) => {
    const next = Math.max(0, Math.min(SIZES.length - 1, i));
    setSize(next);
    document.documentElement.style.fontSize = `${SIZES[next]}%`;
  };
  const btn = 'min-h-11 min-w-11 border border-off-white/70 px-2 text-14 transition-colors duration-200 hover:bg-off-white hover:text-ink';
  return (
    <div className="mx-auto mb-12 flex max-w-[1328px] flex-wrap items-center justify-between gap-4 border-b border-off-white/20 pb-6 text-14">
      <ul className="flex flex-wrap gap-x-6 gap-y-1">
        {utility.map((u) => (
          <li key={u.t}>{u.href ? <a href={u.href} className="hover:underline">{u.t}</a> : u.t}</li>
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <span>Text size</span>
        <button type="button" className={btn} aria-label="Increase text size" onClick={() => apply(size + 1)}>A+</button>
        <button type="button" className={btn} aria-label="Decrease text size" onClick={() => apply(size - 1)}>A−</button>
        <button type="button" className={btn} aria-label="Reset text size" onClick={() => apply(0)}>Reset</button>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10 bg-ink px-6 py-16 text-off-white md:px-14">
      <Utility />
      <div className="mx-auto grid max-w-[1328px] gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <p className="font-serif text-32">SRM</p>
          <p className="mt-2 text-14">{site.fullName}</p>
          <p className="mt-2 text-14">{site.address}</p>
          <a href={site.phone.href} className="mt-2 block text-14 underline">{site.phone.label}</a>
          <p className="mt-2 text-14">NAAC A++ · NIRF #12 (2024)</p>
        </div>
        {site.footer.map((c) => (
          <div key={c.h}>
            <h2 className="text-14 font-bold">{c.h}</h2>
            <ul className="mt-3 grid gap-2">
              {c.l.map((l) => (
                <li key={l.t}>
                  <a href={l.href} className="text-14 hover:underline">{l.t}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-[1328px] border-t border-off-white/20 pt-6 text-14">
        © {site.fullName}
      </p>
    </footer>
  );
}
