import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "5ca13225498b22b8495ab8bde544d928.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "pub-8f83f33eecb6437994c344a20b6d98df.r2.dev",
      },
    ],
  },
};

export default nextConfig;
