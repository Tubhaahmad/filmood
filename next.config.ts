import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Next.js <Image> to load posters from TMDB's image server.
  // Without this, Next.js blocks external images for security.
  // TMDB serves all posters/backdrops from: https://image.tmdb.org/t/p/w500/...
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
