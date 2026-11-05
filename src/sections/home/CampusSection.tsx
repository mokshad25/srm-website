import { useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import poster from '../../assets/photos/campus-aerial.jpg';

const CAMPUS_VIDEO = '/videos/srmist-campus.mp4';

export default function CampusSection() {
  const reduce = !!useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  return (
    <section
      id="campus"
      aria-label="Discover the world of SRMIST"
      className="relative isolate flex min-h-[min(760px,88svh)] items-end overflow-hidden bg-night text-off-white"
      style={{ backgroundImage: `url(${poster})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
    >
      {!reduce && !failed && (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={poster}
          aria-hidden
          onCanPlay={() => setReady(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src={CAMPUS_VIDEO} type="video/mp4" />
        </video>
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/15" />
      <div className="relative z-10 w-full px-6 py-20 md:px-14 md:py-28">
        <div className="mx-auto max-w-[1328px]">
          <p className="eyebrow flex items-center gap-3">
            <span aria-hidden className="h-0.5 w-9 bg-amber" />
            Life at SRMIST
          </p>
          <h2 className="mt-6 max-w-[760px] font-display text-5xl font-extrabold leading-none tracking-tight md:text-7xl">
            Discover the World of SRMIST
          </h2>
          <p className="mt-6 max-w-[560px] text-17 md:text-22">
            Explore an ecosystem of innovation, learning, research and opportunities.
          </p>
          <Button href="/campus-explorer" variant="primary" className="mt-8">
            Explore Our Campus <span aria-hidden>→</span>
          </Button>
          <Link to="/campus-explorer" className="sr-only focus:not-sr-only focus:mt-4 focus:block">
            Open the interactive campus explorer
          </Link>
        </div>
      </div>
    </section>
  );
}
