import { Link } from 'react-router-dom';
import { tickerPulseItems } from '../lib/campusPulse';

export default function CampusPulseTicker() {
  const items = tickerPulseItems();
  if (!items.length) return null;
  const loop = [...items, ...items];
  return (
    <section aria-label="Latest Campus Pulse updates" className="campus-ticker relative z-20 mt-[72px] flex min-h-12 overflow-hidden bg-ink text-off-white xl:mt-[88px]">
      <Link to="/campus-pulse" className="relative z-10 inline-flex shrink-0 items-center gap-2 bg-amber px-4 text-12 font-bold tracking-[0.12em] text-ink sm:px-6">
        CAMPUS PULSE <span aria-hidden>→</span>
      </Link>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="campus-ticker-track flex w-max items-center hover:[animation-play-state:paused] motion-reduce:animate-none">
          {loop.map((item, index) => (
            <Link
              key={`${item.id}-${index}`}
              to={item.href?.startsWith('/') ? item.href : `/campus-pulse#${item.id}`}
              className="inline-flex shrink-0 items-center gap-4 px-5 py-3 text-14 font-medium hover:text-amber focus-visible:text-amber"
            >
              <span>{item.title}</span>
              <span aria-hidden className="text-amber">◆</span>
            </Link>
          ))}
        </div>
      </div>
      <Link to="/campus-pulse" className="relative z-10 hidden shrink-0 items-center gap-2 bg-ink px-5 text-14 font-semibold underline underline-offset-4 lg:inline-flex">
        View All Updates <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
