import type { MetadataRoute } from "next";

import { appConfig } from "@/src/app-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = new URL(appConfig.urls.base);
  const now = new Date();

  return [
    {
      url: `${baseUrl.origin}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl.origin}/dashboard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl.origin}/dashboard/generate`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl.origin}/dashboard/inventory`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}