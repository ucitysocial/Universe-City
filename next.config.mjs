/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // The check route of the founder test can build a database in memory. The package that does it is loaded from
  // node_modules at run time, and its two data files are named here so the build carries them.
  experimental: {
    serverComponentsExternalPackages: ['@electric-sql/pglite'],
    outputFileTracingIncludes: {
      '/api/pilot/selftest': [
        './node_modules/@electric-sql/pglite/package.json',
        './node_modules/@electric-sql/pglite/dist/*.js',
        './node_modules/@electric-sql/pglite/dist/*.cjs',
        './node_modules/@electric-sql/pglite/dist/*.wasm',
        './node_modules/@electric-sql/pglite/dist/*.data',
        './node_modules/@electric-sql/pglite/dist/fs/**'
      ]
    }
  },
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
