import { redirect } from 'next/navigation';

export default function HowItWorks() {
  const mainSiteUrl = process.env.NEXT_PUBLIC_MARKETING_SITE_URL ?? 'https://ucitysocial.com';
  redirect(mainSiteUrl + '/#what');
}
