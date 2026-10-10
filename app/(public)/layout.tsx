import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { supabaseServer } from '@/lib/supabase/server';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { data: { user } } = await supabaseServer().auth.getUser();
  return (
    <>
      <SiteHeader signedIn={!!user} />
      <main className="public-site">{children}</main>

      <footer className="public-footer">
        <div className="wrap public-footer-grid">
          <div>
            <div className="public-footer-brand">universe<span>★</span>city</div>
            <div className="public-footer-sub">LIFE MANAGEMENT AGENCY</div>
            <div className="public-footer-meta">
              Denver, Colorado<br />
              management@ucitysocial.com
            </div>
          </div>

          <div>
            <div className="public-footer-label">HOW IT WORKS</div>
            <a href="/#what">Why an agent</a>
            <a href="/#system">Starting folders</a>
            <a href="/#departments">Four departments</a>
            <a href="/agency-assessment">Agency Assessment folders</a>
          </div>

          <div>
            <div className="public-footer-label">OPEN BOOKS</div>
            <a href="#">Quarterly report</a>
            <Link href="/membership">Membership</Link>
            <Link href="/login">Member sign in</Link>
          </div>

          <div>
            <div className="public-footer-label">MORE</div>
            <a href="/founder">About the founder</a>
            <a href="#">The show</a>
            <a href="#">For employers</a>
            <Link href="/login">Sign in</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
