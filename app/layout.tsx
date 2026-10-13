import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Universe City',
  description: 'A life management agency. An agent for everyday people.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ucitysocial.com'),
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/favicon-32.png?v=2', type: 'image/png', sizes: '32x32' }
    ],
    apple: '/apple-touch-icon.png?v=2'
  },
  openGraph: {
    type: 'website',
    siteName: 'Universe City',
    images: [{ url: 'https://ucitysocial.com/share.png', width: 1200, height: 630, alt: 'Universe City' }]
  },
  twitter: { card: 'summary_large_image', images: ['https://ucitysocial.com/share.png'] }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
