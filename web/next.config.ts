import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network IP for HMR during development
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.56.1", "*.local"],
};

export default nextConfig;
