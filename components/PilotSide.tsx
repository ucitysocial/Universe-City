import PilotSideResize from '@/components/PilotSideResize';
import PilotSideToggle from '@/components/PilotSideToggle';
import type { ReactNode } from 'react';

/**
 * The right part of the frame. For a resident it is the overview. For an agent who opened a client it is the Agency
 * Guide. The overview: Its title sits in the one dark bar that runs across the top of the frame,
 * with the button that folds it. The founder set it on October 11, 2026: the conversation is home, and the overview
 * shows what is happening now, one view the resident picks, and what waits for the resident. After each reply the page
 * is read again, so the overview shows each new entry.
 */
export default function PilotSide({ title = 'Overview', waiting, children }: { title?: string; waiting: number; children: ReactNode }) {
  return (
    <aside className="os-side" aria-label={title}>
      <PilotSideResize />
      <div className="side-head">
        <span className="side-title">{title}</span>
        <PilotSideToggle waiting={waiting} name={title === 'Overview' ? 'overview' : title} />
      </div>
      <div className="side-body">{children}</div>
    </aside>
  );
}
