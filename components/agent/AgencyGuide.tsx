'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Need } from '@/lib/agent/types';

type Action = { label: string; why: string; direction: string };
type Line =
  | { id: string; who: 'agent'; text: string }
  | { id: string; who: 'guide'; text: string; message: string | null; actions: Action[] }
  | { id: string; who: 'sent'; text: string; ok: boolean };

const KIND: Record<Need['kind'], string> = {
  carried: 'To schedule', pushed: 'Pushed twice or more', decision: 'Waits for the client', team: 'Waits for a person on the team',
  follow_up: 'Follow up', outcome: 'No outcome yet', missing: 'Missing pieces', stuck: 'Hard to start'
};

/**
 * The Agency Guide, on the right of the frame when a person on the team opens a client. The founder set it on
 * October 13, 2026. The person writes what they notice or want to say. The guide answers with what to do and why,
 * a message, and next moves for the automated agent. Every message to the client goes through the automated agent,
 * so the client sees one agent and confirms each change.
 *
 * The thread with the guide is kept in this browser tab only, and it is gone when the tab closes.
 */
export default function AgencyGuide({ clientId, clientName, needs }: { clientId: string; clientName: string; needs: Need[] }) {
  const first = clientName.split(' ')[0] || 'the client';
  const KEY = `uc:guide:${clientId}`;
  const [lines, setLines] = useState<Line[]>([]);
  const [draft, setDraft] = useState('');
  const [work, setWork] = useState<'ask' | 'send' | null>(null);
  const busy = work !== null;
  const [err, setErr] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const boxId = useId();
  const path = usePathname() || '';
  const router = useRouter();

  useEffect(() => {
    try { const raw = sessionStorage.getItem(KEY); setLines(raw ? JSON.parse(raw) : []); } catch { setLines([]); }
  }, [KEY]);
  const keep = (next: Line[]) => {
    setLines(next);
    try { sessionStorage.setItem(KEY, JSON.stringify(next.slice(-40))); } catch { /* kept until the page reloads */ }
  };
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [lines.length, busy]);

  async function ask(text: string) {
    const said = text.trim();
    if (!said || busy) return;
    const mine: Line = { id: crypto.randomUUID(), who: 'agent', text: said };
    const now = [...lines, mine];
    keep(now); setDraft(''); setWork('ask'); setErr(null);
    const thread = now.filter(l => l.who !== 'sent').map(l => ({ who: l.who, text: l.who === 'guide' ? [l.text, l.message ? `Message: ${l.message}` : ''].filter(Boolean).join('\n') : l.text }));
    try {
      const res = await fetch('/api/agent/guide', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ thread }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error || 'The Agency Guide did not answer. Ask again.'); setWork(null); return; }
      keep([...now, { id: crypto.randomUUID(), who: 'guide', text: data.reply || '', message: data.message || null, actions: Array.isArray(data.actions) ? data.actions : [] }]);
    } catch {
      setErr('The server did not answer in time. Ask again.');
    }
    setWork(null);
  }

  // The direction goes to the automated agent, which writes the message to the client in its own words.
  async function send(direction: string) {
    if (busy) return;
    setWork('send'); setErr(null);
    window.dispatchEvent(new CustomEvent('uc:going', { detail: true }));
    let line: Line;
    try {
      const res = await fetch('/api/agent/say', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: direction, key: crypto.randomUUID() }) });
      const data = await res.json().catch(() => ({}));
      const body = data?.reply?.body as string | undefined;
      line = res.ok && body
        ? { id: crypto.randomUUID(), who: 'sent', ok: true, text: body }
        : { id: crypto.randomUUID(), who: 'sent', ok: false, text: data.why || data.error || 'The agent wrote no message.' };
    } catch {
      line = { id: crypto.randomUUID(), who: 'sent', ok: false, text: 'The server did not answer in time. The conversation shows what the server holds once it loads.' };
    }
    keep([...lines, line]);
    window.dispatchEvent(new CustomEvent('uc:going', { detail: false }));
    window.dispatchEvent(new Event('uc:thread'));
    router.refresh();
    setWork(null);
  }

  // The message is put in the box under the conversation, to edit before it is sent.
  function editFirst(text: string) {
    try { sessionStorage.setItem('uc:draft', JSON.stringify({ text })); } catch { /* the box opens empty */ }
    if (path === '/portal/home') window.dispatchEvent(new Event('uc:draft'));
    else router.push('/portal/home');
  }

  return (
    <div className="gd">
      {needs.length > 0 && (
        <section className="win gd-wait">
          <div className="win-bar">Waiting on {first}</div>
          <ul>
            {needs.map(n => (
              <li key={n.id}>
                <span className="gd-kind">{KIND[n.kind]}</span>
                <b>{n.title}</b>
                <p>{n.why} <span className="gd-src">From {n.source}.</span></p>
                <button type="button" className="pt-btn ghost" disabled={busy}
                  onClick={() => ask(`What should I do about this: ${n.title}. ${n.why}`)}>Ask what to do</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="gd-talk" aria-label={`The Agency Guide on ${first}`}>
        {lines.length === 0 && (
          <div className="gd-empty">
            <p>Write what you notice about {first}, or what you want to say. The Agency Guide reads {first}&apos;s File and the conversation the way the automated agent reads them. It tells you what to do and why, and drafts the message. The automated agent sends every message in its own words, and {first} confirms each change.</p>
            <div className="pt-btns">
              <button type="button" className="pt-btn ghost" onClick={() => ask(`Prepare me for a check in with ${first} today. What should I ask first, and why?`)}>Prepare a check in</button>
              <button type="button" className="pt-btn ghost" onClick={() => ask(`Read ${first}'s day today. Is there a conflict, a missing piece, or an entry pushed again?`)}>Review today</button>
            </div>
          </div>
        )}
        {lines.map(l => {
          if (l.who === 'agent') return <p key={l.id} className="gd-me">{l.text}</p>;
          if (l.who === 'sent') return (
            <div key={l.id} className={l.ok ? 'gd-sent' : 'gd-sent no'}>
              <span>{l.ok ? `The agent sent this to ${first}` : 'Not sent'}</span>
              <p>{l.text}</p>
            </div>
          );
          return (
            <div key={l.id} className="gd-says">
              <p>{l.text}</p>
              {l.message && (
                <div className="gd-msg">
                  <span>Message for {first}</span>
                  <p>{l.message}</p>
                  <div className="pt-btns">
                    <button type="button" className="pt-btn" disabled={busy} onClick={() => send(l.message!)}>Send through the agent</button>
                    <button type="button" className="pt-btn ghost" onClick={() => editFirst(l.message!)}>Edit the message</button>
                  </div>
                </div>
              )}
              {l.actions.length > 0 && (
                <ul className="gd-acts">
                  {l.actions.map((a, i) => (
                    <li key={i}>
                      <b>{a.label}</b>
                      <p>{a.why}</p>
                      <button type="button" className="pt-btn ghost" disabled={busy} onClick={() => send(a.direction)}>Ask {first} through the agent</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {work && <p className="gd-busy">{work === 'ask' ? 'The Agency Guide is reading the File' : `The agent is writing to ${first}`}</p>}
        {err && <p className="pt-err">{err}</p>}
        <div ref={end} />
      </section>

      <form className="gd-box" onSubmit={e => { e.preventDefault(); void ask(draft); }}>
        <label className="vh" htmlFor={boxId}>Write to the Agency Guide</label>
        <textarea id={boxId} rows={3} value={draft} onChange={e => setDraft(e.target.value)} placeholder={`What you notice about ${first}, or what you want to say`}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void ask(draft); } }} />
        <div className="gd-box-row">
          {lines.length > 0 && <button type="button" className="pt-link" onClick={() => keep([])}>Clear the thread</button>}
          <button type="submit" className="pt-btn" disabled={busy || !draft.trim()}>Ask the Agency Guide</button>
        </div>
      </form>
    </div>
  );
}
