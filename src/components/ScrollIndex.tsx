import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTarget } from '../lib/motion';

const title = (id: string) => id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');

/** Reading progress along the top, and a list of the page's sections down the right. */
export default function ScrollIndex() {
  const { pathname } = useLocation();
  const bar = useRef<HTMLDivElement>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    const scan = () => setIds([...document.querySelectorAll<HTMLElement>('main [id]')].filter((e) => e.offsetHeight > 200 && e.id !== 'main' && !e.parentElement?.closest('main [id]')).map((e) => e.id));
    const t = setTimeout(scan, 900);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      let now = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < innerHeight / 2) now = id;
      }
      setActive(now);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [ids]);

  return (
    <>
      <div ref={bar} aria-hidden data-progress className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left scale-x-0 bg-royal" />
      {ids.length > 2 && (
        <nav aria-label="Sections on this page" className="fixed top-1/2 right-3 z-30 hidden -translate-y-1/2 xl:block">
          <ul className="grid gap-1">
            {ids.map((id) => (
              <li key={id} className="group relative">
                <button
                  type="button"
                  aria-label={title(id)}
                  aria-current={active === id ? 'true' : undefined}
                  onClick={() => { const el = document.getElementById(id); if (el) scrollToTarget(el); }}
                  className="flex h-6 w-6 items-center justify-center"
                >
                  <span className={`block w-1 bg-royal outline outline-1 outline-off-white transition-[height] duration-200 ${active === id ? 'h-5' : 'h-2'}`} />
                </button>
                <span aria-hidden className="pointer-events-none absolute top-0 right-7 bg-ink px-2 py-0.5 text-14 whitespace-nowrap text-off-white invisible group-hover:visible group-focus-within:visible">{title(id)}</span>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
