import { currentProfile, supabaseServer } from '@/lib/supabase/server';
import Billing from '@/components/Billing';

export default async function AccountPage() {
  const profile = await currentProfile();
  const { data: sub } = await supabaseServer().from('subscriptions')
    .select('status, current_period_end').maybeSingle();

  return (
    <>
      <p className="kick">Account</p>
      <h1 style={{ fontSize: 32, marginTop: 8 }}>{profile?.name}</h1>
      <p style={{ color: 'var(--dim)' }}>
        {profile?.case_no}<br />{profile?.email}
      </p>

      <h2 style={{ marginTop: 40, fontSize: 20 }}>Membership</h2>
      <p style={{ marginTop: 8 }}>
        $48 a month &middot; {profile?.membership}
        {sub?.current_period_end ? ` · renews ${String(sub.current_period_end).slice(0, 10)}` : ''}
      </p>
      <div style={{ marginTop: 18 }}><Billing /></div>

      <h2 style={{ marginTop: 44, fontSize: 20 }}>Your information</h2>
      <p className="note" style={{ maxWidth: 'var(--text)' }}>
        Your information is yours. If you stop your membership, it stays with your account and the systems
        close. Nothing is deleted and nothing is rebuilt from scratch if you come back.
      </p>
    </>
  );
}
