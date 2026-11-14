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
      // Short, permanent link to share: https://ctpmi.online/download
      // Points at the newest Android APK attached to a GitHub Release (file name must stay ctpmi.apk).
      {
        source: "/download",
        destination:
          "https://github.com/ricardoveerlal-hash/ctpmi-app/releases/latest/download/ctpmi.apk",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
