'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export type Found = { key: string; href: string; title: string; sub: string; kind: 'entry' | 'message'; at: string | null };

/**
 * The search of the frame. It looks through the entries in the File and the messages in the conversation.
 * The words are sent in the body of a request, so they sit in no address.
 */
export function useSearch() {
  const [text, setText] = useState('');
  const [found, setFound] = useState<Found[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const turn = useRef(0);

  useEffect(() => {
    const words = text.trim();
    if (words.length < 2) { setFound(null); setErr(null); return; }
    const mine = ++turn.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/pilot/search', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: words }) });
        const data = await res.json().catch(() => ({}));
        if (mine !== turn.current) return;
        if (!res.ok) { setErr(data.error || 'The search did not run. Type the words again.'); setFound(null); return; }
        setErr(null);
        setFound(data.found || []);
      } catch {
        if (mine === turn.current) { setErr('The search did not run, because the server did not answer.'); setFound(null); }
      }
    }, 260);
    return () => clearTimeout(t);
  }, [text]);

  return { text, setText, found, err, active: text.trim().length >= 2 };
}

export function SearchBox({ text, setText, id }: { text: string; setText: (s: string) => void; id: string }) {
  return (
    <div className="os-search">
      <label htmlFor={id} className="vh">Search your File and your conversation</label>
      <input
        id={id} type="search" value={text} maxLength={120} autoComplete="off" spellCheck={false} enterKeyHint="search"
        placeholder="Search your File" onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') setText(''); }}
      />
      {text && <button type="button" onClick={() => setText('')}>Clear the search</button>}
    </div>
  );
}

export function SearchResults({ found, err, onOpen }: { found: Found[] | null; err: string | null; onOpen?: () => void }) {
  if (err) return <p className="os-found-none">{err}</p>;
  if (!found) return <p className="os-found-none">Searching.</p>;
  const entries = found.filter(f => f.kind === 'entry');
  const messages = found.filter(f => f.kind === 'message');
  if (!found.length) return <p className="os-found-none">No entry and no message contains those words.</p>;
  const row = (f: Found) => (
    <Link key={`${f.kind}-${f.key}`} href={f.href} className="os-found" onClick={onOpen}>
      <span className={f.kind === 'entry' ? 'fi i-page' : 'fi i-said'} />
      <b>{f.title}</b>
      <span>{f.sub}</span>
    </Link>
  );
  return (
    <>
      {entries.length > 0 && <p className="os-tree-label">In your File, {entries.length}</p>}
      {entries.map(row)}
      {messages.length > 0 && <p className="os-tree-label">In the conversation, {messages.length}</p>}
      {messages.map(row)}
    </>
  );
}

/** The search as its own screen. A phone has no room for the tree, so the search opens here. */
export default function PilotSearch() {
  const s = useSearch();
  return (
    <div className="pt-page pt-search">
      <span id="uc-path" data-path="Search" hidden />
      <h1>Search</h1>
      <p className="pt-lede">Type two letters or more. The search looks through each entry in your File and each message in the conversation.</p>
      <SearchBox text={s.text} setText={s.setText} id="pt-search-page" />
      {s.active && <div className="os-founds"><SearchResults found={s.found} err={s.err} /></div>}
    </div>
  );
}
