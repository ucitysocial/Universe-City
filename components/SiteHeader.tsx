'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-head">
      <div className="wrap bar" style={{ position: 'relative' }}>
        <Link href="/" className="mark">universe&#9733;city</Link>
        <button className="navtoggle lab" onClick={() => setOpen(v => !v)} aria-expanded={open}>
          Menu
        </button>
        <nav className={'site-nav' + (open ? ' open' : '')} onClick={() => setOpen(false)}>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/membership">Membership</Link>
          {signedIn
            ? <Link className="btn ghost" href="/member">Your file</Link>
            : <>
                <Link href="/login">Log in</Link>
                <Link className="btn" href="/join">Join</Link>
              </>}
        </nav>
      </div>
    </header>
  );
}
