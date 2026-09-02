import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep file tracing inside this project when another lockfile exists higher in OneDrive.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
