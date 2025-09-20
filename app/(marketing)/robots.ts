import type { MetadataRoute } from "next";

import { appConfig } from "@/app-config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = new URL(appConfig.urls.base);

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/", "/dashboard"],
      },
    ],
    sitemap: [`${baseUrl.origin}/sitemap.xml`],
    host: baseUrl.host,
  };
}