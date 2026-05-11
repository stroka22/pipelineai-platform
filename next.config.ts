import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
