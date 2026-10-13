'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PilotGuidedPlan from '@/components/PilotGuidedPlan';
import type { DemoPlan } from '@/lib/pilot/guided-demo';

type Brief = { id: string; weekly: boolean; label: string; time: string; belongs: string; href: string; kind: string; x: number; y: number; w: number; h: number };
type Full = {
  label: string; date: string; start: number | null; end: number | null; day: string; time: string;
  dept: string; folder: string; color: string; status: string; pending: string[];
  editable: boolean; notes: { id: string; said: string }[]; changes: number; plan?: DemoPlan | null; shown?: string;
};

const clock24 = (min: number | null) => (min === null ? '' : `${String(Math.floor((min % 1440) / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`);

/**
 * A small window over the calendar. Pressing an entry opens it beside the entry. Each entry shows the same fields:
 * Day, Time, Department, Folder, Status, and Pending. Below them are its notes, and a way to change the time or add a note. The whole entry, with its history, opens from a link in the window.
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
  const [clash, setClash] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState<number | null>(null);
  const [, setSize] = useState(0);

  // The whole window stays on screen. After each change of its contents, its height is measured and its top is
  // moved up as far as needed, so its lower edge sits inside the screen.
  useLayoutEffect(() => {
    if (!brief || !box.current || window.innerWidth <= 860) return;
    const h = box.current.offsetHeight;
    setTop(Math.max(12, Math.min(brief.y, window.innerHeight - h - 12)));
  });
  useEffect(() => {
    const again = () => setSize(n => n + 1);
    window.addEventListener('resize', again);
    return () => window.removeEventListener('resize', again);
  }, []);

  const load = useCallback(async (id: string, weekly = false) => {
    try {
      const res = await fetch(`/api/pilot/entry?id=${id}${weekly ? '&weekly=1' : ''}`, { cache: 'no-store' });
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
      setClash(false);
      setBrief({ id: d.pop!, weekly: d.weekly === '1', label: d.label || '', time: d.time || '', belongs: d.belongs || '', href: d.href || '#', kind: d.kind || '', x: r.left, y: r.top, w: r.width, h: r.height });
      setFull(null); setMode('view'); setSaid(null); setNote('');
      void load(d.pop!, d.weekly === '1');
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

  async function send(body: Record<string, string | boolean>, after: 'time' | 'note') {
    if (!brief) return;
    setBusy(true); setSaid(null);
    try {
      const res = await fetch('/api/pilot/entry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: brief.id, ...body }) });
      const d = await res.json().catch(() => ({}));
      setClash(res.status === 409 && d.overlap === true);
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
    return { left, top: top ?? Math.max(12, brief.y), width: W };
  })() : undefined;
  // A medication or a part of a routine shows by the name it has on the calendar. See private.ts.
  const label = full?.shown ?? full?.label ?? brief.label;

  return (
    <div className={wide ? 'pop' : 'pop sheet'} style={style} role="dialog" aria-modal="false" aria-label={label} tabIndex={-1} ref={box}>
      <div className="pop-bar" style={{ borderLeftColor: full?.color }}>
        <b>{label}</b>
        <button type="button" className="pop-x" onClick={() => setBrief(null)} aria-label="Close this window">×</button>
      </div>
      <div className="pop-body">
        {mode === 'view' && full?.plan && (
          <PilotGuidedPlan plan={full.plan} label={label} href={`/portal/guided/${brief.id}${brief.weekly ? '?weekly=1' : `?date=${full.date}`}`} onGo={() => setBrief(null)} />
        )}
        {mode !== 'view' && <p className="pop-line">{full?.day ?? ''}. {full ? full.time : brief.time}.</p>}
        <dl className="pop-fields" hidden={mode !== 'view'}>
          <dt>Day</dt><dd>{full?.day ?? ''}</dd>
          <dt>Time</dt><dd>{full ? full.time : brief.time}</dd>
          <dt>Department</dt><dd><i className="dot" style={{ background: full?.color }} />{full?.dept ?? ''}</dd>
          <dt>Folder</dt><dd>{full?.folder ?? ''}</dd>
          <dt>Status</dt><dd>{full ? full.status : brief.kind}</dd>
          <dt>Pending</dt><dd>{full ? (full.pending.length ? full.pending.join(', ') : 'None') : ''}</dd>
        </dl>
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
              {clash && <button type="button" className="pt-btn ghost" disabled={busy} onClick={() => void send({ ...f, keepBoth: true } as any, 'time')}>Keep both entries</button>}
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
            {brief.weekly && <p className="pop-meta">Tell the agent to change an item that repeats each week.</p>}
          </div>
        )}
        <Link className="pop-open" href={brief.href} onClick={() => setBrief(null)}>Open the whole entry{full && full.changes ? `, with ${full.changes} ${full.changes === 1 ? 'change' : 'changes'} in its history` : ''}</Link>
      </div>
    </div>
  );
}
