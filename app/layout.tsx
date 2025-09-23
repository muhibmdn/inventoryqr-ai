import type { Metadata, Viewport } from "next";

import { appConfig } from "@/src/app-config";
import {
  buildOrganizationJsonLd,
  buildSoftwareJsonLd,
  buildWebsiteJsonLd,
} from "@/src/lib/jsonld";

import "./globals.css";

const metadataBase = new URL(appConfig.urls.base);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: appConfig.seo.defaultTitle,
    template: `%s | ${appConfig.name}`,
  },
  description: appConfig.description,
  applicationName: appConfig.name,
  keywords: [...appConfig.seo.keywords],
  authors: [{ name: appConfig.organization.name }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: appConfig.locale,
    siteName: appConfig.name,
    url: appConfig.urls.base,
    title: appConfig.seo.defaultTitle,
    description: appConfig.description,
    images: [
      {
        url: appConfig.seo.openGraphImage,
        width: 1200,
        height: 630,
        alt: appConfig.tagline,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: appConfig.seo.twitter,
    creator: appConfig.seo.twitter,
    title: appConfig.seo.defaultTitle,
    description: appConfig.description,
    images: [appConfig.seo.openGraphImage],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = buildOrganizationJsonLd();
  const websiteJsonLd = buildWebsiteJsonLd();
  const softwareJsonLd = buildSoftwareJsonLd();

  const escapeJson = (obj: unknown) =>
    JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <html
      lang={appConfig.locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: escapeJson(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: escapeJson(websiteJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: escapeJson(softwareJsonLd),
          }}
        />
      </head>
      <body className="min-h-dvh bg-background-muted text-foreground-muted antialiased">
        {children}
      </body>
    </html>
  );
}

