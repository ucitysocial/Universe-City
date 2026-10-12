import { redirect } from 'next/navigation';
import PilotSearch from '@/components/PilotSearch';
import { who } from '@/lib/pilot/auth';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  const w = await who();
  if (!w.ok) redirect('/login?next=/portal/search');
  return <PilotSearch />;
}
