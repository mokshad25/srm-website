import { useSyncExternalStore } from 'react';

const KEY = 'srm-intro-seen';

function seen() {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false; // Storage blocked: show it once per load instead.
  }
}

// Deep links and inner pages go straight to their content.
let done = window.location.pathname !== '/' || window.location.hash !== '' || seen();
const listeners = new Set<() => void>();

export function finishIntro() {
  if (done) return;
  done = true;
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* private mode: it plays again next load */
  }
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** False while the Home preloader is on screen. */
export const useIntroDone = () => useSyncExternalStore(subscribe, () => done);
