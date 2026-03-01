import type { NextConfig } from "next";

const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**.learnlink.app' },
            { protocol: 'https', hostname: 'api.dicebear.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
        ],
    },
    experimental: {
        typedRoutes: true,
    },
}
export default nextConfig;
