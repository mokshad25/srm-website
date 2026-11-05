import { useCallback, useSyncExternalStore } from 'react';
import campus from '../data/campus.json';

const KEY = 'srm-campus-explored';

function load(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((id) => campus.places.some((p) => p.id === id)) : [];
  } catch {
    return [];
  }
}

// One store, so the hero card and the map always agree.
let explored = load();
const listeners = new Set<() => void>();

function set(next: string[]) {
  explored = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode: progress lasts for the visit */
  }
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** "N of 24 explored" progress, shared across the page and saved to localStorage. */
export function useExplored() {
  const value = useSyncExternalStore(subscribe, () => explored);
  const mark = useCallback((id: string) => {
    if (!explored.includes(id)) set([...explored, id]);
  }, []);
  const reset = useCallback(() => set([]), []);
  return { explored: value, mark, reset };
}
