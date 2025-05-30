import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
  transpilePackages: [
    "@neo4j-nvl/base",
    "@neo4j-nvl/react",
    "@neo4j-nvl/layout-workers",
  ],
};

export default nextConfig;
