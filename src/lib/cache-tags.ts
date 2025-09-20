export const cacheTags = {
  dashboard: "dashboard",
  items: "items",
  inventory: "inventory",
  marketing: "marketing",
} as const;

export type CacheTag = (typeof cacheTags)[keyof typeof cacheTags];

export const allCacheTags: CacheTag[] = Object.values(cacheTags);