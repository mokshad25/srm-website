// The one source for Campus Pulse and the homepage ticker. To connect a CMS or university API, set
// VITE_PULSE_API to a URL returning { items: PulseItem[] }. Nothing else needs to change.
import { useSyncExternalStore } from 'react';
import news from '../data/news.json';
import pulse from '../data/pulse.json';

export type PulseKind = 'announcement' | 'event' | 'achievement' | 'research' | 'highlight';

export interface PulseEvent {
  start: string;
  end?: string;
  dateLabel: string;
  time?: string;
  venue?: string;
  department?: string;
}

export interface PulseItem {
  id: string;
  kind: PulseKind;
  title: string;
  /** A shorter title for the ticker. */
  headline?: string;
  summary: string;
  body?: string;
  category: string;
  /** For research: publication, patent, funded project and so on. */
  type?: string;
  publishedAt: string;
  /** A slot in photos.json. */
  image?: string;
  /** The original source. */
  url?: string;
  featured?: boolean;
  important?: boolean;
  status: 'published' | 'draft';
  /** Only verified items count as real university updates. */
  verified: boolean;
  event?: PulseEvent;
}

export interface PulseState {
  status: 'loading' | 'ready' | 'error';
  items: PulseItem[];
  /** True when the live source failed and saved content is showing. */
  fallback: boolean;
}

const API = import.meta.env.VITE_PULSE_API as string | undefined;
const TIMEOUT_MS = 8000;
const TICKER_SIZE = 12;
const KINDS: PulseKind[] = ['announcement', 'event', 'research', 'achievement', 'highlight'];

// news.json uses broader groups, and also drives the homepage's News and events block.
const EVENT_CATEGORY: Record<string, string> = {
  Competition: 'Technical Events',
  Workshop: 'Workshops',
  Conference: 'Conferences',
  Community: 'Community',
};

const slug = (href: string) => href.replace(/\/+$/, '').split('/').pop() ?? href;

const officialEvents = (): PulseItem[] =>
  news.map((n) => ({
    id: slug(n.href),
    kind: 'event',
    title: n.title,
    summary: 'Listed on the official SRMIST events page. Open the official page for the programme, timing and venue.',
    category: EVENT_CATEGORY[n.category] ?? n.category,
    publishedAt: pulse.eventsCheckedOn,
    url: n.href,
    status: 'published',
    verified: true,
    event: { start: n.start, dateLabel: n.date },
  }));

const isItem = (value: Partial<PulseItem>) =>
  !!value.id && !!value.title && !!value.category && !!value.publishedAt && KINDS.includes(value.kind as PulseKind);

const bundled = () => [...(pulse.items as PulseItem[]), ...officialEvents()];

const dayEnd = (date: string) => new Date(`${date}T23:59:59+05:30`).getTime();

export const isUpcoming = ({ event }: PulseItem, now = Date.now()) =>
  !event || dayEnd(event.end ?? event.start) >= now;

/** What visitors may see: published entries, without events that have finished. */
export const visible = (items: PulseItem[]) => items.filter((item) => item.status === 'published' && isUpcoming(item));

const newest = (a: PulseItem, b: PulseItem) => b.publishedAt.localeCompare(a.publishedAt);
const soonest = (a: PulseItem, b: PulseItem) => (a.event?.start ?? '').localeCompare(b.event?.start ?? '');

export const byNewest = (items: PulseItem[]) => [...items].sort(newest);

export const byDate = (items: PulseItem[], order: 'soonest' | 'latest') => {
  const sorted = [...items].sort(soonest);
  return order === 'soonest' ? sorted : sorted.reverse();
};

const TICKER_ORDER: ((item: PulseItem) => boolean)[] = [
  (item) => item.kind === 'announcement' && !!item.important,
  (item) => item.kind === 'event',
  (item) => item.kind === 'research',
  (item) => item.kind === 'achievement',
  (item) => item.kind === 'announcement' || item.kind === 'highlight',
];

/**
 * The ticker's headlines, most important first. Demonstration entries never appear here,
 * because a news strip would make them read as real.
 */
export function tickerItems(items: PulseItem[]) {
  const real = visible(items).filter((item) => item.verified);
  const rank = (item: PulseItem) => TICKER_ORDER.findIndex((test) => test(item));
  return real
    .sort((a, b) => rank(a) - rank(b) || (a.kind === 'event' ? soonest(a, b) : newest(a, b)))
    .slice(0, TICKER_SIZE);
}

export const featuredItem = (items: PulseItem[]) => {
  const shown = visible(items);
  return byDate(shown.filter((item) => item.verified && item.kind === 'event'), 'soonest')[0]
    ?? shown.find((item) => item.verified)
    ?? shown.find((item) => item.featured);
};

export function search(items: PulseItem[], query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    const text = [item.title, item.summary, item.body, item.category, item.type, item.event?.dateLabel, item.event?.venue, item.event?.department]
      .filter(Boolean).join(' ').toLowerCase();
    return words.every((word) => text.includes(word));
  });
}

export const formatDate = (date: string) =>
  new Date(`${date}T12:00:00+05:30`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const pulseHref = (item: PulseItem) => `/campus-pulse/${item.id}`;

export const eventsSource = { url: pulse.eventsSourceUrl, checkedOn: pulse.eventsCheckedOn };

/* The store. Every view reads this, so a page and the ticker can never disagree. */

const saved = bundled();
let state: PulseState = API ? { status: 'loading', items: [], fallback: false } : { status: 'ready', items: saved, fallback: false };
const listeners = new Set<() => void>();

const set = (next: PulseState) => {
  state = next;
  listeners.forEach((listener) => listener());
};

export async function loadPulse() {
  if (!API) return;
  set({ ...state, status: 'loading' });
  try {
    const response = await fetch(API, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const body = (await response.json()) as { items?: PulseItem[] };
    if (!Array.isArray(body.items)) throw new Error('No items');
    set({ status: 'ready', items: body.items.filter(isItem), fallback: false });
  } catch {
    set(saved.length ? { status: 'ready', items: saved, fallback: true } : { status: 'error', items: [], fallback: false });
  }
}

if (API) void loadPulse();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const usePulse = () => useSyncExternalStore(subscribe, () => state);
