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
        <h1>Apply to Universe City.</h1>
        <p className="lede">
          $12 a week includes four folders: Time, Inventory, Salary and Standards. You also get
          one fifteen minute review with your agent every week.
        </p>

        <div className="join-systems">
          <div className="join-system"><span className="rn">I</span><div><strong>Time</strong><p>Your week, recorded and organized.</p></div></div>
          <div className="join-system"><span className="rn">II</span><div><strong>Inventory</strong><p>What you own, what is low and what needs replacing.</p></div></div>
          <div className="join-system"><span className="rn">III</span><div><strong>Salary</strong><p>Your income, your costs and what an hour of work returns.</p></div></div>
          <div className="join-system"><span className="rn">IV</span><div><strong>Standards</strong><p>Your minimums, exceptions and the date each standard was set.</p></div></div>
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
