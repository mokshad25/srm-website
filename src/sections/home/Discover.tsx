import HorizontalScroll from '../../components/HorizontalScroll';
import PhotoPanel from '../../components/PhotoPanel';
import home from '../../data/home.json';
import site from '../../data/site.json';

export default function Discover() {
  const d = home.discover;
  return (
    <HorizontalScroll id="discover" panels="[&>*]:w-[1000px] [&>*:first-child]:w-[760px]">
      <div className="flex flex-col justify-center bg-night p-6 md:p-14">
        <p className="eyebrow">{d.label}</p>
        <h2 className="mt-6 !text-[clamp(3rem,7vw,6.5rem)]">Discover your <em>world</em></h2>
        <p className="mt-6 text-22">{d.intro}</p>
        <p className="mt-3 text-14">{site.stockNote}</p>
      </div>
      {d.worlds.map((w, i) => (
        <PhotoPanel key={w.n} slot={`home.discover-${i + 1}`} href={w.to} scrim="bg-night/50">
          <span className="font-display text-22 font-bold">{w.n} / 06</span>
          <div>
            <h3 className="font-display text-[clamp(1.75rem,7.4cqw,4.75rem)] leading-none font-extrabold tracking-[-0.03em]">{w.t}</h3>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
              <p className="max-w-[46ch] text-22">{w.d}</p>
              <span className="bg-amber px-5 py-3 text-17 font-semibold text-ink">Explore →</span>
            </div>
          </div>
        </PhotoPanel>
      ))}
    </HorizontalScroll>
  );
}
