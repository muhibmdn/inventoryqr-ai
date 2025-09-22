import { appConfig } from "@/src/app-config";

export type JsonLd<TType extends string = string> = {
  "@context": "https://schema.org";
  "@type": TType;
  [key: string]: unknown;
};

export const buildOrganizationJsonLd = (
  overrides: Partial<{
    name: string;
    legalName: string;
    url: string;
    logo: string;
    email: string;
    sameAs: string[];
  }> = {}
): JsonLd<"Organization"> => {
  const baseUrl = appConfig.urls.base;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: overrides.name ?? appConfig.organization.name,
    legalName: overrides.legalName ?? appConfig.organization.legalName,
    url: overrides.url ?? baseUrl,
    logo: overrides.logo ?? appConfig.organization.logo,
    email: overrides.email ?? appConfig.organization.email,
    sameAs: overrides.sameAs ?? [],
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: appConfig.organization.email,
        telephone: appConfig.organization.phone,
        contactType: "customer support",
        areaServed: "ID",
        availableLanguage: ["id", "en"],
      },
    ],
  };
};

export const buildWebsiteJsonLd = (): JsonLd<"WebSite"> => {
  const baseUrl = appConfig.urls.base;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: appConfig.name,
    url: baseUrl,
    description: appConfig.description,
    inLanguage: appConfig.locale,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
};

export const buildBreadcrumbJsonLd = (
  crumbs: Array<{ name: string; url: string }>
): JsonLd<"BreadcrumbList"> => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: crumb.url,
  })),
});

export const buildSoftwareJsonLd = (): JsonLd<"SoftwareApplication"> => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: appConfig.name,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/PreOrder",
    price: "0",
    priceCurrency: "IDR",
  },
  featureList: appConfig.seo.focusKeywords,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: 128,
  },
});