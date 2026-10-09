import { redirect } from 'next/navigation';
import FirstPlan from '@/components/FirstPlan';
import { currentProfile, supabaseServer } from '@/lib/supabase/server';
import { addDays, today } from '@/lib/domain/dates';

export default async function TimeSetupPage() {
  const profile = await currentProfile();
  if (!profile) redirect('/login?next=/member/time/setup');

  const { count } = await supabaseServer().from('blocks')
    .select('id', { count: 'exact', head: true });

  if ((count ?? 0) > 0) redirect('/member/time');

  const tz = profile.timezone ?? 'America/Denver';
  const tomorrow = addDays(today(tz), 1);

  return (
    <FirstPlan
      userId={profile.id}
      residentName={profile.name}
      date={tomorrow}
    />
  );
}
