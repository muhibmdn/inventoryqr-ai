import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { db } from "@/db";
import { itemCreateSchema } from "@/lib/validators";
import type { ApiResult, Item } from "@/types/item";

import {
  buildCreatePayload,
  buildPaginationMeta,
  revalidateInventoryViews,
  serializeItem,
  type PrismaItem,
} from "./utils";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? DEFAULT_PAGE) || DEFAULT_PAGE;
    const pageSize =
      Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE;
    const q = searchParams.get("q")?.trim();

    const where: Prisma.ItemWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const [records, total] = await Promise.all([
      db.item.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: Math.max(page - 1, 0) * pageSize,
        take: pageSize,
        include: { images: true }, // Include images relation
      }) as Promise<Prisma.ItemGetPayload<{ include: { images: true } }>[]>,
      db.item.count({ where }),
    ]);

    return NextResponse.json<ApiResult<Item[]>>({
      data: records.map(serializeItem),
      error: null,
      meta: buildPaginationMeta(page, pageSize, total),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat data inventori";
    return NextResponse.json<ApiResult<Item[]>>(
      {
        data: [],
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = itemCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<ApiResult<null>>(
      {
        data: null,
        error: "Payload tidak valid",
        meta: { issues: parsed.error.flatten() },
      },
      { status: 400 }
    );
  }

  const owner = await db.user.findFirst({ where: { email: "demo@invee.local" } });
  if (!owner) {
    return NextResponse.json<ApiResult<null>>(
      {
        data: null,
        error: "Seed user not found",
      },
      { status: 500 }
    );
  }

  const { itemImageBase64, ...itemData } = buildCreatePayload(parsed.data, owner.id, body);

  const created = await db.item.create({
    data: {
      ...itemData,
      ...(itemImageBase64 && {
        images: {
          create: { url: itemImageBase64 },
        },
      }),
    },
  });

  revalidateInventoryViews();

  return NextResponse.json<ApiResult<Item>>(
    {
      data: serializeItem(created),
      error: null,
    },
    { status: 201 }
  );
}


