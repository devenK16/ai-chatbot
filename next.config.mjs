/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images:{
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ucarecdn.com',
            },
            {
                protocol: 'https',
                hostname: 'wordpress-1306623-4760145.cloudwaysapps.com',
            }
        ],
    },
};

export default nextConfig;
