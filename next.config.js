/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  assetPrefix: './',
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    config.module.rules.push({
      test: /\.glsl$/i,
      use: "raw-loader",
    });

    return config;
  },
};

module.exports = nextConfig;
