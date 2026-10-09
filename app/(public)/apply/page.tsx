import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentProfile } from '@/lib/supabase/server';
import Checkout from '@/components/Checkout';
import ApplicationFolderShowcase from '@/components/ApplicationFolderShowcase';

/** Application flow. Account first, then membership activation. */
export default async function Apply() {
  const profile = await currentProfile();
  const mainSiteUrl = process.env.NEXT_PUBLIC_MARKETING_SITE_URL ?? 'https://ucitysocial.com';

  if (profile?.membership === 'active') redirect('/member');

  return (
    <div className="wrap application-layout">
      <div className="application-main">
        <a className="application-back" href={mainSiteUrl}>&larr; Back to Universe City</a>
        <p className="kick">Membership</p>
        <h1>Open your File. Start with Time.</h1>

        <ApplicationFolderShowcase />
      </div>

      <aside className="application-card" style={{ alignSelf: 'center' }}>
        <p className="kick">Application</p>
        <ol className="application-steps">
          <li><span>01</span><p>Create your account and resident File.</p></li>
          <li><span>02</span><p>Confirm your email and activate your $48 membership.</p></li>
          <li><span>03</span><p>Walk through the real resident interface.</p></li>
          <li><span>04</span><p>Start with Time by making a believable Plan for tomorrow.</p></li>
        </ol>

        {profile ? (
          <>
            <p className="note application-note">
              Case {profile.case_no} is ready. Activate membership to enter Orientation and start Time.
            </p>
            <Checkout />
          </>
        ) : (
          <>
            <Link className="btn application-primary" href="/signup">
              Begin application
            </Link>
            <p className="note">
              Already have an account? <Link href="/login?next=/apply">Log in</Link>.
            </p>
          </>
        )}
      </aside>
    </div>
  );
}
