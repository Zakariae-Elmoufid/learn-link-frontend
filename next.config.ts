import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'learnlink1.s3.eu-west-3.amazonaws.com'
            }
            ],
    },
        typedRoutes: true,

    };

export default nextConfig;
