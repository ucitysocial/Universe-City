'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DEPARTMENTS, FOLDERS } from '@/lib/domain/folders';

const ROUTES: Record<string, string> = {
  Time: '/member/time',
  Standards: '/member/standards'
};

export default function ResidentFileNav({
  name,
  caseNo,
  timeStarted
}: {
  name?: string | null;
  caseNo?: string | null;
  timeStarted: boolean;
}) {
  const path = usePathname();
  const isCurrent = (href: string) =>
    path === href || (href !== '/member' && path.startsWith(href));

  return (
    <aside className="resident-file" data-tour="file">
      <div>
        <Link href="/member" className="mark resident-mark">universe&#9733;city</Link>
        <p className="file-label">File</p>
      </div>

      <nav className="file-primary" aria-label="Resident navigation">
        <Link className={isCurrent('/member') ? 'file-home current' : 'file-home'} href="/member">
          Dashboard
        </Link>

        <div className="file-tree">
          {DEPARTMENTS.map(dept => {
            const folders = FOLDERS.filter(f => f.dept === dept.key);
            const containsCurrent = folders.some(f => ROUTES[f.name] && isCurrent(ROUTES[f.name]));
            return (
              <details key={dept.key} open={containsCurrent || (!timeStarted && dept.key === 'I')}>
                <summary style={{ '--folder-color': dept.color } as React.CSSProperties}>
                  <span className="dept-roman">{dept.key}</span>
                  <span>{dept.name}</span>
                </summary>
                <div className="folder-list">
                  {folders.map(folder => {
                    const route = ROUTES[folder.name];
                    const available = folder.name === 'Time' || (timeStarted && !!route);
                    if (available && route) {
                      return (
                        <Link
                          key={folder.name}
                          href={route}
                          className={isCurrent(route) ? 'folder-row current' : 'folder-row'}
                          data-tour={folder.name === 'Time' ? 'time' : undefined}
                          style={{ '--folder-color': dept.color } as React.CSSProperties}
                        >
                          <span className="folder-num">{String(folder.num).padStart(2, '0')}</span>
                          <span>{folder.name}</span>
                        </Link>
                      );
                    }

                    return (
                      <span
                        key={folder.name}
                        className="folder-row unavailable"
                        title={timeStarted ? 'This system is not active yet.' : 'Time comes first.'}
                      >
                        <span className="folder-num">{String(folder.num).padStart(2, '0')}</span>
                        <span>{folder.name}</span>
                      </span>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </nav>

      <div className="file-foot">
        <div className="file-person">
          <strong>{name || 'Resident'}</strong>
          <span>{caseNo}</span>
        </div>
        <Link href="/member/file">Account</Link>
        <Link href="/member/orientation?replay=1">Replay orientation</Link>
      </div>
    </aside>
  );
}
