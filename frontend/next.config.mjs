/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.shortpixel.ai',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'weandthecolor.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'marketplace.canva.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'xsgames.co',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'colorlib.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'www.dreamhost.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'www.hostinger.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.dribbble.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.searchenginejournal.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'repository-images.githubusercontent.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'www.unsell.design',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com', // Crucial for Cloudinary images
                port: '',
                pathname: '**',
            },
                        {
                protocol: 'https',
                hostname: 'via.placeholder.com',
                port: '',
                pathname: '**',
            },
            
        ],
    },
};

export default nextConfig;