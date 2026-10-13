import type { Viewport } from 'next';
import { notFound, redirect } from 'next/navigation';
import AgentShell from '@/components/agent/AgentShell';
import { demoClients } from '@/lib/agent/demo';
import { whoAgent } from '@/lib/agent/gate';
import { loadLiveClient } from '@/lib/agent/live';
import { localNow } from '@/lib/pilot/time';
import '../../(pilot)/pilot.css';
import './agent.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Agent Portal', robots: { index: false, follow: false } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', interactiveWidget: 'resizes-content' };

/**
 * The Agent Portal. The founder set it on October 13, 2026: the same frame as the Resident Portal, for the person who
 * serves the client. Left: the clients and the File of the one open. Center: the work. Right: what waits.
 * The founder's own File is the live client, read only. The made up clients are a demo that stays in the browser.
 */
export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const w = await whoAgent();
  if (!w.ok) {
    if (w.why === 'off') notFound();
    if (w.why === 'logged_out') redirect('/login?next=/agent');
    return (
      <div className="simple-auth-page">
        <div className="wrap">
          <div className="panel">
            <p className="kick">Agent Portal</p>
            <h2 style={{ marginTop: 8 }}>{w.why === 'database' ? 'The database did not answer' : 'This login is not an agent login'}</h2>
            <p className="note">
              {w.why === 'database'
                ? 'Nothing was loaded and nothing changed. Load the page again in one minute.'
                : `You are logged in as ${w.email || 'an account'}. The Agent Portal opens for agents of Universe City. Your own File is in the Resident Portal.`}
            </p>
            <p style={{ marginTop: 16 }}><a className="pt-btn" href="/portal/home">Open the Resident Portal</a></p>
          </div>
        </div>
      </div>
    );
  }
  const live = await loadLiveClient(w.userId, w.access);
  const demos = demoClients(localNow(w.access.timezone).date);
  return <AgentShell agentName={w.access.display_name || 'Agent'} clients={[live, ...demos]}>{children}</AgentShell>;
}
