import { redirect } from 'next/navigation';
import WorkNav from '@/components/WorkNav';
import { currentProfile } from '@/lib/supabase/server';

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const me = await currentProfile();
  if (!me) redirect('/login?next=/agent');
  if (me.role !== 'agent') redirect('/member');

  return (
    <div className="work agent">
      <WorkNav
        items={[
          { href: '/agent', label: 'This week' },
          { href: '/agent/clients', label: 'Members' }
        ]}
        foot={<>{me.name}<br />Agent</>}
      />
      <main className="main">{children}</main>
    </div>
  );
}
