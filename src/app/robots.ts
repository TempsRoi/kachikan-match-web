import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: "https://www.kachikanmatch.jp/sitemap.xml",
    host: "https://www.kachikanmatch.jp",
  };
}
