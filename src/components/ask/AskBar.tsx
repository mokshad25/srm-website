import { useState } from 'react';
import type { FormEvent } from 'react';
import examples from '../../data/askExamples.json';
import { checkSafety } from '../../lib/safety';
import AskExamples from './AskExamples';
import { useAsk } from './AskProvider';
import { SearchIcon } from './AskTrigger';

/** The single-line question field in the Home hero. Answers open in the chat widget. */
export default function AskBar() {
  const { submit, busy } = useAsk();
  const [value, setValue] = useState('');

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    // While an answer loads, ordinary text stays in the field. A safety match never waits.
    if (!value.trim() || (busy && !checkSafety(value))) return;
    submit(value);
    setValue('');
  };

  return (
    <div className="max-w-[720px]">
      <form onSubmit={onSubmit} className="flex">
        <label htmlFor="ask-hero" className="sr-only">Ask SRM a question</label>
        <input
          id="ask-hero"
          data-ask-bar
          type="text"
          value={value}
          maxLength={2000}
          autoComplete="off"
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask SRM about admissions, hostels, programmes…"
          className="min-w-0 flex-1 border-2 border-r-0 border-ink bg-white px-4 py-3 text-17 text-ink placeholder:text-ink/70"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-2 border-2 border-ink bg-amber px-5 py-3 text-17 font-bold text-ink transition-colors duration-200 hover:bg-ink hover:text-off-white"
        >
          <SearchIcon />
          Ask
        </button>
      </form>
      <div className="mt-3">
        <AskExamples questions={examples.home} tone="light" oneRow />
      </div>
    </div>
  );
}
