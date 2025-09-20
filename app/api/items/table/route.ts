import { NextRequest, NextResponse } from "next/server";
import { Prisma, type Condition } from "@prisma/client";

import { db } from "@/db";
import { cacheTags } from "@/lib/cache-tags";
import type { Item, PageResult } from "@/types/item";

import { serializeItem, type PrismaItem } from "../utils";

type SortParam = { id: string; desc?: boolean | null };
type FilterParam = { id: string; value: unknown };

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const ALLOWED_CONDITIONS: Condition[] = ["NEW", "GOOD", "DEFECT", "BROKEN"];

const buildStringContains = (
  key: keyof Prisma.ItemWhereInput,
  value: unknown
) => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return {
    [key]: {
      contains: value.trim(),
      mode: "insensitive",
    },
  } satisfies Prisma.ItemWhereInput;
};

const SORTABLE_FIELDS: Record<
  string,
  (direction: "asc" | "desc") => Prisma.ItemOrderByWithRelationInput
> = {
  name: (direction) => ({ name: direction }),
  category: (direction) => ({ category: direction }),
  brand: (direction) => ({ brandModel: direction }),
  quantity: (direction) => ({ quantity: direction }),
  condition: (direction) => ({ condition: direction }),
  qrPayload: (direction) => ({ qrPayload: direction }),
  barcodePayload: (direction) => ({ barcodePayload: direction }),
  createdAt: (direction) => ({ createdAt: direction }),
  updatedAt: (direction) => ({ updatedAt: direction }),
};

const buildConditionFilter = (raw: string): Prisma.ItemWhereInput | null => {
  const normalized = raw.trim().toUpperCase();
  if (!ALLOWED_CONDITIONS.includes(normalized as Condition)) {
    return null;
  }
  return { condition: normalized as Condition } satisfies Prisma.ItemWhereInput;
};

const FILTER_BUILDERS: Record<string, (value: unknown) => Prisma.ItemWhereInput | null> = {
  name: (value) => buildStringContains("name", value),
  category: (value) => buildStringContains("category", value),
  brand: (value) => buildStringContains("brandModel", value),
  condition: (value) =>
    typeof value === "string" && value.trim() !== ""
      ? buildConditionFilter(value.trim())
      : null,
  location: (value) => buildStringContains("location", value),
  qrPayload: (value) => buildStringContains("qrPayload", value),
  barcodePayload: (value) => buildStringContains("barcodePayload", value),
  pic: (value) => buildStringContains("pic", value),
  sku: (value) => buildStringContains("code", value),
};

const parseJsonParam = <TReturn>(raw: string | null): TReturn | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TReturn;
  } catch {
    return null;
  }
};

const buildOrderBy = (sortParam: SortParam[] | null) => {
  const uniqueOrder: Prisma.ItemOrderByWithRelationInput[] = [];

  if (Array.isArray(sortParam)) {
    for (const sort of sortParam) {
      const { id } = sort ?? {};
      if (!id) continue;
      const builder = SORTABLE_FIELDS[id];
      if (!builder) continue;
      const direction = sort?.desc ? "desc" : "asc";
      uniqueOrder.push(builder(direction));
    }
  }

  if (uniqueOrder.length === 0) {
    uniqueOrder.push({ createdAt: "desc" }, { id: "desc" });
  } else {
    uniqueOrder.push({ id: "desc" });
  }

  return uniqueOrder;
};

const buildWhere = (filters: FilterParam[] | null, searchTerm: string | null) => {
  const and: Prisma.ItemWhereInput[] = [];

  if (Array.isArray(filters)) {
    for (const filter of filters) {
      if (!filter || typeof filter !== "object") continue;
      const builder = FILTER_BUILDERS[filter.id];
      if (!builder) continue;
      const clause = builder(filter.value);
      if (clause) {
        and.push(clause);
      }
    }
  }

  if (searchTerm && searchTerm.trim() !== "") {
    const term = searchTerm.trim();
    and.push({
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { category: { contains: term, mode: "insensitive" } },
        { brandModel: { contains: term, mode: "insensitive" } },
        { qrPayload: { contains: term, mode: "insensitive" } },
        { barcodePayload: { contains: term, mode: "insensitive" } },
      ],
    });
  }

  if (and.length === 0) {
    return {} as Prisma.ItemWhereInput;
  }

  if (and.length === 1) {
    return and[0];
  }

  return { AND: and } satisfies Prisma.ItemWhereInput;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCursor = searchParams.get("cursor");
    const rawPageSize = Number(searchParams.get("pageSize"));
    const pageSize = Number.isFinite(rawPageSize)
      ? Math.min(Math.max(rawPageSize, 1), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
    const sortParam = parseJsonParam<SortParam[]>(searchParams.get("sort"));
    const filtersParam = parseJsonParam<FilterParam[]>(searchParams.get("filters"));
    const globalSearch = searchParams.get("q") ?? null;

    const orderBy = buildOrderBy(sortParam);
    const where = buildWhere(filtersParam, globalSearch);

    const queryArgs: Prisma.ItemFindManyArgs = {
      where,
      orderBy,
      take: pageSize + 1,
    };

    if (rawCursor) {
      queryArgs.cursor = { id: rawCursor };
      queryArgs.skip = 1;
    }

    const records = (await db.item.findMany(queryArgs)) as PrismaItem[];
    const hasMore = records.length > pageSize;
    const rows = hasMore ? records.slice(0, pageSize) : records;
    const nextCursor = hasMore ? rows[rows.length - 1]?.id ?? null : null;

    const response = NextResponse.json<PageResult<Item>>(
      {
        rows: rows.map(serializeItem),
        nextCursor,
        error: null,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=300",
        },
      }
    );

    response.headers.set("x-cache-tags", cacheTags.items);

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat data tabel inventori";

    return NextResponse.json<PageResult<Item>>(
      {
        rows: [],
        nextCursor: null,
        error: message,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=300",
        },
      }
    );
  }
}
