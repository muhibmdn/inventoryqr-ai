import { cacheTags } from "@/lib/cache-tags";
import { apiFetch } from "@/lib/fetcher";
import type { Item, TablePageResult } from "@/types/item";

import { LegacyInventoryTable } from "./_components/LegacyInventoryTable.client";

const DEFAULT_PAGE_SIZE = 50;
const INVENTORY_REVALIDATE_SECONDS = 60;

export default async function InventoryPage() {
  const query = new URLSearchParams({
    pageSize: String(DEFAULT_PAGE_SIZE),
  });

  const result = await apiFetch<TablePageResult<Item>>(
    `/api/items/table?${query.toString()}`,
    {
      next: { tags: [cacheTags.items], revalidate: INVENTORY_REVALIDATE_SECONDS },
    }
  );

  if (result.error) {
    throw new Error(result.error);
  }

  return <LegacyInventoryTable initialRows={result.rows} />;
}
