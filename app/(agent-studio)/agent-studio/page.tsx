import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import AgentSuggestionsEditor from '@/components/AgentSuggestionsEditor';
import PilotBoardDay from '@/components/PilotBoardDay';
import PilotNav from '@/components/PilotNav';
import PilotRail from '@/components/PilotRail';
import PilotViewport from '@/components/PilotViewport';
import { canUseAgentStudio } from '@/lib/pilot/agent-studio';
import { who } from '@/lib/pilot/auth';
import { loadIndex } from '@/lib/pilot/browse';
import { loadBoard } from '@/lib/pilot/board';
import { withResident } from '@/lib/pilot/db';
import { loadGhostCatalogue } from '@/lib/pilot/ghost-catalogue';

export const dynamic = 'force-dynamic';

/** Founder-only mirror of the real resident workspace; not an impersonation of other clients. */
export default async function AgentStudioPage() {
  const w = await who();
  if (!canUseAgentStudio(w)) notFound();
  if (!w.ok) notFound();

  const { index, board, catalogue } = await withResident(
    { userId: w.userId, actor: 'resident' }, async q => {
      const index = await loadIndex(q, w.access.timezone);
      const board = await loadBoard(q, w.access.timezone, index);
      const catalogue = await loadGhostCatalogue(q);
      return { index, board, catalogue };
    }
  );

  return (
    <div className="os studio-os">
      <PilotViewport />
      <Suspense fallback={null}><PilotNav /></Suspense>
      <PilotRail index={index} name={w.access.display_name} synthetic={w.access.synthetic} />
      <main className="os-main studio-main">
        <header className="studio-head">
          <div>
            <p className="studio-eyebrow">Universe City · Agent Portal · Founder test</p>
            <h1>Resident workspace</h1>
            <p>This is the same File and schedule the resident uses, with a separate agent editing surface.</p>
          </div>
          <Link className="pt-btn ghost" href="/portal/home">View the Resident Portal</Link>
        </header>
        <nav className="studio-tabs" aria-label="Agent tools">
          <span className="on" aria-current="page">Schedule suggestions</span>
          <span title="Planned in later reviews">File decisions · Next phase</span>
          <span title="Planned in later reviews">Agent conversations · Next phase</span>
        </nav>
        <AgentSuggestionsEditor initial={catalogue.templates} ready={catalogue.ready} />
      </main>
      <aside className="os-side studio-side" aria-label="Resident day preview">
        <header className="studio-side-head">RESIDENT VIEW · LIVE PREVIEW</header>
        <p className="studio-side-note">The faded rows below come from the same suggestion catalogue the agent edits. They do not reserve time or create commitments.</p>
        <PilotBoardDay days={board.days} today={board.today} ghosts={board.ghosts} />
      </aside>
    </div>
  );
}
