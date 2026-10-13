import type { Viewport } from 'next';
import { notFound, redirect } from 'next/navigation';
import PilotBoard from '@/components/PilotBoard';
import PilotCalPop from '@/components/PilotCalPop';
import PilotStar from '@/components/PilotStar';
import PilotTopBar from '@/components/PilotTopBar';
import { Suspense } from 'react';
import PilotNav from '@/components/PilotNav';
import PilotRail from '@/components/PilotRail';
import PilotSide from '@/components/PilotSide';
import PilotSwitch from '@/components/PilotSwitch';
import PilotViewport from '@/components/PilotViewport';
import AgencyGuide from '@/components/agent/AgencyGuide';
import { loadLiveClient } from '@/lib/agent/live';
import { roster, rows } from '@/lib/agent/roster';
import { who } from '@/lib/pilot/auth';
import { loadBoard } from '@/lib/pilot/board';
import { loadIndex } from '@/lib/pilot/browse';
import { withResident } from '@/lib/pilot/db';
import { loadAccess } from '@/lib/pilot/file';
import './pilot.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Founder test', robots: { index: false, follow: false } };
// On a phone the page is resized when the keyboard opens, where the browser supports it, and the page may use the
// space beside a notch.
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', interactiveWidget: 'resizes-content' };

/**
 * The founder test has its own layout. It checks the login and the test list itself,
 * so the Resident Portal layout and its residency rule are unchanged.
 *
 * The frame is fixed, in three parts. The founder set it on October 11, 2026:
 *   left    the places, a search, and the File as one tree
 *   center  one working pane: the conversation, or the inside of a folder
 *   right   the dashboard: now, one view the resident picks, and Pending
 * Home is the conversation with the agent. docs/product/RESIDENT_INTERFACE.md puts the agent in the right part. In
 * this test the conversation takes the center, and the right part is the dashboard.
 */
export default async function PilotLayout({ children }: { children: React.ReactNode }) {
  const w = await who();
  if (!w.ok) {
    if (w.why === 'off') notFound();
    if (w.why === 'logged_out') redirect('/login?next=/portal/home');
    return (
      <div className="simple-auth-page">
        <div className="wrap">
          <div className="panel">
            <p className="kick">Founder test</p>
            <h2 style={{ marginTop: 8 }}>
              {w.why === 'not_in_test' ? 'This login is outside the founder test' : 'The test database did not answer'}
            </h2>
            <p className="note">
              {w.why === 'not_in_test'
                ? `You are logged in as ${w.email || 'an account'}. The founder test holds one resident, under a different account, so no part of the test is shown. Log out, then log in with the account the test belongs to.`
                : 'No part of the test was loaded and no entry changed. Load the page again in one minute.'}
            </p>
            {w.why === 'not_in_test' && <PilotSwitch />}
          </div>
        </div>
      </div>
    );
  }
  const { index, board } = await withResident({ userId: w.userId, actor: 'resident' }, async q => {
    const index = await loadIndex(q, w.access.timezone);
    return { index, board: await loadBoard(q, w.access.timezone, index) };
  });
  // An agent who opened a client sees the frame the client sees. The founder set it on October 13, 2026: the same
  // tree, File, schedule, and conversation, with the client switcher at the top left and the Agency Guide on the right.
  if (w.agent) {
    const own = await withResident({ userId: w.agent.userId, actor: 'resident' }, q => loadAccess(q));
    const clients = own ? rows(await roster(w.agent.userId, own)) : [];
    const client = await loadLiveClient(w.userId, w.access, { id: w.userId, mode: w.userId === w.agent.userId ? 'live' : 'demo' });
    const first = (w.access.display_name || 'Client').split(' ')[0];
    return (
      <div className="os agv">
        <PilotViewport />
        <Suspense fallback={null}><PilotNav /></Suspense>
        <PilotRail index={index} name={w.access.display_name} synthetic={w.access.synthetic} agent={{ name: w.agent.name, clients, current: w.userId }} />
        <main className="os-main"><PilotTopBar zone={w.access.timezone} waiting={client.needs.length} side="Agency Guide" place={first} />{children}</main>
        <PilotStar waiting={client.needs.length} title="Agency Guide"><AgencyGuide clientId={w.userId} clientName={w.access.display_name || 'Client'} needs={client.needs} /></PilotStar>
        <PilotSide title="Agency Guide" waiting={client.needs.length}><AgencyGuide clientId={w.userId} clientName={w.access.display_name || 'Client'} needs={client.needs} /></PilotSide>
        <PilotCalPop />
      </div>
    );
  }
  return (
    <div className="os">
      <PilotViewport />
      <Suspense fallback={null}><PilotNav /></Suspense>
      <PilotRail index={index} name={w.access.display_name} synthetic={w.access.synthetic} />
      <main className="os-main"><PilotTopBar zone={w.access.timezone} waiting={board.panel.pending.length} />{children}</main>
      <PilotStar waiting={board.panel.pending.length}><PilotBoard board={board} /></PilotStar>
      <PilotSide waiting={board.panel.pending.length}><PilotBoard board={board} /></PilotSide>
      <PilotCalPop />
    </div>
  );
}
