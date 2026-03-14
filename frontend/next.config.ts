import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy all /api/* requests to the FastAPI backend during development.
  // In production, point NEXT_PUBLIC_API_URL to your deployed backend instead.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL ?? "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
