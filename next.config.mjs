/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
    // allow local uploads
    localPatterns: [
      { pathname: '/uploads/**' },
    ],
  },
};

export default nextConfig;
