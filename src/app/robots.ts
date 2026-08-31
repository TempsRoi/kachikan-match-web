import type { MetadataRoute } from "next";
import { absoluteSiteUrl, SITE_ORIGIN } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
    host: SITE_ORIGIN,
  };
}
