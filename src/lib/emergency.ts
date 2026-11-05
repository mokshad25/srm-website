import { useSyncExternalStore } from 'react';
import data from '../data/emergency.json';

// Lives in the main bundle with no chat imports, so the sheet opens even if chat fails to load.

export type EmergencyMode = 'emergency' | 'distress';

export interface EmergencyEntry {
  id: string;
  group: string;
  label: string;
  number: string;
  tel: string;
  primary?: boolean;
  distress?: boolean;
}

export interface EmergencyState {
  open: boolean;
  mode: EmergencyMode;
  /** Set only for a question the safety check held back. Never offered in distress mode. */
  onAskAnyway?: () => void;
}

export const copy = data.copy;
export const distressCopy = data.distress;

/** The one place entries are filtered: anything unverified or without a number never renders. */
export const entries = data.entries.filter((entry) => entry.verified === true && entry.tel && entry.number) as EmergencyEntry[];

export const primaryEntry = entries.find((entry) => entry.primary)!;

/** Verified entries under their headings, without the primary number and without empty groups. */
export const groups = data.groups
  .map((group) => ({ ...group, entries: entries.filter((entry) => entry.group === group.id && !entry.primary) }))
  .filter((group) => group.entries.length > 0);

/** Mental-health support first, then the primary number, then any other flagged contact. */
export const distressEntries = entries
  .filter((entry) => entry.distress)
  .sort((a, b) => rank(a) - rank(b));

function rank(entry: EmergencyEntry) {
  if (entry.group === 'mental-health') return 0;
  return entry.primary ? 1 : 2;
}

let state: EmergencyState = { open: false, mode: 'emergency' };
const listeners = new Set<() => void>();

function set(next: EmergencyState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function openEmergency(options: { mode?: EmergencyMode; onAskAnyway?: () => void } = {}) {
  const mode = options.mode ?? 'emergency';
  set({ open: true, mode, onAskAnyway: mode === 'emergency' ? options.onAskAnyway : undefined });
}

export const closeEmergency = () => set({ ...state, open: false });
export const isEmergencyOpen = () => state.open;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

export const useEmergency = () => useSyncExternalStore(subscribe, () => state);
