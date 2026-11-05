import support from '../../data/support.json';

const { contacts } = support;

/** SRM's published contacts only. There is no live agent or queue behind this. */
export default function TalkToPerson({ onBack }: { onBack: () => void }) {
  return (
    <div className="grid gap-4" data-talk-card>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-17 font-bold">{contacts.title}</h3>
        <button type="button" onClick={onBack} className="min-h-11 rounded-full border border-srm-blue px-4 text-14 font-bold text-srm-blue hover:bg-srm-blue hover:text-off-white">
          Back to chat
        </button>
      </div>
      <p className="text-14">{contacts.note}</p>
      {contacts.hours && <p className="text-14 font-semibold">{contacts.hours}</p>}
      <ul className="grid gap-2">
        {contacts.channels.map((channel) => (
          <li key={channel.id} className="rounded-2xl border border-ink/10 bg-white px-4 py-2">
            <p className="text-14 font-bold">{channel.label}</p>
            <a href={`tel:${channel.tel}`} className="flex min-h-11 items-center text-14 font-semibold text-srm-blue underline underline-offset-2">{channel.phone}</a>
            {channel.email && (
              <a href={`mailto:${channel.email}`} className="flex min-h-11 items-center text-14 break-all text-srm-blue underline underline-offset-2">{channel.email}</a>
            )}
          </li>
        ))}
      </ul>
      <p className="text-12">
        Source:{' '}
        <a href={contacts.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold text-srm-blue underline underline-offset-2">
          {contacts.sourceLabel}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    </div>
  );
}
