/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to prevent double rendering with Leaflet maps
  images: {
    domains: ['tile.openstreetmap.org'],
  },
}

module.exports = nextConfig

