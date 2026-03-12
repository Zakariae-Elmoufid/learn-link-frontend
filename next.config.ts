import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'learnlink-files.s3.eu-west-3.amazonaws.com'
            }
            ],
    },
        typedRoutes: true,
    };

export default nextConfig;
