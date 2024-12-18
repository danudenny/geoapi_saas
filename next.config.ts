import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'tile.openstreetmap.org',
            },
            {
                protocol: 'https',
                hostname: 'server.arcgisonline.com',
            },
            {
                protocol: 'https',
                hostname: 'cartodb-basemaps-a.global.ssl.fastly.net',
            },
        ],
    },
};

export default nextConfig;
