import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove env section to prevent exposing API keys to the client
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
