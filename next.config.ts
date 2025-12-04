import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        hostname: "api.dicebear.com",
      },
    ],
  },
  logging: {
    incomingRequests: {
      ignore: [/api\/activity-feed/, /api\/core-stats/, /api\/location-stats/],
    },
  },
  serverExternalPackages: ['pino'],
};

export default nextConfig;
