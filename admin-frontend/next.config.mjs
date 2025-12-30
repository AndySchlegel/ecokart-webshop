/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable image optimization for AWS Amplify (Amplify handles this)
  images: {
    unoptimized: true
  },
};

export default nextConfig;
