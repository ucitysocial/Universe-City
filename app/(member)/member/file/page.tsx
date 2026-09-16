import { currentProfile, supabaseServer } from '@/lib/supabase/server';
import Billing from '@/components/Billing';

const displayDate = (value: string) => new Intl.DateTimeFormat('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
}).format(new Date(`${String(value).slice(0, 10)}T00:00:00Z`));

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
        {sub?.current_period_end ? ` · renews ${displayDate(sub.current_period_end)}` : ''}
      </p>
      <div style={{ marginTop: 18 }}><Billing /></div>

      <h2 style={{ marginTop: 44, fontSize: 20 }}>Your record</h2>
      <p className="note" style={{ maxWidth: 'var(--text)' }}>
        Your record stays on file if you cancel your membership. Your systems close when the
        membership ends. If you return, the existing record is used instead of starting over.
      </p>
    </>
  );
}
