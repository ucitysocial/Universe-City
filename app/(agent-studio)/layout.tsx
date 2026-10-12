import type { Viewport } from 'next';
import '../(pilot)/pilot.css';
import './studio.css';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Agent Portal | Universe City', robots: { index: false, follow: false } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', interactiveWidget: 'resizes-content' };
export default function StudioLayout({ children }: { children: React.ReactNode }) { return children; }
