import type { Viewport } from 'next';
import { notFound, redirect } from 'next/navigation';
import PilotGuide from '@/components/PilotGuide';
import PilotRail from '@/components/PilotRail';
import PilotViewport from '@/components/PilotViewport';
import { who } from '@/lib/pilot/auth';
import { loadIndex } from '@/lib/pilot/browse';
import { withResident } from '@/lib/pilot/db';
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
 * The frame is fixed, as docs/product/RESIDENT_INTERFACE.md states it: the File at the left,
 * one working pane in the center, and the guide at the right.
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
                ? 'The founder test holds one resident. This login is a different account, so no part of the test is shown.'
                : 'No part of the test was loaded and no entry changed. Load the page again in one minute.'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  const index = await withResident({ userId: w.userId, actor: 'resident' }, q => loadIndex(q, w.access.timezone));
  return (
    <div className="os">
      <PilotViewport />
      <PilotRail index={index} name={w.access.display_name} synthetic={w.access.synthetic} />
      <main className="os-main">{children}</main>
      <PilotGuide />
    </div>
  );
}
