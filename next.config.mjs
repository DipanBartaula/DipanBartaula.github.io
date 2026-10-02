/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages build (STATIC_EXPORT=1, see .github/workflows/pages.yml):
  // emit a fully static site to out/. The Vercel build is unaffected.
  ...(process.env.STATIC_EXPORT ? { output: "export" } : {}),
};

export default nextConfig;
