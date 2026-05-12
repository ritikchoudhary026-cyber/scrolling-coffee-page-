import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore: Next.js internal/experimental property requested by terminal
  allowedDevOrigins: ['192.168.1.74', 'localhost'],
};

export default nextConfig;
