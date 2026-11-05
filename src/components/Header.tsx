import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import seal from '../assets/srm-seal.png';
import site from '../data/site.json';
import { useIntroDone } from '../lib/intro';
import AskTrigger from './ask/AskTrigger';

export const headerKey = (pathname: string) =>
  pathname.startsWith('/engineering') ? 'engineering' : pathname.startsWith('/medicine') ? 'medicine' : 'home';

const SOLID_AFTER = 80;

/** The same bar on every page: see-through over the hero, solid with a hairline after 80 px. */
export default function Header() {
  const { pathname, hash } = useLocation();
  const h = site.headers[headerKey(pathname)];
  const ready = useIntroDone();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const state = !ready ? 'hidden' : solid ? 'solid' : 'clear';

  useEffect(() => {
    const update = () => setSolid(window.scrollY > SOLID_AFTER);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => setOpen(false), [pathname, hash]);

  useEffect(() => {
    if (!open) return;
    const button = toggle.current;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      button?.focus();
    };
  }, [open]);

  const off = !ready ? -1 : undefined;
  // Only Home's hero is a photo under the whole bar.
  const light = pathname === '/' && !solid && !open;
  return (
    <header
      data-header={state}
      className={`${light ? 'text-off-white' : 'on-light text-ink'} fixed inset-x-0 top-0 z-40 border-b transition-[color,opacity,background-color,border-color] duration-300 ${!ready ? 'pointer-events-none opacity-0' : ''} ${solid || open ? 'border-ink/15 bg-off-white' : 'border-transparent bg-transparent'}`}
    >
      <div className="relative z-10 flex items-center justify-between gap-6 px-6 py-3 md:px-14">
        <Link to="/" tabIndex={off} className="flex min-w-0 items-center gap-3">
          <img src={seal} alt="SRM seal" width={64} height={64} className="h-12 w-12 rounded-full lg:h-14 lg:w-14" />
          <span className="block leading-none">
            <span className="block font-display text-22 font-bold">SRM</span>
            <span className="block text-14 font-medium">{h.division}</span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-3 xl:gap-4 2xl:gap-8">
          <nav aria-label="Main" className="hidden items-center gap-5 xl:flex 2xl:gap-8">
            {h.nav.map((n) => (
              <NavLink key={n.t} to={n.to} tabIndex={off} end className="nav-link text-17 font-medium">
                {n.t}
              </NavLink>
            ))}
            <a href={h.apply.href} tabIndex={off} className="bg-amber px-6 py-3 text-17 font-semibold text-ink transition-colors duration-200 hover:bg-ink hover:text-off-white">
              {h.apply.t}
            </a>
          </nav>
          <AskTrigger tone={light ? 'dark' : 'light'} tabIndex={off} />
          <button
            ref={toggle}
            type="button"
            tabIndex={off}
            className="min-h-11 border border-current px-4 text-14 font-semibold xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="fixed inset-0 flex flex-col justify-center gap-2 overflow-y-auto bg-off-white px-6 pt-24 pb-8 xl:hidden">
          {h.nav.map((n) => (
            <Link key={n.t} to={n.to} className="border-b border-ink/15 py-3 font-display text-32 font-bold" onClick={() => setOpen(false)}>
              {n.t}
            </Link>
          ))}
          <a href={h.apply.href} className="mt-4 bg-amber px-4 py-4 text-center text-17 font-bold text-ink">
            {h.apply.t}
          </a>
        </nav>
      )}
    </header>
  );
}
