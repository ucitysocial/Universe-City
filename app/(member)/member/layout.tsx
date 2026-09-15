import { redirect } from 'next/navigation';
import WorkNav from '@/components/WorkNav';
import { currentProfile } from '@/lib/supabase/server';

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const profile = await currentProfile();
  if (!profile) redirect('/login?next=/member');
  if (profile.membership !== 'active') redirect('/join');

  return (
    <div className="work">
      <WorkNav
        items={[
          { href: '/member', label: 'Your file' },
          { href: '/member/time', label: 'I  Time' },
          { href: '/member/standards', label: 'IV  Standards' },
          { href: '/member/file', label: 'Account' }
        ]}
        foot={<>{profile.name}<br />{profile.case_no}</>}
      />
      <main className="main">{children}</main>
    </div>
  );
}
