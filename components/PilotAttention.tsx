'use client';

import { useEffect, useId, useState } from 'react';
import PilotPending from '@/components/PilotPending';
import type { PanelView } from '@/lib/pilot/browse';

/**
 * The resident's outstanding decisions stay visible at the top of the desktop Overview.
 * The full forms and approval actions open in a local panel, never below a long calendar.
 * Small-screen Overview uses the same PilotPending list before the calendar.
 */
export default function PilotAttention({ panel, inline = false }: { panel: PanelView; inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const dismiss = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, [open]);
  const count = panel.pending.length;
  if (!count) return null;

  const first = panel.pending[0];
  const preview = first.type === 'ask' ? first.question : first.summary;

  return (
    <section className={inline ? 'side-attention inline' : 'side-attention'} aria-label="Waiting for you">
      <button type="button" className="side-alert" aria-controls={id} aria-expanded={open}
        onClick={() => setOpen(v => !v)}>
        <span className="side-alert-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 1.6l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.7l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z" /></svg>
          <i />
        </span>
        <span className="side-alert-copy">
          <strong>Waiting for you</strong>
          <span title={preview}>{preview}</span>
        </span>
        <span className="side-alert-number" aria-label={`${count} pending`}>{count}</span>
        <span className="side-alert-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <div id={id} className="side-alert-list" hidden={!open}>
        <PilotPending panel={panel} />
      </div>
    </section>
  );
}
