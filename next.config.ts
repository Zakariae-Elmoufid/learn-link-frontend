import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**.learnlink.app' },
            { protocol: 'https', hostname: 'api.dicebear.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
        ],
    },
        typedRoutes: true,
    };

export default nextConfig;
