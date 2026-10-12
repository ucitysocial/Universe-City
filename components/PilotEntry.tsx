'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * The form on one commitment. The resident changes its name, its day, or its time here, and writes a note on it.
 * The server files each change and keeps the earlier values in the history of the entry.
 */
export default function PilotEntry({ id, label, date, start, end }: { id: string; label: string; date: string; start: string; end: string }) {
  const router = useRouter();
  const [f, setF] = useState({ label, date, start, end });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState<{ ok: boolean; text: string; about: 'entry' | 'note' } | null>(null);
  const [clash, setClash] = useState(false);

  async function send(body: Record<string, string | boolean>, about: 'entry' | 'note') {
    setBusy(true); setSaid(null);
    try {
      const res = await fetch('/api/pilot/entry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...body }) });
      const data = await res.json().catch(() => ({}));
      setClash(res.status === 409 && data.overlap === true);
      if (!res.ok) setSaid({ ok: false, text: data.error || 'Not changed. The entry is as it was. Press the button again.', about });
      else {
        setSaid({ ok: true, text: data.detail || 'The change is on file.', about });
        if (about === 'note') setNote('');
        router.refresh();
      }
    } catch {
      setSaid({ ok: false, text: 'Not changed, because the server did not answer. The entry is as it was. Press the button again.', about });
    }
    setBusy(false);
  }

  const same = f.label.trim() === label && f.date === date && f.start === start && f.end === end;
  const line = (about: 'entry' | 'note') => said && said.about === about && <p className={said.ok ? 'pt-meta' : 'pt-err'} role="status">{said.text}</p>;

  return (
    <div className="edit">
      <form className="edit-part" onSubmit={e => { e.preventDefault(); if (!same && !busy) void send(f, 'entry'); }}>
        <p className="flab">Change this entry</p>
        <div className="edit-row">
          <label className="grow">Name<input type="text" value={f.label} maxLength={120} onChange={e => setF({ ...f, label: e.target.value })} /></label>
          <label>Day<input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></label>
          <label>Start<input type="time" value={f.start} onChange={e => setF({ ...f, start: e.target.value })} /></label>
          <label>End<input type="time" value={f.end} onChange={e => setF({ ...f, end: e.target.value })} /></label>
        </div>
        <div className="pt-btns">
          <button type="submit" className="pt-btn" disabled={busy || same || !f.label.trim() || !f.date}>Save the changes</button>
          {clash && <button type="button" className="pt-btn ghost" disabled={busy} onClick={() => void send({ ...f, keepBoth: true }, 'entry')}>Keep both entries</button>}
        </div>
        {line('entry')}
      </form>
      <form className="edit-part" onSubmit={e => { e.preventDefault(); if (note.trim() && !busy) void send({ note }, 'note'); }}>
        <label className="flab" htmlFor="edit-note">Add a note</label>
        <textarea id="edit-note" value={note} rows={2} maxLength={1000} onChange={e => setNote(e.target.value)} />
        <div className="pt-btns"><button type="submit" className="pt-btn" disabled={busy || !note.trim()}>Add the note</button></div>
        {line('note')}
      </form>
    </div>
  );
}
