import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Universe City',
  description: 'A life management agency. An agent for everyday people.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ucitysocial.com')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
