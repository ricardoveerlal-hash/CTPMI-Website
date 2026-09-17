/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/verse",
        destination: "/devotional",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
