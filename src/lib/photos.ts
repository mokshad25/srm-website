import data from '../data/photos.json';

export interface PhotoEntry {
  id: string;
  file: string;
  width: number;
  height: number;
  alt: string;
  source: string;
}

const manifest = data as {
  photos: PhotoEntry[];
  // slot key ("engineering.hero") -> photo id. Slot prefix is the page.
  slots: Record<string, string>;
};

const urls = import.meta.glob('../assets/photos/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export interface ResolvedPhoto extends PhotoEntry {
  src: string;
}

/** Returns the photo assigned to a slot, or null so the block can hide itself. */
export function photoFor(slot: string): ResolvedPhoto | null {
  const id = manifest.slots[slot];
  const entry = manifest.photos.find((p) => p.id === id);
  if (!entry) return null;
  const src = urls[`../assets/photos/${entry.file}`];
  return src ? { ...entry, src } : null;
}
