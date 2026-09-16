/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/verse",
        destination: "/devotional",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
