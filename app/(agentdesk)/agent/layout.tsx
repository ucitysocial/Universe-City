import type { Viewport } from 'next';
import { notFound, redirect } from 'next/navigation';
import AgentShell from '@/components/agent/AgentShell';
import { whoAgent } from '@/lib/agent/gate';
import { roster } from '@/lib/agent/roster';
import '../../(pilot)/pilot.css';
import './agent.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Agent Portal', robots: { index: false, follow: false } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', interactiveWidget: 'resizes-content' };

/**
 * The first page of the Agent Portal: the clients. The founder set on October 13, 2026 that opening a client opens the
 * same frame the client sees in the Resident Portal, with the tools of the team in the Agency Guide on the right.
 * The clients are the founder's own File and the made up residents of the test.
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
  const clients = await roster(w.userId, w.access);
  return <AgentShell agentName={w.access.display_name || 'Agent'} clients={clients}>{children}</AgentShell>;
}
