/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com"],
  },
  output: "export",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
