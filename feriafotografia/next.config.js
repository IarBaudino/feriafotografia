/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  images: {
    domains: ["xzzzyuewieueycfxcqsf.supabase.co"],
  },
};

module.exports = nextConfig;
