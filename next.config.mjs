/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // The Resident Portal used to live at /member. Old links keep working.
  async redirects() {
    return [
      { source: '/member', destination: '/portal', permanent: true },
      { source: '/member/:path*', destination: '/portal/:path*', permanent: true }
    ];
  }
};
