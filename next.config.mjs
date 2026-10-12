/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // Local work on the founder test builds a database in memory. That package is loaded from node_modules when it
  // is asked for, and stays outside the bundle.
  // A page already opened is shown again at once for 30 seconds when the resident goes back to it. A reply in the
  // conversation, and each change made on the screen, reads the page again, so nothing shown is older than the File.
  experimental: { serverComponentsExternalPackages: ['@electric-sql/pglite'], staleTimes: { dynamic: 30, static: 180 } },
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
