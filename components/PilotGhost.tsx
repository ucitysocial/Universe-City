'use client';

import { usePathname, useRouter } from 'next/navigation';
import { DRAFT_KEY } from '@/components/PilotAsk';

/** Sends one message to the agent from outside the conversation. On the home screen the conversation sends it at once. */
export function useAskAgent() {
  const router = useRouter();
  const path = usePathname();
  return (text: string) => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ text, place: 'Schedule' })); } catch { /* the conversation opens with an empty box */ }
    if (path === '/portal/home') window.dispatchEvent(new Event('uc:draft'));
    else router.push('/portal/home');
  };
}

/**
 * A faded row in the day for a piece Time still needs. It is no entry. Pressing it asks the agent for that piece.
 */
export default function PilotGhost({ label, ask }: { label: string; ask: string }) {
  const send = useAskAgent();
  return (
    <button type="button" className="ent ghost" onClick={() => send(ask)} aria-label={`Add ${label.toLowerCase()} with the agent`}>
      <span className="ghost-plus" aria-hidden="true">+</span>
      <b>{label}</b>
      <span className="sub">Not on file yet</span>
    </button>
  );
}
