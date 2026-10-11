import { notFound, redirect } from 'next/navigation';
import PilotNav from '@/components/PilotNav';
import { who } from '@/lib/pilot/auth';
import './pilot.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Founder test', robots: { index: false, follow: false } };

/**
 * The founder test has its own layout. It checks the login and the test list itself,
 * so the Resident Portal layout and its residency rule are unchanged.
 */
export default async function PilotLayout({ children }: { children: React.ReactNode }) {
  const w = await who();
  if (!w.ok) {
    if (w.why === 'off') notFound();
    if (w.why === 'logged_out') redirect('/login?next=/portal/conversation');
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
  return (
    <div className="pt-shell">
      <PilotNav name={w.access.display_name} synthetic={w.access.synthetic} />
      <main className="pt-main">{children}</main>
    </div>
  );
}
