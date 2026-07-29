import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    staleTimes: {
      dynamic: 30,  // Cache dynamic pages for 30s on client-side navigation
      static: 180,  // Cache static pages for 3 minutes
    },
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/supabase-js/ },
    ];
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "noonjttoouyniuimofil.supabase.co",
      },
    ],
  },
};

export default nextConfig;
