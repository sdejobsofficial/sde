import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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