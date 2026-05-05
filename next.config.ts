import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'chasalddae.com',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
