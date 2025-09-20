import { revalidateTag } from "next/cache";
import { Prisma, type Condition, type Item as PrismaItem } from "@prisma/client";
import { z } from "zod";

import { cacheTags } from "@/lib/cache-tags";
import { itemCreateSchema } from "@/lib/validators";
import type { Item } from "@/types/item";

export type ItemSchemaInput = z.infer<typeof itemCreateSchema>;

const CONDITION_VALUES: Condition[] = ["NEW", "GOOD", "DEFECT", "BROKEN"];

export const toCondition = (value: string | null | undefined): Condition => {
  if (CONDITION_VALUES.includes(value as Condition)) {
    return value as Condition;
  }
  return "GOOD";
};

export const toDateOrNull = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

export const toNullableString = (value: unknown) =>
  typeof value === "string" && value.trim() !== "" ? value : null;

export const serializeItem = (item: PrismaItem): Item => ({
  id: item.id,
  name: item.name,
  sku: item.code ?? null,
  brand: item.brandModel ?? null,
  description: item.description ?? null,
  category: item.category ?? null,
  quantity: item.quantity,
  unitPrice: item.unitPrice ? item.unitPrice.toNumber() : null,
  purchasedAt: item.purchasedAt ? item.purchasedAt.toISOString() : null,
  fundingSource: item.fundingSource ?? null,
  location: item.location ?? null,
  floor: item.floor ?? null,
  room: item.room ?? null,
  rack: item.rack ?? null,
  condition: item.condition,
  damagedAt: item.damagedAt ? item.damagedAt.toISOString() : null,
  pic: item.pic ?? null,
  lastCheckedAt: item.lastCheckedAt ? item.lastCheckedAt.toISOString() : null,
  qrPayload: item.qrPayload ?? null,
  barcodePayload: item.barcodePayload ?? null,
  code: item.code ?? null,
});

export const buildCreatePayload = (
  input: ItemSchemaInput,
  ownerId: string,
  raw: unknown
): Prisma.ItemUncheckedCreateInput => {
  const rawRecord = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const sku = toNullableString(rawRecord.sku ?? rawRecord.code);
  const barcodePayload = toNullableString(rawRecord.barcodePayload);
  const qrPayloadRaw = rawRecord.qrPayload;
  const qrPayload =
    typeof qrPayloadRaw === "string" && qrPayloadRaw.trim() !== ""
      ? qrPayloadRaw
      : undefined;

  return {
    ownerId,
    name: input.name,
    description: input.description ?? null,
    brandModel: input.brandModel ?? null,
    category: input.category ?? null,
    quantity: input.quantity,
    unitPrice: input.unitPrice ?? null,
    purchasedAt: toDateOrNull(input.purchasedAt) ?? null,
    fundingSource: input.fundingSource ?? null,
    location: input.location ?? null,
    floor: input.floor ?? null,
    room: input.room ?? null,
    rack: input.rack ?? null,
    condition: toCondition(input.condition),
    damagedAt: toDateOrNull(input.damagedAt) ?? null,
    pic: input.pic ?? null,
    lastCheckedAt: toDateOrNull(input.lastCheckedAt) ?? null,
    code: sku,
    qrPayload: qrPayload ?? `INV:${crypto.randomUUID()}`,
    barcodePayload,
  };
};

export const buildUpdatePayload = (
  input: Partial<ItemSchemaInput>,
  raw: unknown
): Prisma.ItemUncheckedUpdateInput => {
  const rawRecord = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const sku = toNullableString(rawRecord.sku ?? rawRecord.code);
  const barcodePayload = toNullableString(rawRecord.barcodePayload);
  const qrPayloadRaw = rawRecord.qrPayload;
  const qrPayload =
    typeof qrPayloadRaw === "string" && qrPayloadRaw.trim() !== ""
      ? qrPayloadRaw
      : undefined;

  const data: Prisma.ItemUncheckedUpdateInput = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description ?? null;
  if (input.brandModel !== undefined) data.brandModel = input.brandModel ?? null;
  if (input.category !== undefined) data.category = input.category ?? null;
  if (input.quantity !== undefined) data.quantity = input.quantity;
  if (input.unitPrice !== undefined) data.unitPrice = input.unitPrice ?? null;
  if (input.purchasedAt !== undefined) data.purchasedAt = toDateOrNull(input.purchasedAt);
  if (input.fundingSource !== undefined) data.fundingSource = input.fundingSource ?? null;
  if (input.location !== undefined) data.location = input.location ?? null;
  if (input.floor !== undefined) data.floor = input.floor ?? null;
  if (input.room !== undefined) data.room = input.room ?? null;
  if (input.rack !== undefined) data.rack = input.rack ?? null;
  if (input.condition !== undefined) data.condition = toCondition(input.condition);
  if (input.damagedAt !== undefined) data.damagedAt = toDateOrNull(input.damagedAt);
  if (input.pic !== undefined) data.pic = input.pic ?? null;
  if (input.lastCheckedAt !== undefined) data.lastCheckedAt = toDateOrNull(input.lastCheckedAt);
  if (sku !== undefined) data.code = sku;
  if (barcodePayload !== undefined) data.barcodePayload = barcodePayload;
  if (qrPayload !== undefined) data.qrPayload = qrPayload;

  return data;
};

export const buildPaginationMeta = (page: number, pageSize: number, total: number) => ({
  total,
  page,
  pageSize,
  hasMore: page * pageSize < total,
});

export const revalidateInventoryViews = () => {
  revalidateTag(cacheTags.items);
  revalidateTag(cacheTags.inventory);
  revalidateTag(cacheTags.dashboard);
};

export type { PrismaItem };