// Fails the build if a photo repeats on one page, or a slot points nowhere.
import { readFileSync, existsSync } from 'node:fs';

const { photos, slots } = JSON.parse(readFileSync('src/data/photos.json', 'utf8'));
const errors = [];
const seen = new Map();

for (const [slot, id] of Object.entries(slots)) {
  // Map cards sit on Home, so they count as Home.
  const page = slot.split('.')[0].replace('campus', 'home');
  const photo = photos.find((p) => p.id === id);
  if (!photo) errors.push(`${slot}: unknown photo "${id}"`);
  else if (!existsSync(`src/assets/photos/${photo.file}`)) errors.push(`${slot}: missing file ${photo.file}`);
  else if (!photo.alt || !photo.width || !photo.height) errors.push(`${photo.id}: needs alt, width and height`);
  const key = `${page}:${id}`;
  if (seen.has(key)) errors.push(`${id} repeats on ${page}: ${seen.get(key)} and ${slot}`);
  seen.set(key, slot);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Photos OK: ${Object.keys(slots).length} slots, ${photos.length} photos.`);
