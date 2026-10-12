import PilotBoard from '@/components/PilotBoard';
import PilotSideResize from '@/components/PilotSideResize';
import PilotSideToggle from '@/components/PilotSideToggle';
import type { Board } from '@/lib/pilot/board';

/**
 * The right part of the frame: the overview. Its title sits in the one dark bar that runs across the top of the frame,
 * with the button that folds it. The founder set it on October 11, 2026: the conversation is home, and the overview
 * shows what is happening now, one view the resident picks, and what waits for the resident. After each reply the page
 * is read again, so the overview shows each new entry.
 */
export default function PilotSide({ board }: { board: Board }) {
  return (
    <aside className="os-side" aria-label="Overview">
      <PilotSideResize />
      <div className="side-head">
        <span className="side-title">Overview</span>
        <PilotSideToggle waiting={board.panel.pending.length} />
      </div>
      <div className="side-body"><PilotBoard board={board} /></div>
    </aside>
  );
}
