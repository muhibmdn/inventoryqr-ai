import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { generateItemCodes } from "@/lib/item-codes";
import { itemCreateSchema } from "@/lib/validators";
import type { ApiResult, Item } from "@/types/item";

import {
  buildUpdatePayload,
  revalidateInventoryViews,
  serializeItem,
  type PrismaItem,
} from "../utils";

type RouteContext = { params: Promise<{ id: string }> };

const getIdFromContext = async (context: RouteContext) => {
  const params = await context.params;
  return params.id;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  const id = await getIdFromContext(context);
  const record = (await db.item.findUnique({ where: { id } })) as PrismaItem | null;

  if (!record) {
    return NextResponse.json<ApiResult<null>>(
      {
        data: null,
        error: "Item tidak ditemukan",
      },
      { status: 404 }
    );
  }

  return NextResponse.json<ApiResult<Item>>({
    data: serializeItem(record),
    error: null,
  });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const id = await getIdFromContext(context);
  const body = await req.json().catch(() => ({}));
  const parsed = itemCreateSchema.partial().safeParse(body);

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

  const data = buildUpdatePayload(parsed.data, body);
  if (Object.keys(data).length === 0) {
    return NextResponse.json<ApiResult<null>>(
      {
        data: null,
        error: "Tidak ada perubahan yang dikirim",
      },
      { status: 422 }
    );
  }

  const updated = await db.$transaction(async (tx) => {
    const base = (await tx.item.update({ where: { id }, data })) as PrismaItem;
    const codes = await generateItemCodes({
      id: base.id,
      code: base.code,
      name: base.name,
      category: base.category,
      location: base.location,
    });

    await tx.item.update({
      where: { id },
      data: {
        code: codes.code,
        qrPayload: codes.qrPayload,
        barcodePayload: codes.barcodePayload,
        qrImage: codes.qrImage,
        barcodeImage: codes.barcodeImage,
      },
    });

    const record = await tx.item.findUnique({
      where: { id },
      include: { images: { select: { id: true, url: true } } },
    });

    if (!record) {
      throw new Error('Item tidak ditemukan setelah pembaruan.');
    }

    return record as PrismaItem & { images?: { id: string; url: string }[] };
  });

  revalidateInventoryViews();

  return NextResponse.json<ApiResult<Item>>({
    data: serializeItem(updated),
    error: null,
  });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const id = await getIdFromContext(context);

  await db.item.delete({ where: { id } });

  revalidateInventoryViews();

  return NextResponse.json<ApiResult<null>>({
    data: null,
    error: null,
  });
}
