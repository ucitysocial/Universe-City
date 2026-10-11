import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentProfile } from '@/lib/supabase/server';
import Checkout from '@/components/Checkout';

/** Application flow. Account first, then the residency begins. */
export default async function Apply() {
  const profile = await currentProfile();
  const mainSiteUrl = process.env.NEXT_PUBLIC_MARKETING_SITE_URL ?? 'https://www.ucitysocial.com';

  if (profile?.residency === 'active') redirect('/portal');

  return (
    <div className="application-page">
      <div className="wrap application-layout">
        <div className="application-main application-main-simple">
          <a className="application-back" href={mainSiteUrl}>&larr; Back to Universe City</a>
          <p className="kick">Residency</p>
          <h1>Apply for residency.</h1>
          <p className="lede application-lede">
            Universe City is a life management agency. Residency gives you an agent, the Resident
            Portal, and your folders.
          </p>

          <div className="application-benefits">
            <div>
              <span>01</span>
              <div>
                <strong>Your agent</strong>
                <p>Someone to help organize the moving parts, follow up, and keep the work moving.</p>
              </div>
            </div>
            <div>
              <span>02</span>
              <div>
                <strong>Your Resident Portal</strong>
                <p>One place for plans, updates, decisions, and the history you build over time.</p>
              </div>
            </div>
            <div>
              <span>03</span>
              <div>
                <strong>Your folders</strong>
                <p>Structure is introduced as you use Universe City. You do not need to learn the architecture before you begin.</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="application-card" style={{ alignSelf: 'center' }}>
          <p className="kick">Application</p>
          <ol className="application-steps">
            <li><span>01</span><p>Create your Universe City account.</p></li>
            <li><span>02</span><p>Confirm your email.</p></li>
            <li><span>03</span><p>Begin your residency.</p></li>
            <li><span>04</span><p>Enter the Resident Portal and begin Orientation.</p></li>
          </ol>

          {profile ? (
            <>
              <p className="note application-note">
                Your account is ready. Begin your residency to open Orientation.
              </p>
              <Checkout />
            </>
          ) : (
            <>
              <Link className="btn application-primary" href="/signup">
                Start my application
              </Link>
              <p className="note">
                Already have an account? <Link href="/login?next=/apply">Log in</Link>.
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
