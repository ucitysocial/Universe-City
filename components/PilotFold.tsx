'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * On a screen too narrow for the right part of the frame, home shows the dashboard folded into one line above the
 * conversation. Pressing the line opens it.
 */
export default function PilotFold({ summary, children }: { summary: string; children: ReactNode }) {
  const path = usePathname();
  if (path !== '/portal/home') return null;
  return (
    <details className="board-fold">
      <summary>{summary}</summary>
      {children}
    </details>
  );
}
