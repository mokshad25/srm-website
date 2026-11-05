import { useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { closeEmergency, useEmergency } from '../../lib/emergency';
import EmergencyContent from './EmergencyContent';

/** A native modal dialog: the top layer sits above the preloader and chat, and it traps focus and handles Esc. */
export default function EmergencySheet() {
  const { open, mode, onAskAnyway } = useEmergency();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current) closeEmergency();
  };

  return (
    <dialog
      ref={dialog}
      role="dialog"
      aria-labelledby="emergency-title"
      data-emergency-sheet
      data-lock-scroll
      onClose={closeEmergency}
      onClick={onClick}
      className="emergency-sheet on-light fixed inset-x-0 bottom-0 top-auto m-0 max-h-dvh w-full max-w-none overflow-y-auto border-t-4 border-danger bg-white text-ink backdrop:bg-night/60 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[94dvh] sm:max-w-[30rem] sm:-translate-x-1/2 sm:-translate-y-1/2"
    >
      {open && (
        <div className="relative p-6">
          <button
            type="button"
            onClick={closeEmergency}
            className="absolute top-5 right-5 min-h-11 border border-ink px-3 text-14 font-semibold hover:bg-ink hover:text-off-white"
          >
            Close
          </button>
          <EmergencyContent mode={mode} titleId="emergency-title" onAskAnyway={onAskAnyway} />
        </div>
      )}
    </dialog>
  );
}
