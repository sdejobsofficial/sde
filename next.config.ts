import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lpiaaszagdkaaejnukaz.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jvvulcnuxngfcbokiqdb.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;