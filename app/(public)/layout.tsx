import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { supabaseServer } from '@/lib/supabase/server';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { data: { user } } = await supabaseServer().auth.getUser();
  return (
    <>
      <SiteHeader signedIn={!!user} />
      <main>{children}</main>
      <footer className="site-foot">
        <div className="wrap" style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          <span>universe&#9733;city &middot; Life Management Agency</span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 18 }}>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/membership">Membership</Link>
            <Link href="/login">Log in</Link>
          </span>
        </div>
      </footer>
    </>
  );
}
