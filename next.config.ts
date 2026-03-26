import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de imágenes para Deezer
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "e-cdns-images.dzcdn.net",
        pathname: "/images/cover/**",
      },
      {
        protocol: "https",
        hostname: "cdn-images.dzcdn.net",
        pathname: "/images/cover/**",
      },
      {
        protocol: "https",
        hostname: "images.deezer.com",
        pathname: "/**",
      },
    ],
  },
  // Configuración CORS para desarrollo local
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "ngrok-skip-browser-warning",
            value: "true",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
