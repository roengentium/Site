/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        // curl roengentium.me/animation.bat
        { source: "/animation.bat", destination: "/api/animation" },
        // plain `curl roengentium.me` also plays it; browsers still get the site
        {
          source: "/",
          has: [{ type: "header", key: "user-agent", value: "(curl|Wget|HTTPie).*" }],
          destination: "/api/animation",
        },
      ],
    };
  },
}

export default nextConfig
