/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        // Ord content is loaded from another origin (e.g. :8081); `next/image` requires allowlisting.
        remotePatterns: [
            { protocol: 'http', hostname: '127.0.0.1', port: '8081', pathname: '/content/**' },
            { protocol: 'http', hostname: 'localhost', port: '8081', pathname: '/content/**' },
            { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/content/**' },
            { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/content/**' },
        ],
    },
};

export default nextConfig;
