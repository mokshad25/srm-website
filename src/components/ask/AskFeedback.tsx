import { useState } from 'react';
import type { FormEvent } from 'react';
import { AskError, sendFeedback } from '../../lib/askSrm';
import type { Turn } from './AskProvider';
import { useAsk } from './AskProvider';

const Thumb = ({ down }: { down?: boolean }) => (
  <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className={down ? 'rotate-180' : ''}>
    <path d="M7 10v11H3V10h4Zm0 0 4-8a3 3 0 0 1 3 3v4h6a1.5 1.5 0 0 1 1.47 1.8l-1.8 9A1.5 1.5 0 0 1 18.2 21H7" />
  </svg>
);

/** The backend has no update route, so the rating and comment go in one request. */
export default function AskFeedback({ turn, messageId }: { turn: Turn; messageId: string }) {
  const { markFeedbackSent } = useAsk();
  const [rating, setRating] = useState<1 | 5 | null>(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  if (turn.feedbackSent) return <p className="mt-4 text-14" role="status">Thanks for the feedback.</p>;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!rating) return;
    setSending(true);
    setError('');
    try {
      await sendFeedback(messageId, rating, comment.trim());
      markFeedbackSent(turn.id);
    } catch (failure) {
      setError(failure instanceof AskError ? failure.message : "Your feedback couldn't be sent.");
      setSending(false);
    }
  };

  const thumb = (value: 1 | 5) =>
    `border p-2 ${rating === value ? 'border-ink bg-ink text-off-white' : 'border-ink/40 hover:border-ink'}`;

  return (
    <form onSubmit={onSubmit} className="mt-4" data-ask-feedback>
      <div role="group" aria-label="Was this helpful?" className="flex items-center gap-2 text-14">
        <span aria-hidden>Helpful?</span>
        <button type="button" aria-label="Yes, helpful" aria-pressed={rating === 5} className={thumb(5)} onClick={() => setRating(5)}>
          <Thumb />
        </button>
        <button type="button" aria-label="No, not helpful" aria-pressed={rating === 1} className={thumb(1)} onClick={() => setRating(1)}>
          <Thumb down />
        </button>
      </div>
      {rating && (
        <div className="mt-3 grid gap-2">
          <label htmlFor={`ask-comment-${turn.id}`} className="text-14 font-semibold">Anything to add? (optional)</label>
          <textarea
            id={`ask-comment-${turn.id}`}
            rows={2}
            maxLength={2000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="w-full border border-ink/40 px-3 py-2 text-14"
          />
          <button type="submit" disabled={sending} className="justify-self-start border-2 border-ink px-4 py-1.5 text-14 font-bold hover:bg-ink hover:text-off-white">
            Send feedback
          </button>
          {error && <p className="text-14" role="alert">{error}</p>}
        </div>
      )}
    </form>
  );
}
