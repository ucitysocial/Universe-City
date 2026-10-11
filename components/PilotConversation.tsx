'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PilotDecide from '@/components/PilotDecide';

type Effect = { tool: string; outcome: string; detail: string };
type Msg = {
  id: string; speaker: 'resident' | 'software' | 'agent'; body: string; created_at: string;
  removed: string[] | null; reply_to: string | null; key: string | null;
  turn: { state: string; effects: Effect[] } | null;
  unsent?: boolean;
};
type Waiting = { id: string; kind: string; summary: string };
type Thread = { messages: Msg[]; more: boolean; waiting: Waiting[]; noticeSeen: boolean };

const CHIP: Record<string, { word: string; tone: string }> = {
  filed: { word: 'Filed', tone: 'filed' },
  decided: { word: 'Decided', tone: 'filed' },
  prepared: { word: 'Waiting for you', tone: 'wait' },
  proposed: { word: 'Sent to your agent', tone: 'agent' },
  refused: { word: 'Left off the File', tone: 'no' },
  failed: { word: 'Did not work', tone: 'no' }
};

const dayOf = (iso: string) => new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const clockOf = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

function Effects({ list }: { list: Effect[] }) {
  if (!list.length) return null;
  return (
    <ul className="pt-effects">
      {list.map((e, i) => {
        const c = CHIP[e.outcome] || { word: e.outcome, tone: 'unknown' };
        return (
          <li key={i}>
            <span className={`pt-chip ${c.tone}`}>{c.word}</span>
            <span>{e.detail}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function PilotConversation({ initial }: { initial: Thread }) {
  const [thread, setThread] = useState<Thread>(initial);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [unsent, setUnsent] = useState<Msg | null>(null);
  const stream = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async (): Promise<Thread | null> => {
    try {
      const res = await fetch('/api/pilot/thread', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = (await res.json()) as Thread;
      setThread(data);
      return data;
    } catch { return null; }
  }, []);

  useEffect(() => {
    const el = stream.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.messages.length, unsent, sending]);

  // A reply that is still being written is checked for until it is finished.
  useEffect(() => {
    const running = thread.messages.some(m => m.speaker === 'resident' && m.turn?.state === 'running');
    if (!running || sending) return;
    const t = setTimeout(() => { void load(); }, 3000);
    return () => clearTimeout(t);
  }, [thread, sending, load]);

  async function post(text: string, key: string) {
    setSending(true); setErr(null);
    try {
      const res = await fetch('/api/pilot/message', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, key })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || 'The message was not kept. Send it again.');
      } else {
        setUnsent(null);
      }
    } catch {
      setErr('The server did not answer in time. Your message may be kept. The conversation below shows what the server holds.');
    }
    const now = await load();
    if (now && now.messages.some(m => m.key === key)) setUnsent(null);
    setSending(false);
    box.current?.focus();
  }

  function send() {
    const text = draft.trim();
    if (!text || sending) return;
    const key = crypto.randomUUID();
    setUnsent({ id: key, key, speaker: 'resident', body: text, created_at: new Date().toISOString(), removed: null, reply_to: null, turn: null, unsent: true });
    setDraft('');
    void post(text, key);
  }

  async function earlier() {
    const first = thread.messages[0];
    if (!first) return;
    try {
      const res = await fetch(`/api/pilot/thread?before=${first.id}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as Thread;
      setThread(t => ({ ...t, more: data.more, messages: [...data.messages, ...t.messages] }));
    } catch { /* the earlier messages stay on the server. The button can be pressed again. */ }
  }

  async function start() {
    try { await fetch('/api/pilot/notice', { method: 'POST' }); } catch { /* the notice shows again on the next visit */ }
    setThread(t => ({ ...t, noticeSeen: true }));
    setTimeout(() => box.current?.focus(), 50);
  }

  const shown = unsent && !thread.messages.some(m => m.key === unsent.key) ? [...thread.messages, unsent] : thread.messages;
  const effectsFor = (m: Msg) => (m.reply_to ? shown.find(x => x.id === m.reply_to)?.turn?.effects || [] : []);
  let lastDay = '';

  if (!thread.noticeSeen) {
    return (
      <div className="pt-talk">
        <div className="pt-stream">
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
              To write a reply, your messages and your File entries are sent to a language model from Anthropic, through Netlify.
              Netlify states that it stores no message and no reply. The terms Anthropic applies to that service were left unchecked for this test.
            </p>
            <p>
              A payment card number, a government identification number, a bank account number, and a password are taken out of a message before it is kept.
            </p>
            <p>It stays until you clear it. The Activity page holds the control that clears your test data.</p>
            <p>You talk with the guide. The guide is Universe City software. Your agent is a person. No person reads this conversation unless you ask for one.</p>
            <div className="pt-btns" style={{ marginTop: 14 }}>
              <button type="button" className="pt-btn" onClick={start}>Start the conversation</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-talk">
      <header className="pt-talk-head">
        <h1>Conversation</h1>
        <p>You are talking with the guide. The guide is Universe City software. Your agent is a person.</p>
      </header>

      <div className="pt-stream" ref={stream} aria-live="polite">
        {thread.more && (
          <div><button type="button" className="pt-btn ghost" onClick={earlier}>Show earlier messages</button></div>
        )}
        {shown.length === 0 && (
          <p className="pt-empty">
            No message is here yet. Write about any part of your day or your life. The guide answers, and each entry it files is listed under its reply.
          </p>
        )}
        {shown.map(m => {
          const day = dayOf(m.created_at);
          const newDay = day !== lastDay;
          lastDay = day;
          const mine = m.speaker === 'resident';
          const failed = mine && m.turn?.state === 'failed' && !shown.some(x => x.reply_to === m.id);
          const running = mine && (m.unsent || m.turn?.state === 'running') && !shown.some(x => x.reply_to === m.id);
          return (
            <div key={m.id} style={{ display: 'contents' }}>
              {newDay && <p className="pt-kick" style={{ alignSelf: 'center' }}>{day}</p>}
              <div className={mine ? 'pt-msg me' : 'pt-msg'}>
                <p className="pt-who">{mine ? 'You' : m.speaker === 'agent' ? 'Your agent' : 'Guide, software'} {clockOf(m.created_at)}</p>
                <div className="pt-bubble">{m.body}</div>
                {mine && m.removed && m.removed.length > 0 && (
                  <p className="pt-meta">Taken out before the message was kept: {m.removed.join(', ')}.</p>
                )}
                {!mine && <Effects list={effectsFor(m)} />}
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
        {err && <p className="pt-err">{err}</p>}
      </div>

      {thread.waiting.length > 0 && (
        <section className="pt-wait" aria-label="Waiting for your answer" style={{ borderBottom: 0 }}>
          <h2>Waiting for your answer</h2>
          {thread.waiting.map(w => (
            <div className="pt-wait-item" key={w.id}>
              <p>{w.summary}</p>
              <PilotDecide id={w.id} kind={w.kind} onDone={() => void load()} />
            </div>
          ))}
        </section>
      )}

      <div className="pt-compose">
        <label htmlFor="pt-box" style={{ position: 'absolute', left: -9999 }}>Your message</label>
        <textarea
          id="pt-box" ref={box} value={draft} rows={1} maxLength={4000}
          placeholder="Write to the guide"
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button type="button" className="pt-btn" disabled={sending || !draft.trim()} onClick={send}>Send message</button>
      </div>
    </div>
  );
}
