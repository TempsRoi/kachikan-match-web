import type { MetadataRoute } from "next";

const baseUrl = "https://www.kachikanmatch.jp";

export default function sitemap(): MetadataRoute.Sitemap {
  const legalLastModified = new Date("2026-08-12");
  return [
    {
      url: baseUrl,
      lastModified: new Date("2026-08-30"),
      changeFrequency: "weekly",
      priority: 1,
      images: [`${baseUrl}/og.png`],
    },
    {
      url: `${baseUrl}/commerce`,
      lastModified: legalLastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: legalLastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: legalLastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: legalLastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
