import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentProfile } from '@/lib/supabase/server';
import Checkout from '@/components/Checkout';
import ApplicationFolderShowcase from '@/components/ApplicationFolderShowcase';

/** Application flow. Account first, then membership activation. */
export default async function Join() {
  const profile = await currentProfile();

  if (profile?.membership === 'active') redirect('/member');

  return (
    <div className="wrap join-layout">
      <div className="join-main">
        <p className="kick">Membership</p>
        <h1>Get an agent for the parts of life you manage every day.</h1>

        <ApplicationFolderShowcase />
      </div>

      <aside className="join-card" style={{ alignSelf: 'center' }}>
        <p className="kick">Application</p>
        <ol className="join-steps">
          <li><span>01</span><p>Create your account and file.</p></li>
          <li><span>02</span><p>Activate your $12 weekly membership.</p></li>
          <li><span>03</span><p>Start talking with your agent across all four folders.</p></li>
          <li><span>04</span><p>Use your weekly review to manage changes, decisions and what comes next.</p></li>
        </ol>

        {profile ? (
          <>
            <p className="note join-note">
              Case {profile.case_no} is ready. Continue your application to activate membership.
            </p>
            <Checkout />
          </>
        ) : (
          <>
            <Link className="btn join-primary" href="/signup">
              Begin application
            </Link>
            <p className="note">
              Already have an account? <Link href="/login?next=/join">Log in</Link>.
            </p>
          </>
        )}
      </aside>
    </div>
  );
}
