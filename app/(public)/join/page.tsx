import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentProfile } from '@/lib/supabase/server';
import Checkout from '@/components/Checkout';

/** Application flow. Account first, then membership activation. */
export default async function Join() {
  const profile = await currentProfile();

  if (profile?.membership === 'active') redirect('/member');

  return (
    <div className="wrap join-layout">
      <div className="join-main">
        <p className="kick">Membership</p>
        <h1>You do not have to manage every detail by yourself.</h1>
        <p className="lede">
          For $12 a week, Universe City helps you keep four parts of your life organized. Your
          agent reviews the whole file with you every week, updates what changed and identifies
          what needs attention next.
        </p>

        <div className="join-systems">
          <div className="join-system"><span className="rn">I</span><div><strong>Time</strong><p>See where your week is committed, what changed and how much time is still yours.</p></div></div>
          <div className="join-system"><span className="rn">II</span><div><strong>Inventory</strong><p>Know what you have, what is running low and what needs to be replaced.</p></div></div>
          <div className="join-system"><span className="rn">III</span><div><strong>Salary</strong><p>Compare what your work pays you with what your life costs.</p></div></div>
          <div className="join-system"><span className="rn">IV</span><div><strong>Standards</strong><p>Keep your minimums and exceptions written down so you can use them when decisions come up.</p></div></div>
        </div>
      </div>

      <aside className="join-card">
        <p className="kick">Application</p>
        <ol className="join-steps">
          <li><span>01</span><p>Create your account and file.</p></li>
          <li><span>02</span><p>Activate your $12 weekly membership.</p></li>
          <li><span>03</span><p>Add your starting information.</p></li>
          <li><span>04</span><p>Review all four folders with your agent each week.</p></li>
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
