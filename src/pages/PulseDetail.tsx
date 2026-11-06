import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { EventFacts, ItemPhoto, Provenance, published } from '../components/pulse/PulseParts';
import { loadPulse, usePulse, visible } from '../lib/pulse';

const Back = () => (
  <Link to="/campus-pulse" className="inline-flex min-h-11 items-center gap-2 text-14 font-semibold underline underline-offset-4">
    <span aria-hidden>←</span> All Campus Pulse updates
  </Link>
);

export default function PulseDetail() {
  const { id } = useParams();
  const { status, items } = usePulse();
  const item = visible(items).find((entry) => entry.id === id);

  return (
    <div className="on-light min-h-[70svh] bg-off-white px-6 pt-28 pb-20 text-ink md:px-14 lg:pt-36">
      <div className="mx-auto max-w-[860px]">
        <Back />
        {status === 'loading' && <div role="status" data-pulse-loading className="skeleton mt-8 h-72"><span className="sr-only">Loading this update</span></div>}
        {status === 'error' && (
          <div className="mt-8">
            <p className="text-17" role="alert">This update couldn't be loaded.</p>
            <button type="button" onClick={() => void loadPulse()} className="mt-3 min-h-11 border-2 border-ink px-4 text-14 font-bold">Try again</button>
          </div>
        )}
        {status === 'ready' && !item && (
          <div className="mt-8" data-pulse-missing>
            <h1 className="text-32 font-bold">This update isn't available</h1>
            <p className="mt-3 text-17">It may have finished or been removed.</p>
          </div>
        )}
        {item && (
          <article data-pulse-detail={item.id} className="mt-6">
            <div className="flex flex-wrap items-center gap-2 text-14">
              <Provenance item={item} />
              <span className="font-semibold">{item.category}</span>
              {item.type && <span>· {item.type}</span>}
            </div>
            <h1 className="mt-4 text-32 font-bold tracking-tight md:text-52">{item.title}</h1>
            <p className="mt-3 text-14">{published(item)}</p>
            <ItemPhoto item={item} className="mt-8 aspect-video" />
            <p className="mt-8 text-22">{item.summary}</p>
            {item.body && <p className="mt-4 text-17">{item.body}</p>}
            {item.event && <div className="mt-6 border-t border-ink/15 pt-6"><EventFacts item={item} /></div>}
            {item.url && <Button href={item.url} variant="royal" className="mt-8">View the official page</Button>}
          </article>
        )}
      </div>
    </div>
  );
}
