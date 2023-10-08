"use strict";

/** @type {import('next').NextConfig} */
var nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@mui/material"]
}; // module.exports = nextConfig;

module.exports = {
  reactStrictMode: false,
  webpack: function webpack(config, _ref) {
    var isServer = _ref.isServer;

    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false
      };
    }

    return config;
  }
};