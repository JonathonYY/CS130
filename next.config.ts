import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "", // Leave empty if not needed
        pathname: "/v0/b/bmart-5f635.firebasestorage.app/o/**", // Allow all paths under your bucket
      },
    ],
  },
};

export default nextConfig;
