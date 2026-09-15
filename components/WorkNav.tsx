'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function WorkNav({ items, foot }:
  { items: { href: string; label: string }[]; foot?: React.ReactNode }) {
  const path = usePathname();
  return (
    <aside className="side">
      <Link href="/" className="mark">universe&#9733;city</Link>
      <nav>
        {items.map(i => (
          <Link key={i.href} href={i.href}
                aria-current={path === i.href || (i.href !== '/member' && i.href !== '/agent' && path.startsWith(i.href)) ? 'page' : undefined}>
            {i.label}
          </Link>
        ))}
      </nav>
      {foot && <div className="grp" style={{ marginTop: 28 }}>{foot}</div>}
    </aside>
  );
}
