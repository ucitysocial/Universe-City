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
          <div className="public-footer-brand-block">
            <div className="public-footer-brand">universe<span>★</span>city</div>
            <div className="public-footer-sub">LIFE MANAGEMENT AGENCY</div>
            <div className="public-footer-meta">
              Denver, Colorado<br />
              management@ucitysocial.com
            </div>
          </div>

          <div>
            <div className="public-footer-label">UNIVERSE CITY</div>
            <a href="/">Home</a>
            <a href="/#what">How it works</a>
            <a href="/#business">Membership</a>
            <a href="/founder">Founder</a>
          </div>

          <div>
            <div className="public-footer-label">DEPARTMENTS</div>
            <a href="/agency-assessment">Agency Assessment</a>
            <a href="/housing-stability">Housing Stability</a>
            <a href="/career-development">Career Development</a>
            <a href="/life-management">Life Management</a>
          </div>
        </div>
      </footer>
    </>
  );
}
