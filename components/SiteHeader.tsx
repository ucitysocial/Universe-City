'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-head">
      <div className="wrap bar">
        <div className="brand-lockup">
          <Link href="/" className="mark">universe&#9733;city</Link>
          <span className="brand-sub">Life Management Agency</span>
        </div>

        <div className="header-actions">
          {signedIn
            ? <Link className="client-link" href="/member">Your file</Link>
            : <Link className="client-link" href="/join">Become a client</Link>}
          <button
            className="menu-star"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? '×' : '★'}
          </button>
        </div>
      </div>

      {open && (
        <div className="site-menu" onClick={() => setOpen(false)}>
          <div className="wrap menu-grid">
            <div>
              <p className="menu-label">The system</p>
              <Link href="/how-it-works">How it works</Link>
              <Link href="/membership">Membership</Link>
            </div>
            <div>
              <p className="menu-label">Universe City</p>
              {signedIn
                ? <Link href="/member">Your file</Link>
                : <>
                    <Link href="/login">Sign in</Link>
                    <Link href="/join">Become a client</Link>
                  </>}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
