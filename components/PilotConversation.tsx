'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PilotDecide, { goOnAfterPress } from '@/components/PilotDecide';

type Effect = { tool: string; outcome: string; brief: string; href?: string | null };
type Msg = {
  id: string; speaker: 'resident' | 'software' | 'agent'; body: string; created_at: string;
  removed: string[] | null; reply_to: string | null; key: string | null;
  turn: { state: string; effects: Effect[] } | null;
  unsent?: boolean;
};
type Press = { id: string; at: string; brief: string; href?: string | null };
type Waiting = { id: string; kind: string; summary: string };
type Thread = { messages: Msg[]; more: boolean; presses?: Press[]; waiting: Waiting[]; noticeSeen: boolean; ownAccount?: boolean };

// The first word of a short line says what happened. It becomes the small label, and the rest is the line.
const TONE: Record<string, string> = {
  Filed: 'filed', Updated: 'filed', Confirmed: 'filed', Closed: 'unknown', 'Taken off': 'unknown', Declined: 'unknown',
  'No change': 'unknown', 'Waiting for you': 'wait', 'For your agent': 'agent', 'Left off the File': 'no', 'Did not work': 'no'
};
function parts(brief: string): { word: string; tone: string; line: string } {
  const i = brief.indexOf(': ');
  const word = i > 0 ? brief.slice(0, i) : '';
  return TONE[word] ? { word, tone: TONE[word], line: brief.slice(i + 2) } : { word: 'Done', tone: 'unknown', line: brief };
}

const dayOf = (iso: string) => new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const clockOf = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

/** One short line for each action of a reply. A line leads to its entry in the File. A refused action is left to the Activity screen. */
function Effects({ list }: { list: Effect[] }) {
  const shown = list.filter(e => e.outcome !== 'refused');
  if (!shown.length) return null;
  return (
    <ul className="pt-effects">
      {shown.map((e, i) => {
        const p = parts(e.brief);
        return (
          <li key={i}>
            <span className={`pt-chip ${p.tone}`}>{p.word}</span>
            {e.href ? <Link href={e.href}>{p.line}</Link> : <span>{p.line}</span>}
          </li>
        );
      })}
    </ul>
  );
}

/** What the resident has open on the screen, in the words of the path. The guide is told, so a message can rest on it. */
function viewing(): string | null {
  const el = document.getElementById('uc-path');
  const text = el?.getAttribute('data-path') || '';
  return text ? text.slice(0, 180) : null;
}

export default function PilotConversation({ initial, mode = 'page' }: { initial?: Thread; mode?: 'page' | 'side' }) {
  const router = useRouter();
  const side = mode === 'side';
  const [thread, setThread] = useState<Thread | null>(initial ?? null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [goingOn, setGoingOn] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [unsent, setUnsent] = useState<Msg | null>(null);
  const [fresh, setFresh] = useState(false);
  const stream = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  const atEnd = useRef(true);        // the reader is at the newest message
  const opened = useRef(false);

  const load = useCallback(async (): Promise<Thread | null> => {
    try {
      const res = await fetch('/api/pilot/thread', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = (await res.json()) as Thread;
      setThread(data);
      return data;
    } catch { return null; }
  }, []);

  // Beside the File, the conversation is loaded when the side opens.
  useEffect(() => { if (!initial) void load(); }, [initial, load]);

  // A press on a button elsewhere on the screen changes the conversation. It is loaded again.
  useEffect(() => {
    const again = () => { void load(); };
    window.addEventListener('uc:thread', again);
    return () => window.removeEventListener('uc:thread', again);
  }, [load]);

  const toEnd = useCallback(() => {
    const el = stream.current;
    if (el) el.scrollTop = el.scrollHeight;
    atEnd.current = true;
    setFresh(false);
  }, []);

  // New messages are brought into view for a reader who is at the end. A reader who scrolled up to read stays there.
  const count = (thread?.messages.length ?? 0) + (thread?.presses?.length ?? 0);
  useLayoutEffect(() => {
    if (!thread) return;
    if (!opened.current) {
      opened.current = true;
      const want = !side && window.location.hash.startsWith('#m-') ? document.getElementById(window.location.hash.slice(1)) : null;
      if (want) { want.scrollIntoView({ block: 'center' }); atEnd.current = false; return; }
      toEnd();
      return;
    }
    if (atEnd.current) toEnd(); else setFresh(true);
  }, [count, unsent, sending, goingOn, thread, side, toEnd]);

  const onScroll = () => {
    const el = stream.current;
    if (!el) return;
    atEnd.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (atEnd.current) setFresh(false);
  };

  // The box grows with the draft, up to a few lines.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight + 4, 168)}px`;
  }, [draft]);

  // A reply that is still being written is checked for until it is finished.
  useEffect(() => {
    const running = thread?.messages.some(m => m.speaker === 'resident' && m.turn?.state === 'running');
    if (!running || sending) return;
    const t = setTimeout(() => { void load(); }, 3000);
    return () => clearTimeout(t);
  }, [thread, sending, load]);

  async function post(text: string, key: string) {
    setSending(true); setErr(null);
    try {
      const res = await fetch('/api/pilot/message', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, key, viewing: viewing() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // The server turned the message away. It is put back in the box, so no word is lost.
        setErr(data.error || 'The message was not kept. Send it again.');
        setUnsent(null);
        setDraft(d => d || text);
        setSending(false);
        return;
      }
    } catch {
      setErr('The server did not answer in time. Your message may be kept. The conversation shows what the server holds once it loads.');
    }
    const now = await load();
    if (now) setUnsent(null);
    else setErr('The conversation was not loaded again, because the server did not answer. Your message stays on this screen. Load the page again to see what the server holds.');
    setSending(false);
    // The File on screen and the counts in the tree are read again, so they show what the reply filed.
    router.refresh();
    if (window.matchMedia('(min-width: 861px)').matches) box.current?.focus();
  }

  function send() {
    const text = draft.trim();
    if (!text || sending) return;
    const key = crypto.randomUUID();
    atEnd.current = true;
    setUnsent({ id: key, key, speaker: 'resident', body: text, created_at: new Date().toISOString(), removed: null, reply_to: null, turn: null, unsent: true });
    setDraft('');
    void post(text, key);
  }

  async function earlier() {
    const first = thread?.messages[0];
    if (!first) return;
    try {
      const res = await fetch(`/api/pilot/thread?before=${first.id}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as Thread;
      atEnd.current = false;
      setThread(t => (t ? { ...t, more: data.more, messages: [...data.messages, ...t.messages], presses: [...(data.presses || []), ...(t.presses || [])] } : t));
    } catch { /* the earlier messages stay on the server. The button can be pressed again. */ }
  }

  async function start() {
    try { await fetch('/api/pilot/notice', { method: 'POST' }); } catch { /* the notice shows again on the next visit */ }
    setThread(t => (t ? { ...t, noticeSeen: true } : t));
    setTimeout(() => box.current?.focus(), 50);
  }

  // After a press on a waiting item, the guide goes on with its next reply.
  async function decided(next: string | null) {
    atEnd.current = true;
    await load();
    if (next) {
      setGoingOn(true);
      await goOnAfterPress(next);
      await load();
      setGoingOn(false);
    }
    router.refresh();
  }

  if (!thread) {
    return (
      <div className="pt-talk">
        <header className="pt-talk-head"><h1>{side ? 'Guide, software' : 'Conversation'}</h1></header>
        <div className="pt-stream-wrap"><div className="pt-stream"><p className="pt-thinking">Loading the conversation.</p></div></div>
      </div>
    );
  }

  if (!thread.noticeSeen) {
    if (side) {
      return (
        <div className="pt-talk">
          <header className="pt-talk-head"><h1>Guide, software</h1></header>
          <div className="pt-stream-wrap"><div className="pt-stream">
            <p className="pt-empty">The guide answers here once the conversation has started.</p>
            <div><Link className="pt-btn" href="/portal/conversation">Open the conversation</Link></div>
          </div></div>
        </div>
      );
    }
    return (
      <div className="pt-talk">
        <div className="pt-stream-wrap"><div className="pt-stream">
          <div className="pt-notice">
            <p className="pt-kick">Founder test</p>
            <h2>What this test keeps</h2>
            <ol>
              <li>Each message you send and each reply, word for word.</li>
              <li>Each entry filed from the conversation, the message it rests on, and each earlier version of it.</li>
              <li>A list of each action software took. An action the server refused is on the list too.</li>
            </ol>
            <p>
              It is kept in a separate section of the Universe City database. The public key of the website cannot reach that section.
              Your login reads it. Each person who can log in to the database account can read it. No second resident login can read it.
            </p>
            <p>
              {thread.ownAccount
                ? 'To write a reply, your messages and your File entries are sent to a language model from Anthropic, under your own Anthropic account. The terms of that account apply to them.'
                : 'To write a reply, your messages and your File entries are sent to a language model from Anthropic, through Netlify. Netlify states that it stores no message and no reply. The terms Anthropic applies to that service were left unchecked for this test.'}
            </p>
            <p>
              A payment card number, a government identification number, a bank account number, and a password are taken out of a message before it is kept, in the common ways each is written. A number written in an unusual way can get through, so leave those four out of your messages.
            </p>
            <p>It stays until you clear it. The Activity page holds the control that clears your test data, and two buttons that download all of it as a file.</p>
            <p>You talk with the guide. The guide is Universe City software. Your agent is a person. No person reads this conversation unless you ask for one.</p>
            <div className="pt-btns" style={{ marginTop: 14 }}>
              <button type="button" className="pt-btn" onClick={start}>Start the conversation</button>
            </div>
          </div>
        </div></div>
      </div>
    );
  }

  const shown = unsent && !thread.messages.some(m => m.key === unsent.key) ? [...thread.messages, unsent] : thread.messages;
  // Messages and presses, in the order they happened.
  const line: ({ kind: 'm'; at: string; m: Msg } | { kind: 'p'; at: string; p: Press })[] = [
    ...shown.map(m => ({ kind: 'm' as const, at: m.created_at, m })),
    ...(thread.presses || []).map(p => ({ kind: 'p' as const, at: p.at, p }))
  ].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.kind === 'p' ? -1 : 1));
  let lastDay = '';

  return (
    <div className="pt-talk">
      <header className="pt-talk-head">
        <h1>{side ? 'Guide, software' : 'Conversation'}</h1>
        <p>{side
          ? 'The guide sees the part of your File that is open.'
          : 'You are talking with the guide. The guide is Universe City software. Your agent is a person.'}</p>
      </header>

      <div className="pt-stream-wrap">
        <div className="pt-stream" ref={stream} onScroll={onScroll} aria-live="polite">
          {thread.more && (
            <div><button type="button" className="pt-btn ghost" onClick={earlier}>Show earlier messages</button></div>
          )}
          {shown.length === 0 && (
            <p className="pt-empty">
              {side
                ? 'No message is here yet. Write to the guide about the part of your File that is open, or about any part of your life.'
                : 'No message is here yet. Write about any part of your day or your life. The guide answers, and each entry it files is listed under its reply.'}
            </p>
          )}
          {line.map(item => {
            const day = dayOf(item.at);
            const newDay = day !== lastDay;
            lastDay = day;
            if (item.kind === 'p') {
              const p = parts(item.p.brief);
              return (
                <div key={`p-${item.p.id}`} style={{ display: 'contents' }}>
                  {newDay && <p className="pt-kick" style={{ alignSelf: 'center' }}>{day}</p>}
                  <p className="pt-press">
                    <span className="when">Your press {clockOf(item.at)}</span>
                    <span className={`pt-chip ${p.tone}`}>{p.word}</span>
                    {item.p.href ? <Link href={item.p.href}>{p.line}</Link> : <span>{p.line}</span>}
                  </p>
                </div>
              );
            }
            const m = item.m;
            const mine = m.speaker === 'resident';
            const failed = mine && m.turn?.state === 'failed' && !shown.some(x => x.reply_to === m.id);
            const running = mine && ((m.unsent && sending) || m.turn?.state === 'running') && !shown.some(x => x.reply_to === m.id);
            return (
              <div key={m.id} style={{ display: 'contents' }}>
                {newDay && <p className="pt-kick" style={{ alignSelf: 'center' }}>{day}</p>}
                <div className={mine ? 'pt-msg me' : 'pt-msg'} id={`m-${m.id}`}>
                  <p className="pt-who">{mine ? 'You' : m.speaker === 'agent' ? 'Your agent' : 'Guide, software'} {clockOf(m.created_at)}</p>
                  <div className="pt-bubble">{m.body}</div>
                  {mine && m.removed && m.removed.length > 0 && (
                    <p className="pt-meta">Taken out before the message was kept: {m.removed.join(', ')}.</p>
                  )}
                  {!mine && <Effects list={m.turn?.effects || []} />}
                </div>
                {running && <p className="pt-thinking">The guide is writing a reply.</p>}
                {failed && (
                  <div className="pt-msg">
                    <p className="pt-who">Universe City</p>
                    <div className="pt-bubble fail">
                      No reply was written. Your message is kept. Each action that was carried out before the reply stopped is listed here.
                      Send the message again to finish the reply. No action is carried out twice.
                    </div>
                    <Effects list={m.turn?.effects || []} />
                    {m.key && (
                      <div className="pt-btns">
                        <button type="button" className="pt-btn" disabled={sending} onClick={() => void post(m.body, m.key as string)}>
                          Send this message again
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {goingOn && <p className="pt-thinking">The guide is writing a reply.</p>}
          {err && <p className="pt-err">{err}</p>}
        </div>
        {fresh && <button type="button" className="pt-btn pt-new" onClick={toEnd}>Show the newest message</button>}
      </div>

      {thread.waiting.length > 0 && (
        <section className="pt-wait" aria-label="Waiting for your answer">
          <h2>Waiting for your answer</h2>
          {thread.waiting.map(w => (
            <div className="pt-wait-item" key={w.id}>
              <p>{w.summary}</p>
              <PilotDecide id={w.id} kind={w.kind} onDecided={next => void decided(next)} />
            </div>
          ))}
        </section>
      )}

      <div className="pt-compose">
        <label htmlFor={side ? 'pt-box-side' : 'pt-box'} style={{ position: 'absolute', left: -9999 }}>Your message</label>
        <textarea
          id={side ? 'pt-box-side' : 'pt-box'} ref={box} value={draft} rows={1} maxLength={4000}
          placeholder="Write to the guide" enterKeyHint="send"
          onChange={e => setDraft(e.target.value)}
          onFocus={() => { if (atEnd.current) setTimeout(toEnd, 250); }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
        />
        <button type="button" className="pt-btn" disabled={sending || !draft.trim()} onClick={send}>Send message</button>
      </div>
    </div>
  );
}
