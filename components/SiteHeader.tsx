'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const mainSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ucitysocial.com';

  return (
    <header className="site-head">
      <div className="wrap bar">
        <div className="brand-lockup">
          <a href={mainSiteUrl} className="mark">universe&#9733;city</a>
          <span className="brand-sub">Life Management Agency</span>
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/membership">Membership</Link>
          {signedIn
            ? <Link href="/member">Your file</Link>
            : <Link href="/login">Log in</Link>}
          <Link className="header-cta" href={signedIn ? '/member' : '/join'}>
            {signedIn ? 'Open your file' : 'Apply'}
          </Link>
        </nav>

        <div className="more-wrap">
          <button
            className="menu-star"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close secondary menu' : 'Open secondary menu'}
          >
            ★
          </button>

          {open && (
            <div className="compact-menu" onClick={() => setOpen(false)}>
              <p className="menu-label">Explore</p>
              <a href={mainSiteUrl}>Home</a>
              <Link href="/how-it-works">How it works</Link>
              <Link href="/membership">Membership</Link>
              {signedIn
                ? <Link href="/member">Your file</Link>
                : <>
                    <Link href="/login">Log in</Link>
                    <Link className="compact-cta" href="/join">Apply</Link>
                  </>}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
