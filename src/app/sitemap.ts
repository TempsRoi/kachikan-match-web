import type { MetadataRoute } from "next";
import { absoluteSiteUrl, SITE_ORIGIN } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const legalLastModified = new Date("2026-09-05");
  return [
    {
      url: SITE_ORIGIN,
      lastModified: new Date("2026-08-31"),
      changeFrequency: "weekly",
      priority: 1,
      images: [absoluteSiteUrl("/og.png")],
    },
    {
      url: absoluteSiteUrl("/en"),
      lastModified: new Date("2026-08-31"),
      changeFrequency: "weekly",
      priority: 0.9,
      images: [absoluteSiteUrl("/og.png")],
    },
    {
      url: absoluteSiteUrl("/commerce"),
      lastModified: legalLastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteSiteUrl("/terms"),
      lastModified: legalLastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteSiteUrl("/privacy"),
      lastModified: legalLastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteSiteUrl("/contact"),
      lastModified: legalLastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...[
      "/refunds",
      "/cookies",
      "/en/commerce",
      "/en/terms",
      "/en/privacy",
      "/en/refunds",
      "/en/cookies",
      "/en/contact",
    ].map((path) => ({
      url: absoluteSiteUrl(path),
      lastModified: legalLastModified,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
