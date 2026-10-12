'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PHRASE = 'clear my test data';

export default function PilotClear() {
  const router = useRouter();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function clear() {
    setBusy(true); setNote(null);
    try {
      const res = await fetch('/api/pilot/clear', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phrase: typed })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setNote(data.error || 'Nothing was cleared. Press the button again.');
      else { setNote('Your test data is cleared. Your login is unchanged.'); setTyped(''); router.refresh(); }
    } catch {
      setNote('Nothing was cleared, because the server did not answer. Press the button again.');
    }
    setBusy(false);
  }

  return (
    <div className="pt-card">
      <p className="pt-said">
        This removes every message, every entry, and the whole activity list that the test holds for your login.
        It cannot be reversed. Your login stays.
      </p>
      <div className="field" style={{ marginTop: 12, marginBottom: 8, maxWidth: 360 }}>
        <label htmlFor="clear-phrase">Type the words clear my test data</label>
        <input id="clear-phrase" value={typed} onChange={e => setTyped(e.target.value)} autoComplete="off" />
      </div>
      <button type="button" className="pt-btn" disabled={busy || typed.trim().toLowerCase() !== PHRASE} onClick={clear}>
        Clear my test data
      </button>
      {note && <p className="pt-meta" style={{ marginTop: 8 }}>{note}</p>}
    </div>
  );
}
