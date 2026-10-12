'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/** The message a resident wrote outside the conversation, with the part of the File it was written from. The conversation picks it up and sends it. */
export const DRAFT_KEY = 'uc:draft';

/**
 * The message box under a place in the File and on the home screen. The resident writes to the guide from
 * where the resident is. The message is sent in the conversation, which takes the center of the frame.
 */
export default function PilotAsk({ place, path }: { place?: string; path?: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState('');
  const going = useRef(false);
  // A narrow screen has room for the short line only.
  const [wide, setWide] = useState(false);
  useEffect(() => { setWide(window.matchMedia('(min-width: 861px)').matches); }, []);

  function send() {
    const text = draft.trim();
    if (!text || going.current) return;
    going.current = true;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ text, place: path || null })); } catch { /* the conversation opens with an empty box */ }
    router.push('/portal/conversation');
  }

  return (
    <div className="pt-compose pt-ask">
      <label htmlFor="pt-ask" className="vh">Your message to the guide</label>
      <textarea
        id="pt-ask" value={draft} rows={1} maxLength={4000} enterKeyHint="send"
        placeholder={place && wide ? `Write to the guide about ${place}` : 'Write to the guide'}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
      />
      <button type="button" className="pt-btn" disabled={!draft.trim()} onClick={send}>Send message</button>
    </div>
  );
}
