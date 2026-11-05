// Client for the Ask SRM API. The browser only talks to /api/chat, /api/feedback
// and /api/health; keys stay on the server.

export type AskStatus = 'answered' | 'unverified' | 'out_of_scope' | 'needs_clarification' | 'conflicting';

export interface AskSource {
  source_id: string;
  title: string;
  url: string;
  academic_year: string | null;
  category: string;
  campus: string;
  published_date: string | null;
  last_verified_at: string | null;
  similarity: number;
}

export interface AskResponse {
  answer: string;
  session_id: string;
  message_id: string | null;
  sources: AskSource[];
  status: AskStatus;
}

export type AskErrorKind = 'invalid' | 'rate_limited' | 'unavailable' | 'timeout' | 'offline';

const MESSAGES: Record<AskErrorKind, string> = {
  invalid: "That question couldn't be read. Try rephrasing it, in under 2,000 characters.",
  rate_limited: "You've asked a lot of questions in a short time. Please wait a moment and try again.",
  unavailable: "Ask SRM isn't available right now. Please try again shortly.",
  timeout: 'That took too long to answer. Please try again.',
  offline: "You seem to be offline. Check your connection and try again.",
};

export class AskError extends Error {
  kind: AskErrorKind;

  constructor(kind: AskErrorKind, message = MESSAGES[kind]) {
    super(message);
    this.kind = kind;
  }
}

const BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '');
const TIMEOUT_MS = 25_000;
const SESSION_KEY = 'ask-srm-session';

export const clearSession = () => sessionStorage.removeItem(SESSION_KEY);

function rateLimitMessage(retryAfter: string | null) {
  const seconds = Number(retryAfter);
  if (!retryAfter || !Number.isFinite(seconds) || seconds <= 0) return MESSAGES.rate_limited;
  return `You've asked a lot of questions in a short time. Please try again in about ${Math.ceil(seconds)} seconds.`;
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  if (!navigator.onLine) throw new AskError('offline');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new AskError('timeout');
    throw new AskError(navigator.onLine ? 'unavailable' : 'offline');
  } finally {
    clearTimeout(timer);
  }
  if (response.ok) return response;
  if (response.status === 422) throw new AskError('invalid');
  if (response.status === 429) throw new AskError('rate_limited', rateLimitMessage(response.headers.get('Retry-After')));
  throw new AskError('unavailable');
}

const postJson = (path: string, body: unknown) =>
  request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export async function ask(question: string): Promise<AskResponse> {
  const response = await postJson('/api/chat', {
    question,
    session_id: sessionStorage.getItem(SESSION_KEY),
    campus: 'Kattankulathur',
    // A hard filter on the backend, so it is set only when the question names a year.
    academic_year: null,
  });
  const body = (await response.json()) as AskResponse;
  sessionStorage.setItem(SESSION_KEY, body.session_id);
  return body;
}

export async function sendFeedback(messageId: string, rating: number, comment?: string): Promise<void> {
  await postJson('/api/feedback', { message_id: messageId, rating, comment: comment || undefined });
}

export async function health(): Promise<boolean> {
  try {
    const response = await request('/api/health');
    return ((await response.json()) as { status?: string }).status === 'healthy';
  } catch {
    return false;
  }
}
