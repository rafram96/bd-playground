import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack config (used with --webpack flag to bypass Turbopack alias issues)
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },

  // Required for WASM cross-origin isolation
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },

  // Allow webpack config while using Turbopack
  turbopack: {},
};

export default nextConfig;
