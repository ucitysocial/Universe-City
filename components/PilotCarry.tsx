'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Answer } from '@/components/PilotPanelBits';

/**
 * One task from an earlier day that is not marked done. The resident marks it done, or writes when it gets done and
 * the agent moves it there.
 */
export default function PilotCarry({ id, label, from, href }: { id: string; label: string; from: string; href: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState<string | null>(null);

  async function done() {
    setBusy(true); setSaid(null);
    try {
      const res = await fetch('/api/pilot/entry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, done: true }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) setSaid(d.error || 'Not marked. The entry is as it was.');
      else router.refresh();
    } catch {
      setSaid('Not marked, because the server did not answer.');
    }
    setBusy(false);
  }

  return (
    <div className="pn-need carry">
      <p className="carry-h"><span className="carry-k">To schedule</span><Link href={href}>{label}</Link><em>{from}</em></p>
      <p className="carry-q">When can it get done? Write a day and a time, or that it moves or comes off.</p>
      <Answer question={`${label}: when can it get done?`} />
      <button type="button" className="pt-btn ghost carry-done" disabled={busy} onClick={() => void done()}>Mark it done</button>
      {said && <p className="pt-err" role="status">{said}</p>}
    </div>
  );
}
