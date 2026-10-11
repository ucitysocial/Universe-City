'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** Two buttons for one waiting item. The server files the decision. The screen shows what the server answered. */
export default function PilotDecide({
  id, kind, desk = false, onDone
}: { id: string; kind: string; desk?: boolean; onDone?: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function send(decision: 'confirm' | 'decline') {
    setBusy(true); setErr(null);
    try {
      const res = await fetch('/api/pilot/decide', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, decision, desk })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setErr(data.error || 'The decision was not filed. Nothing changed. Press the button again.');
      else { setSaid(data.detail || 'The decision is on file.'); onDone?.(); router.refresh(); }
    } catch {
      setErr('The decision was not filed, because the server did not answer. Nothing changed. Press the button again.');
    }
    setBusy(false);
  }

  if (said) return <p className="pt-meta">{said}</p>;
  const plan = kind === 'confirm_plan';
  const yes = desk ? 'Confirm this proposal' : plan ? 'Confirm this Plan' : 'Confirm this entry';
  const no = desk ? 'Decline this proposal' : plan ? 'Decline this Plan' : 'Decline this entry';
  return (
    <div>
      <div className="pt-btns">
        <button type="button" className="pt-btn" disabled={busy} onClick={() => send('confirm')}>{yes}</button>
        <button type="button" className="pt-btn ghost" disabled={busy} onClick={() => send('decline')}>{no}</button>
      </div>
      {err && <p className="pt-err">{err}</p>}
    </div>
  );
}
