/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                // Supabase Storage images
                protocol: 'https',
                hostname: 'fqlaadogvhjrcznlpaxb.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
};

export default nextConfig;
