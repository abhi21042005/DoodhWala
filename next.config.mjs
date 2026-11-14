/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    localPatterns: [{ pathname: '/uploads/**' }],
  },
};

export default nextConfig;
