import support from '../data/support.json';
import type { AskSource } from './askSrm';

const { general, topics } = support.followUps;
const SHOWN = 3;
const QUESTION_WEIGHT = 3;

const key = (text: string) => text.trim().toLowerCase();
const matches = (keyword: string, text: string) => new RegExp(`\\b${keyword}`, 'i').test(text);
const hits = (keywords: string[], text: string) => keywords.filter((keyword) => matches(keyword, text)).length;

/**
 * Picks what to suggest next. The API returns no suggestions, so these come from a curated list of
 * questions the indexed pages have answered, matched on the question and the pages behind its answer.
 * The question counts for more, because a source page often covers several topics.
 */
export function followUps(question: string, sources: AskSource[], asked: string[]): string[] {
  const titles = sources.map((source) => source.title).join(' ');
  const seen = new Set(asked.map(key));
  const ranked = topics
    .map((topic) => ({ topic, score: hits(topic.keywords, question) * QUESTION_WEIGHT + hits(topic.keywords, titles) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  const pool = [...ranked.flatMap(({ topic }) => topic.questions), ...general];
  return [...new Set(pool)].filter((candidate) => !seen.has(key(candidate))).slice(0, SHOWN);
}
