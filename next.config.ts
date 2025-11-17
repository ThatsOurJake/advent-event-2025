import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
