'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const mainSiteUrl = process.env.NEXT_PUBLIC_MARKETING_SITE_URL ?? 'https://www.ucitysocial.com';

  return (
    <>
      <header className="site-head">
        <div className="wrap bar">
          <a href={mainSiteUrl} className="public-wordmark">
            universe<span>★</span>city
            <em>LIFE MANAGEMENT AGENCY</em>
          </a>

          <div className="public-actions">
            {signedIn
              ? <Link className="public-apply" href="/member">Dashboard</Link>
              : <a className="public-apply" href={mainSiteUrl + '/apply'}>Apply</a>}

            <button
              className="public-menu-button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-label="Open menu"
            >
              ★
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="public-menu-overlay" onClick={() => setOpen(false)}>
          <div className="public-menu-panel" onClick={e => e.stopPropagation()}>
            <button
              className="public-menu-close"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>

            <div className="public-menu-groups">
              <div>
                <div className="public-menu-label">HOW IT WORKS</div>
                <a href={mainSiteUrl + '/#what'}>Why an agent</a>
                <a href={mainSiteUrl + '/#departments'}>Four departments</a>
                <a href={mainSiteUrl + '/#system'}>Starting folders</a>
                <a href={mainSiteUrl + '/#time'}>Time example</a>
                <a href={mainSiteUrl + '/agency-assessment'}>Agency Assessment folders</a>
              </div>

              <div>
                <div className="public-menu-label">DEPARTMENTS</div>
                <a href={mainSiteUrl + '/agency-assessment'}>I · Agency Assessment</a>
                <a href={mainSiteUrl + '/housing-stability'}>II · Housing Stability</a>
                <a href={mainSiteUrl + '/career-development'}>III · Career Development</a>
                <a href={mainSiteUrl + '/life-management'}>IV · Life Management</a>
              </div>

              <div>
                <div className="public-menu-label">UNIVERSE CITY</div>
                <a href={mainSiteUrl + '/founder'}>About the founder</a>
                <a href={mainSiteUrl + '/#business'}>How it operates</a>
                <a href={mainSiteUrl + '/membership'}>Membership</a>
                {signedIn
                  ? <Link href="/member">Dashboard</Link>
                  : <Link href="/login">Member sign in</Link>}
              </div>

              <div>
                <div className="public-menu-label">OPEN BOOKS</div>
                <a href={mainSiteUrl + '/#'}>Quarterly report</a>
                <a href={mainSiteUrl + '/membership'}>Membership</a>
                {signedIn
                  ? <Link href="/member">Open dashboard</Link>
                  : <Link href="/login">Sign in</Link>}
              </div>
            </div>

            <div className="public-menu-foot">
              <span>★</span>
              <span>management@ucitysocial.com</span>
              <span>Denver, Colorado</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
