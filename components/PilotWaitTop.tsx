'use client';

import { useState } from 'react';
import PilotGlyph from '@/components/PilotGlyph';
import PilotPending from '@/components/PilotPending';
import type { PanelView } from '@/lib/pilot/browse';

/**
 * What waits for the resident, at the top of the overview, above the day. The founder set on October 13, 2026 that it
 * is seen without scrolling. The first item shows with its answer box. The rest open with one press.
 */
export default function PilotWaitTop({ panel }: { panel: PanelView }) {
  const [all, setAll] = useState(false);
  const n = panel.pending.length;
  if (!n) return null;
  const shown = all ? panel : { ...panel, pending: panel.pending.slice(0, 1), more: 0 };
  return (
    <section className="wait-top" aria-label="Waiting for you">
      <div className="wait-top-h">
        <PilotGlyph name="speech" size={24} />
        <b>{n === 1 ? 'One answer needed' : `${n} answers needed`}</b>
        {n > 1 && <button type="button" className="gl-ghost" onClick={() => setAll(a => !a)}>{all ? 'Show one' : `Show all ${n}`}</button>}
      </div>
      <div className="dash-pending"><PilotPending panel={shown} /></div>
    </section>
  );
}
