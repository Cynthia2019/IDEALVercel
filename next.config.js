/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@mui/material"],
  env: {
    ACCESS_KEY: "AKIAZCLM5UPUTMIUP4P4",
    SECRET_KEY: "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",
    REGION: "us-east-2",
  },
};

module.exports = nextConfig;
