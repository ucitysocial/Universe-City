import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentProfile } from '@/lib/supabase/server';
import Checkout from '@/components/Checkout';

/** Join is the conversion flow, in order. Account first, then payment. */
export default async function Join() {
  const profile = await currentProfile();

  if (profile?.membership === 'active') redirect('/member');

  return (
    <div className="wrap">
      <div className="panel" style={{ maxWidth: 560 }}>
        <p className="kick">Join Universe City</p>
        <h2 style={{ marginTop: 8 }}>$48 a month</h2>
        <ul className="rows" style={{ marginTop: 18 }}>
          <li><span className="rn">I</span><span>Time</span></li>
          <li><span className="rn">II</span><span>Inventory</span></li>
          <li><span className="rn">III</span><span>Salary</span></li>
          <li><span className="rn">IV</span><span>Standards</span></li>
          <li><span className="rn">&#9733;</span><span>Fifteen minutes every week with your agent</span></li>
        </ul>

        {profile ? (
          <>
            <p className="note" style={{ margin: '20px 0' }}>
              Your file exists, {profile.name ?? 'and it is yours'}. Case {profile.case_no}.
              The next step is payment, and then your agent sets up Time with you.
            </p>
            <Checkout />
          </>
        ) : (
          <>
            <p className="note" style={{ margin: '20px 0' }}>
              Create your file first. It takes a moment and nothing is charged on that screen.
            </p>
            <Link className="btn" href="/signup" style={{ width: '100%', textAlign: 'center' }}>
              Create my file
            </Link>
            <p className="note">
              Already have one? <Link href="/login?next=/join">Log in</Link>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
