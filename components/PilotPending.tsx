import Link from 'next/link';
import PilotCarry from '@/components/PilotCarry';
import PilotDecide from '@/components/PilotDecide';
import { Answer } from '@/components/PilotPanelBits';
import type { PanelView } from '@/lib/pilot/browse';

/**
 * Each item that waits for the resident: a task from an earlier day that waits for a time, an overlap, an entry that passed with its end or its outcome unknown, and
 * each item that waits for a yes or a no. The side panel and the home screen show the same list.
 */
export default function PilotPending({ panel }: { panel: PanelView }) {
  return (
    <>
      {panel.pending.length === 0 && <p className="win-none">No item waits for you.</p>}
      {panel.pending.map(p => p.type === 'carry' ? (
        <PilotCarry key={p.key} id={p.id} label={p.label} from={p.from} href={p.href} />
      ) : p.type === 'ask' ? (
        <div key={p.key} className="pn-need">
          <p><Link href={p.href}>{p.question}</Link></p>
          <Answer question={p.question} />
        </div>
      ) : (
        <div key={p.key} className="win-wait">
          <p>{p.summary}</p>
          {p.overlap
            ? <PilotDecide id={p.id} kind={p.kind} yes="Keep both entries" no="Leave this one off" />
            : <PilotDecide id={p.id} kind={p.kind} />}
        </div>
      ))}
      {panel.more > 0 && <p className="win-none">{panel.more} more {panel.more === 1 ? 'question waits' : 'questions wait'}. The agent asks in the conversation.</p>}
    </>
  );
}
