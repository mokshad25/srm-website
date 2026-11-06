import { Link } from 'react-router-dom';
import CampusMap from '../sections/home/campus/CampusMap';

export default function CampusExplorer() {
  return (
    <div className="on-light bg-off-white text-ink">
      <section className="px-6 pt-[88px] pb-4 md:px-14 md:pt-[104px] lg:pt-[116px]">
        <div className="mx-auto max-w-[1328px]">
          <div className="flex flex-wrap items-center justify-between gap-x-4">
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden className="h-0.5 w-9 bg-royal" />
              Interactive campus guide
            </p>
            <Link to="/" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-14 font-semibold whitespace-nowrap underline underline-offset-2">
              <span aria-hidden>←</span> Back to homepage
            </Link>
          </div>
          <div className="mt-1 grid gap-2 lg:grid-cols-[auto_minmax(0,60ch)] lg:items-end lg:justify-between lg:gap-10">
            <h1 className="font-display text-32 font-extrabold tracking-tight md:text-52">
              Explore Our <em className="font-serif font-normal">Campus.</em>
            </h1>
            <p className="text-14">
              Discover the places, pathways and stories that make the SRMIST campus feel like home. Click a marker or a building to open its card, drag to look around, and watch the route draw from Gate 4.
            </p>
          </div>
        </div>
      </section>
      <CampusMap />
    </div>
  );
}
