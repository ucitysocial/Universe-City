import { redirect } from 'next/navigation';

// The public homepage comes from the canonical ucitysocial/index.html.
// next.config.mjs rewrites / internally to the build-time marketing copy.
// If that rewrite is ever absent, avoid redirecting to this same URL forever.
export default function Home() {
  redirect('/marketing-home.html');
}
