import PilotBoard from '@/components/PilotBoard';
import type { Board } from '@/lib/pilot/board';
import { sayDate } from '@/lib/pilot/time';

/**
 * The right part of the frame: the dashboard. It stays in place on every page. The founder set it on October 11,
 * 2026: the conversation is home, and the dashboard shows what is happening now, one view the resident picks, and
 * what waits for the resident. After each reply the page is read again, so the dashboard shows each new entry.
 */
export default function PilotSide({ board }: { board: Board }) {
  return (
    <aside className="os-side" aria-label="Overview">
      <div className="win">
        <div className="win-bar">{sayDate(board.today).replace(/, \d{4}$/, '')}</div>
        <div className="win-body"><PilotBoard board={board} /></div>
      </div>
    </aside>
  );
}
