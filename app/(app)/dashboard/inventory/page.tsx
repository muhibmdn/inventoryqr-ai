import { cacheTags } from "@/lib/cache-tags";
import { apiFetch } from "@/lib/fetcher";
import type { Item, ItemTableFilter, ItemTableQuery, ItemTableSort, PageResult } from "@/types/item";

import { InventoryTable } from "./_components/InventoryTable.client";

const DEFAULT_PAGE_SIZE = 50;
const INVENTORY_REVALIDATE_SECONDS = 60;

type InventoryPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const parseJsonParam = <T,>(value: string | undefined | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const normalizeString = (value: string | string[] | undefined): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : null;
  }
  return value;
};

const normalizeNumber = (value: string | string[] | undefined, fallback: number): number => {
  const raw = normalizeString(value);
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
};

export default async function InventoryPage({ searchParams = {} }: InventoryPageProps) {
  const pageSize = normalizeNumber(searchParams.pageSize, DEFAULT_PAGE_SIZE);
  const cursor = normalizeString(searchParams.cursor);
  const q = normalizeString(searchParams.q);
  const sort = parseJsonParam<ItemTableSort[]>(normalizeString(searchParams.sort));
  const filters = parseJsonParam<ItemTableFilter[]>(normalizeString(searchParams.filters));

  const query = new URLSearchParams();
  query.set("pageSize", String(pageSize));

  if (cursor) query.set("cursor", cursor);
  if (sort?.length) query.set("sort", JSON.stringify(sort));
  if (filters?.length) query.set("filters", JSON.stringify(filters));
  if (q) query.set("q", q);

  const result = await apiFetch<PageResult<Item>>(`/api/items/table?${query.toString()}` , {
    next: { tags: [cacheTags.items], revalidate: INVENTORY_REVALIDATE_SECONDS },
  });

  if (result.error) {
    throw new Error(result.error);
  }

  const initialQuery: ItemTableQuery = {
    cursor: cursor ?? null,
    pageSize,
    sort: sort ?? null,
    filters: filters ?? null,
    q,
  };

  return <InventoryTable initial={result} initialQuery={initialQuery} />;
}
