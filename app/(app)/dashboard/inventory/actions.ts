"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { db } from "@/db";
import { cacheTags } from "@/lib/cache-tags";
import { generateItemCodes } from "@/lib/item-codes";

const conditionValues = ["NEW", "GOOD", "DEFECT", "BROKEN"] as const;

const updateInputSchema = z.object({
  id: z.string().min(1),
  patch: z
    .object({
      name: z.string().min(1).optional(),
      quantity: z.number().int().min(0).optional(),
      condition: z.enum(conditionValues).optional(),
      description: z.string().nullable().optional(),
      category: z.string().nullable().optional(),
      brandModel: z.string().nullable().optional(),
      unitPrice: z.number().nullable().optional(),
      location: z.string().nullable().optional(),
      floor: z.string().nullable().optional(),
      room: z.string().nullable().optional(),
      rack: z.string().nullable().optional(),
      fundingSource: z.string().nullable().optional(),
      pic: z.string().nullable().optional(),
      purchasedAt: z.string().nullable().optional(),
      lastCheckedAt: z.string().nullable().optional(),
      damagedAt: z.string().nullable().optional(),
      code: z.string().nullable().optional(),
      newImages: z.array(z.string().regex(/^data:image\//)).optional(),
      removeImageIds: z.array(z.string().min(1)).optional(),
    })
    .partial(),
});

const deleteInputSchema = z.object({
  id: z.string().min(1),
});

const toNullableDate = (value: string | null | undefined) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export async function updateItem(rawInput: unknown) {
  const parsed = updateInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Data pembaruan tidak valid.",
      issues: parsed.error.flatten().formErrors,
    };
  }

  const {
    id,
    patch: {
      name,
      quantity,
      condition,
      description,
      category,
      brandModel,
      unitPrice,
      location,
      floor,
      room,
      rack,
      fundingSource,
      pic,
      purchasedAt,
      lastCheckedAt,
      damagedAt,
      code,
      newImages,
      removeImageIds,
    },
  } = parsed.data;

  const data: Parameters<typeof db.item.update>[0]["data"] = {};

  if (name !== undefined) data.name = name;
  if (quantity !== undefined) data.quantity = quantity;
  if (condition !== undefined) data.condition = condition;
  if (description !== undefined) data.description = description;
  if (category !== undefined) data.category = category;
  if (brandModel !== undefined) data.brandModel = brandModel;
  if (unitPrice !== undefined) data.unitPrice = unitPrice;
  if (location !== undefined) data.location = location;
  if (floor !== undefined) data.floor = floor;
  if (room !== undefined) data.room = room;
  if (rack !== undefined) data.rack = rack;
  if (fundingSource !== undefined) data.fundingSource = fundingSource;
  if (pic !== undefined) data.pic = pic;
  if (purchasedAt !== undefined) data.purchasedAt = toNullableDate(purchasedAt);
  if (lastCheckedAt !== undefined) data.lastCheckedAt = toNullableDate(lastCheckedAt);
  if (damagedAt !== undefined) data.damagedAt = toNullableDate(damagedAt);
  if (code !== undefined) data.code = code ?? null;

  try {
    let generatedCodes: Awaited<ReturnType<typeof generateItemCodes>> | null = null;
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      if (Object.keys(data).length > 0) {
        await tx.item.update({
          where: { id },
          data,
        });
      }

      if ((Array.isArray(removeImageIds) && removeImageIds.length > 0) || (Array.isArray(newImages) && newImages.length > 0)) {
        const removalIds = Array.isArray(removeImageIds) ? [...new Set(removeImageIds)] : [];
        const additions = Array.isArray(newImages) ? newImages : [];

        const currentImages = await tx.itemImage.findMany({
          where: { itemId: id },
          select: { id: true },
        });

        const remainingCount = currentImages.filter((image) => !removalIds.includes(image.id)).length;
        const finalCount = remainingCount + additions.length;
        if (finalCount < 2) {
          throw new Error("Minimal dua foto harus tersimpan untuk setiap barang.");
        }

        if (removalIds.length > 0) {
          await tx.itemImage.deleteMany({ where: { itemId: id, id: { in: removalIds } } });
        }

        if (additions.length > 0) {
          await tx.itemImage.createMany({
            data: additions.map((url) => ({ itemId: id, url })),
          });
        }
      }

      const latest = await tx.item.findUnique({
        where: { id },
        select: { id: true, code: true, name: true, category: true, location: true },
      });

      if (!latest) {
        throw new Error("Item tidak ditemukan setelah pembaruan.");
      }

      generatedCodes = await generateItemCodes(latest);

      await tx.item.update({
        where: { id },
        data: {
          code: generatedCodes.code,
          qrPayload: generatedCodes.qrPayload,
          barcodePayload: generatedCodes.barcodePayload,
          qrImage: generatedCodes.qrImage,
          barcodeImage: generatedCodes.barcodeImage,
        },
      });

    });

    revalidateTag(cacheTags.items);
    revalidateTag(cacheTags.inventory);
    revalidateTag(cacheTags.dashboard);

    return {
      ok: true as const,
      id,
      patch: parsed.data.patch,
      codes: generatedCodes ?? undefined,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui data inventori.";
    return {
      ok: false as const,
      error: message,
    };
  }
}

export async function deleteItem(rawInput: unknown) {
  const parsed = deleteInputSchema.safeParse({ id: rawInput });
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "ID item tidak valid.",
    };
  }

  const { id } = parsed.data;

  try {
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.itemImage.deleteMany({ where: { itemId: id } });
      await tx.item.delete({ where: { id } });
    });

    revalidateTag(cacheTags.items);
    revalidateTag(cacheTags.inventory);
    revalidateTag(cacheTags.dashboard);

    return {
      ok: true as const,
      id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus item.";
    return {
      ok: false as const,
      error: message,
    };
  }
}

