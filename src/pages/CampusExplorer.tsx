import Button from '../components/Button';
import CampusMap from '../sections/home/campus/CampusMap';

export default function CampusExplorer() {
  return (
    <div className="on-light bg-off-white text-ink">
      <section className="px-6 pt-32 pb-12 md:px-14 md:pt-40 md:pb-16">
        <div className="mx-auto max-w-[1328px]">
          <p className="eyebrow flex items-center gap-3">
            <span aria-hidden className="h-0.5 w-9 bg-royal" />
            Interactive campus guide
          </p>
          <h1 className="mt-6 max-w-[850px] font-display text-5xl font-extrabold leading-none tracking-tight md:text-7xl">
            Explore Our <em className="font-serif font-normal">Campus.</em>
          </h1>
          <p className="mt-6 max-w-[680px] text-17 md:text-22">
            Discover the places, pathways and stories that make the SRMIST campus feel like home.
          </p>
          <Button href="/" variant="outline-dark" className="mt-8">
            <span aria-hidden>←</span> Back to homepage
          </Button>
        </div>
      </section>
      <CampusMap />
    </div>
  );
}
