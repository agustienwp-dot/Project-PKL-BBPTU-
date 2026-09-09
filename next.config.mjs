/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/berita-acara',
        destination: '/pemasaran/bast',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
