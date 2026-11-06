import data from '../data/campusPulse.json';

export type PulseKind = 'announcement' | 'event' | 'achievement' | 'research' | 'campus';
export type PulseItem = {
  id: string;
  kind: PulseKind;
  title: string;
  description: string;
  category: string;
  date?: string;
  start?: string;
  time?: string;
  venue?: string;
  organiser?: string;
  href?: string;
  imageSlot?: string;
  source: string;
  status: 'published' | 'draft';
  verified: boolean;
  featured?: boolean;
};

const items = data.items as PulseItem[];

export function publishedPulseItems() {
  return items.filter((item) => item.status === 'published' && item.verified);
}

export function pulseItems(kind?: PulseKind) {
  return publishedPulseItems().filter((item) => !kind || item.kind === kind);
}

export function upcomingPulseEvents() {
  const now = Date.now();
  return pulseItems('event')
    .filter((item) => !item.start || new Date(`${item.start}T23:59:59+05:30`).getTime() >= now)
    .sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));
}

export function tickerPulseItems() {
  const upcoming = upcomingPulseEvents();
  const rest = publishedPulseItems().filter((item) => item.kind !== 'event');
  return [...upcoming, ...rest].slice(0, 8);
}
