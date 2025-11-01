/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
  experimental: {
    // Server Actionsのボディサイズ制限を3MBに設定
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
