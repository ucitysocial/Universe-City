/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // Netlify sets these while it builds. They are fixed into the build so the server can read them at run time.
  // The founder test uses them to stay off a production deploy.
  env: {
    PILOT_CONTEXT: process.env.CONTEXT || '',
    PILOT_COMMIT: process.env.COMMIT_REF || ''
  },
  // The Resident Portal used to live at /member. Old links keep working.
  async redirects() {
    return [
      { source: '/member', destination: '/portal', permanent: true },
      { source: '/member/:path*', destination: '/portal/:path*', permanent: true }
    ];
  }
};
