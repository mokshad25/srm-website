import { lazy, Suspense, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import AskPanel from './components/ask/AskPanel';
import { AskProvider } from './components/ask/AskProvider';
import Footer from './components/Footer';
import Header from './components/Header';
import PageWipe from './components/PageWipe';
import ScrollIndex from './components/ScrollIndex';
import Toaster from './components/Toast';
import { scrollToTarget, useSmoothScroll } from './lib/motion';
import Preloader from './sections/home/Preloader';

const Home = lazy(() => import('./pages/Home'));
const Engineering = lazy(() => import('./pages/Engineering'));
const Medicine = lazy(() => import('./pages/Medicine'));
const LearnLeapLead = lazy(() => import('./pages/LearnLeapLead'));

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useSmoothScroll();
  useEffect(() => {
    if (!hash) {
      scrollToTarget(0);
      return;
    }
    // Lazy pages may not have rendered the target yet.
    let tries = 0;
    const seek = () => {
      const el = document.getElementById(hash.slice(1));
      if (el) scrollToTarget(el);
      else if (tries++ < 60) raf = requestAnimationFrame(seek);
    };
    let raf = requestAnimationFrame(seek);
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AskProvider>
        <ScrollManager />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-amber focus:p-3 focus:text-ink"
        >
          Skip to content
        </a>
        <Preloader />
        <Header />
        <main id="main">
          <Suspense fallback={<div className="skeleton min-h-screen" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/engineering" element={<Engineering />} />
              <Route path="/medicine" element={<Medicine />} />
              <Route path="/learn-leap-lead" element={<LearnLeapLead />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <AskPanel />
        <Toaster />
        <ScrollIndex />
        <PageWipe />
      </AskProvider>
    </MotionConfig>
  );
}
