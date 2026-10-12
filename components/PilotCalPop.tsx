'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Brief = { id: string; weekly: boolean; label: string; time: string; belongs: string; href: string; kind: string; x: number; y: number; w: number; h: number };
type Full = { label: string; date: string; start: number | null; end: number | null; time: string; belongs: string; color: string; state: string; editable: boolean; said: string | null; notes: { id: string; said: string }[]; changes: number };

const clock24 = (min: number | null) => (min === null ? '' : `${String(Math.floor((min % 1440) / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`);

/**
 * A small window over the calendar. Pressing an entry opens it beside the entry, with its time and folder, its notes,
 * and a way to change the time or add a note. The whole entry, with its history, opens from a link in the window.
 * On a narrow screen the window rises from the bottom of the screen. Escape and a press outside close it.
 */
export default function PilotCalPop() {
  const router = useRouter();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [full, setFull] = useState<Full | null>(null);
  const [mode, setMode] = useState<'view' | 'time' | 'note'>('view');
  const [f, setF] = useState({ date: '', start: '', end: '' });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/pilot/entry?id=${id}`, { cache: 'no-store' });
      if (!res.ok) return;
      const d = (await res.json()) as Full;
      setFull(d);
      setF({ date: d.date, start: clock24(d.start), end: clock24(d.end) });
    } catch { /* the window keeps what the calendar showed */ }
  }, []);

  // One listener for the whole page. An entry on the calendar opens the window. A press with a modifier key, or on a
  // day, keeps the usual link.
  useEffect(() => {
    const open = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== 'Enter' && e.key !== ' ') return;
      if (e instanceof MouseEvent && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) return;
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-pop]');
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      const r = el.getBoundingClientRect();
      const d = el.dataset;
      setBrief({ id: d.pop!, weekly: d.weekly === '1', label: d.label || '', time: d.time || '', belongs: d.belongs || '', href: d.href || '#', kind: d.kind || '', x: r.left, y: r.top, w: r.width, h: r.height });
      setFull(null); setMode('view'); setSaid(null); setNote('');
      if (d.weekly !== '1') void load(d.pop!);
    };
    document.addEventListener('click', open, true);
    document.addEventListener('keydown', open, true);
    return () => { document.removeEventListener('click', open, true); document.removeEventListener('keydown', open, true); };
  }, [load]);

  // Escape, a press outside, and a change of page close it.
  useEffect(() => {
    if (!brief) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setBrief(null); };
    const out = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node) && !(e.target as HTMLElement).closest?.('[data-pop]')) setBrief(null); };
    document.addEventListener('keydown', key);
    document.addEventListener('mousedown', out);
    setTimeout(() => box.current?.focus(), 0);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('mousedown', out); };
  }, [brief]);

  async function send(body: Record<string, string>, after: 'time' | 'note') {
    if (!brief) return;
    setBusy(true); setSaid(null);
    try {
      const res = await fetch('/api/pilot/entry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: brief.id, ...body }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) setSaid({ ok: false, text: d.error || 'Not changed. The entry is as it was.' });
      else {
        setSaid({ ok: true, text: d.detail || 'The change is on file.' });
        if (after === 'note') setNote('');
        setMode('view');
        await load(brief.id);
        router.refresh();
      }
    } catch {
      setSaid({ ok: false, text: 'Not changed, because the server did not answer. The entry is as it was.' });
    }
    setBusy(false);
  }

  if (!brief) return null;

  // Beside the entry on a wide screen: to its right when there is room, otherwise to its left, kept on screen.
  const W = 360;
  const wide = typeof window !== 'undefined' && window.innerWidth > 860;
  const style = wide ? (() => {
    const right = brief.x + brief.w + 10;
    const left = right + W < window.innerWidth - 12 ? right : Math.max(12, brief.x - W - 10);
    const top = Math.min(Math.max(12, brief.y), window.innerHeight - 380);
    return { left, top, width: W };
  })() : undefined;
  const label = full?.label ?? brief.label;

  return (
    <div className={wide ? 'pop' : 'pop sheet'} style={style} role="dialog" aria-modal="false" aria-label={label} tabIndex={-1} ref={box}>
      <div className="pop-bar" style={{ borderLeftColor: full?.color }}>
        <b>{label}</b>
        <button type="button" className="pop-x" onClick={() => setBrief(null)} aria-label="Close this window">×</button>
      </div>
      <div className="pop-body">
        <p className="pop-time">{full ? full.time : brief.time}</p>
        <p className="pop-meta">{full?.belongs ?? brief.belongs}. {full ? full.state : brief.kind}.</p>
        {full?.said && <p className="pop-said">{full.said}</p>}
        {full && full.notes.length > 0 && (
          <div className="pop-notes">
            {full.notes.map(n => <p key={n.id}>{n.said}</p>)}
          </div>
        )}
        {said && <p className={said.ok ? 'pop-ok' : 'pt-err'} role="status">{said.text}</p>}

        {mode === 'time' && full && (
          <form className="pop-form" onSubmit={e => { e.preventDefault(); if (!busy) void send(f, 'time'); }}>
            <label>Day<input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></label>
            <div className="pop-two">
              <label>Start<input type="time" value={f.start} onChange={e => setF({ ...f, start: e.target.value })} /></label>
              <label>End<input type="time" value={f.end} onChange={e => setF({ ...f, end: e.target.value })} /></label>
            </div>
            <div className="pt-btns">
              <button type="submit" className="pt-btn" disabled={busy || !f.date}>Save the new time</button>
              <button type="button" className="pt-btn ghost" onClick={() => setMode('view')}>Keep it as it is</button>
            </div>
          </form>
        )}
        {mode === 'note' && (
          <form className="pop-form" onSubmit={e => { e.preventDefault(); if (note.trim() && !busy) void send({ note }, 'note'); }}>
            <label htmlFor="pop-note" className="vh">Your note</label>
            <textarea id="pop-note" rows={3} maxLength={1000} value={note} onChange={e => setNote(e.target.value)} />
            <div className="pt-btns">
              <button type="submit" className="pt-btn" disabled={busy || !note.trim()}>Add the note</button>
              <button type="button" className="pt-btn ghost" onClick={() => setMode('view')}>Keep it as it is</button>
            </div>
          </form>
        )}
        {mode === 'view' && (
          <div className="pop-acts">
            {full?.editable && <button type="button" className="pt-btn" onClick={() => setMode('time')}>Change the time</button>}
            {full?.editable && <button type="button" className="pt-btn ghost" onClick={() => setMode('note')}>Add a note</button>}
            {brief.weekly && <p className="pop-meta">This repeats each week. Tell the guide to change it.</p>}
          </div>
        )}
        <Link className="pop-open" href={brief.href} onClick={() => setBrief(null)}>Open the whole entry{full && full.changes ? `, with ${full.changes} ${full.changes === 1 ? 'change' : 'changes'} in its history` : ''}</Link>
      </div>
    </div>
  );
}
