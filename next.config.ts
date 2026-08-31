import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    const legacyHosts = [
      "kachikanmatch.jp",
      "www.kachikanmatch.jp",
      "www.playfutarishiru.com",
    ];

    return legacyHosts.map((host) => ({
      source: "/:path((?!api/).*)",
      has: [{ type: "host" as const, value: host }],
      destination: "https://playfutarishiru.com/:path*",
      permanent: true,
    }));
  },
};

export default nextConfig;
