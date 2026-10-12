'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const span = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} hr${m ? ` ${m} min` : ''}` : `${m} min`;
};

/** How long until the entry starts, or how long is left of it. It counts down while the page is open. */
export function Countdown({ until, left, live }: { until: number; left: number | null; live: boolean }) {
  const [gone, setGone] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setGone(g => g + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  const u = until - gone;
  if (live || u <= 0) {
    const l = left === null ? null : left - gone;
    return <span className="pn-when now">{l === null ? 'Happening now. End unknown.' : l > 0 ? `Happening now. ${span(l)} left.` : 'Ending now.'}</span>;
  }
  return <span className="pn-when">Starts in {span(u)}.</span>;
}

/**
 * One question the guide needs answered. The answer is sent to the guide as a message, with the question, and
 * the guide's reply is in the conversation.
 */
export function Answer({ question }: { question: string }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function send() {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true); setDone(null);
    try {
      const res = await fetch('/api/pilot/message', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: body, key: crypto.randomUUID(), answering: question })
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) setDone(d.error || 'The answer was not sent. Send it again.');
      else {
        setText('');
        setDone('Sent to the guide. Its reply is in the conversation.');
        window.dispatchEvent(new Event('uc:thread'));
        router.refresh();
      }
    } catch {
      setDone('The answer was not sent, because the server did not answer. Send it again.');
    }
    setBusy(false);
  }

  return (
    <form className="pn-answer" onSubmit={e => { e.preventDefault(); void send(); }}>
      <label className="vh" htmlFor={`a-${question.length}-${question.slice(0, 12)}`}>Your answer</label>
      <input id={`a-${question.length}-${question.slice(0, 12)}`} value={text} maxLength={1000} placeholder="Your answer" onChange={e => setText(e.target.value)} />
      <button type="submit" className="pt-btn" disabled={busy || !text.trim()}>{busy ? 'Sending' : 'Send the answer'}</button>
      {busy && <p className="pn-note">The guide is writing a reply.</p>}
      {done && <p className="pn-note">{done} <Link href="/portal/conversation">Open the conversation</Link></p>}
    </form>
  );
}
