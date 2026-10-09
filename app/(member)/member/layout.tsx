import { redirect } from 'next/navigation';
import ResidentFileNav from '@/components/ResidentFileNav';
import AgentRail from '@/components/AgentRail';
import { currentProfile, supabaseServer } from '@/lib/supabase/server';

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const profile = await currentProfile();
  if (!profile) redirect('/login?next=/member');
  if (profile.membership !== 'active') redirect('/join');

  const { count } = await supabaseServer().from('blocks')
    .select('id', { count: 'exact', head: true });
  const timeStarted = (count ?? 0) > 0;

  return (
    <div className="resident-shell">
      <ResidentFileNav
        name={profile.name}
        caseNo={profile.case_no}
        timeStarted={timeStarted}
      />
      <main className="resident-main" data-tour="workspace">
        {children}
      </main>
      <AgentRail timeStarted={timeStarted} />
    </div>
  );
}
