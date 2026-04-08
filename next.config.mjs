/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['172.22.136.202'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig