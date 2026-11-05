import keywords from '../data/emergencyKeywords.json';
import type { EmergencyMode } from './emergency';

const WORD = '[\\p{L}\\p{M}\\p{N}]';

/** Lowercase words separated by single spaces. Apostrophes go, so "I'm" and "don't" read as im and dont. */
function normalise(text: string) {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .trim();
}

function compile(list: string[]) {
  const phrases = list.map((entry) => {
    const open = entry.endsWith('*');
    const phrase = normalise(open ? entry.slice(0, -1) : entry);
    return open ? `${phrase}${WORD}*` : phrase;
  });
  return new RegExp(`(?:^| )(?:${phrases.join('|')})(?= |$)`, 'u');
}

const distress = compile(keywords.distress);
const emergency = compile(keywords.emergency);

/** Distress wins when both match, because it has no bypass. */
export function checkSafety(text: string): EmergencyMode | null {
  const clean = normalise(text);
  if (distress.test(clean)) return 'distress';
  return emergency.test(clean) ? 'emergency' : null;
}
