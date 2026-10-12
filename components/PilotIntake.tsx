'use client';

import { useRouter, usePathname } from 'next/navigation';
import { DRAFT_KEY } from '@/components/PilotAsk';
import type { Intake } from '@/lib/pilot/intake';

/**
 * What the agent still needs for Time. Each missing piece is one button. Pressing it sends one message to the agent,
 * and the agent asks for that piece one question at a time. The short form shows the count and the next piece only.
 */
export default function PilotIntake({ intake, short = false }: { intake: Intake; short?: boolean }) {
  const router = useRouter();
  const path = usePathname();
  const open = intake.items.filter(i => !i.done);

  function ask(text: string) {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ text, place: 'Progress' })); } catch { /* the conversation opens with an empty box */ }
    if (path === '/portal/home') window.dispatchEvent(new Event('uc:draft'));
    else router.push('/portal/home');
  }

  const bar = (
    <span className="intake-bar" role="img" aria-label={`${intake.done} of ${intake.of} on file`}>
      {intake.items.map((_, n) => <i key={n} className={n < intake.done ? 'on' : undefined} />)}
    </span>
  );

  if (short) {
    if (!open.length) return null;
    const next = open[0];
    return (
      <div className="intake short">
        <div className="intake-top">
          <span className="intake-t">Time: {intake.done} of {intake.of} on file</span>
          {bar}
        </div>
        <button type="button" className="intake-ask" onClick={() => ask(next.ask)}>Add {next.label.toLowerCase()}</button>
      </div>
    );
  }

  // The founder set on October 12, 2026 that My File shows only the pieces still missing, with no bar.
  if (!open.length) return null;
  return (
    <div className="intake">
      <ul className="intake-list">
        {open.map(i => (
          <li key={i.key}>
            <button type="button" className="intake-ask" onClick={() => ask(i.ask)}>Add {i.label.toLowerCase()}</button>
          </li>
        ))}
      </ul>
      <p className="intake-note">Each button sends one message. The agent asks one question at a time.</p>
    </div>
  );
}
