'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * The box at the left of an entry in the day. Checking it marks the entry done, as the resident's own press. The
 * founder set on October 12, 2026 that this box is how an entry is marked done.
 */
export default function PilotCheck({ id, label, done }: { id: string; label: string; done: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(done);
  const [busy, setBusy] = useState(false);
  async function check() {
    if (on || busy) return;
    setOn(true); setBusy(true);
    try {
      const res = await fetch('/api/pilot/entry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, done: true }) });
      if (!res.ok) setOn(false);
      else router.refresh();
    } catch { setOn(false); }
    setBusy(false);
  }
  return (
    <input type="checkbox" className="sday-check day-check" checked={on} disabled={on} aria-label={on ? `${label} is done` : `Mark ${label} done`}
      onClick={e => e.stopPropagation()} onChange={() => void check()} />
  );
}
