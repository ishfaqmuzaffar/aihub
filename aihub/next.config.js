/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
    serverActions: { bodySizeLimit: "16mb" },
  },
  api: {
    bodyParser: { sizeLimit: "16mb" },
    responseLimit: "16mb",
  },
};

module.exports = nextConfig;
