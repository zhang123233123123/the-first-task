import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/participants/:path*", destination: `${BACKEND_URL}/participants/:path*` },
      { source: "/suggestions/:path*", destination: `${BACKEND_URL}/suggestions/:path*` },
      { source: "/responses/:path*", destination: `${BACKEND_URL}/responses/:path*` },
      { source: "/debug/data/:path*", destination: `${BACKEND_URL}/debug/data/:path*` },
      { source: "/health", destination: `${BACKEND_URL}/health` },
    ];
  },
};

export default nextConfig;
