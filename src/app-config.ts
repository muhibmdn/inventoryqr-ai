const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const appConfig = {
  name: "Invee-ai",
  shortName: "Invee",
  tagline: "Inventaris pintar dengan label QR & barcode terintegrasi AI",
  description:
    "Platform inventaris berbasis AI yang mempermudah pencatatan aset, pembuatan kode QR/barcode, dan audit stok secara real-time.",
  locale: "id-ID",
  themeColor: "#216B5B",
  urls: {
    base: APP_URL,
    marketing: "/",
    dashboard: "/dashboard",
    documentation: "https://docs.inventoryqr.ai",
    api: {
      items: "/api/items",
    },
  },
  auth: {
    sessionCookieName: "inventoryqr.session",
    redirectQsKey: "redirect",
  },
  seo: {
    defaultTitle: "Invee-ai",
    keywords: [
      "inventaris",
      "qr code",
      "barcode",
      "asset tracking",
      "manajemen stok",
      "inventory",
    ],
    focusKeywords: [
      "generator qr inventaris",
      "dashboard stok real time",
      "audit aset otomatis",
      "barcode label printer",
      "inventoryqr-ai",
    ],
    twitter: "@inventoryqrai",
    openGraphImage: "/(marketing)/opengraph-image",
  },
  organization: {
    name: "Invee-ai",
    legalName: "PT Inventaris Cerdas Nusantara",
    industry: "Smart inventory management",
    logo: "/icons/icon-512.png",
    email: "hello@inventoryqr.ai",
    phone: "+62-812-1234-5678",
    address: "Jakarta, Indonesia",
  },
  pwa: {
    categories: ["productivity", "utilities", "business"],
    shortcuts: [
      {
        name: "Generator QR",
        url: "/dashboard/generate",
        description: "Buat QR & barcode inventaris",
      },
      {
        name: "Daftar Inventaris",
        url: "/dashboard/inventory",
        description: "Kelola dan audit stok",
      },
    ],
  },
  cache: {
    defaultRevalidate: 60,
  },
} as const;

export type AppConfig = typeof appConfig;