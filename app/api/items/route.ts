import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { itemCreateSchema } from "@/lib/validators";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");
  const q = searchParams.get("q")?.trim();

  const where: Prisma.ItemWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    db.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.item.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = itemCreateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );

  // Sementara, assign ke user demo; sambungkan ke session auth di tahap berikutnya
  const owner = await db.user.findFirst({
    where: { email: "demo@invee.local" },
  });
  if (!owner)
    return NextResponse.json(
      { error: "Seed user not found" },
      { status: 500 }
    );

  const created = await db.item.create({
    data: {
      ownerId: owner.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      brandModel: parsed.data.brandModel ?? null,
      category: parsed.data.category ?? null,
      quantity: parsed.data.quantity,
      unitPrice: parsed.data.unitPrice ?? null,
      purchasedAt: parsed.data.purchasedAt
        ? new Date(parsed.data.purchasedAt)
        : null,
      fundingSource: parsed.data.fundingSource ?? null,
      location: parsed.data.location ?? null,
      floor: parsed.data.floor ?? null,
      room: parsed.data.room ?? null,
      rack: parsed.data.rack ?? null,
      condition: (parsed.data.condition as any) ?? "GOOD",
      damagedAt: parsed.data.damagedAt
        ? new Date(parsed.data.damagedAt)
        : null,
      pic: parsed.data.pic ?? null,
      lastCheckedAt: parsed.data.lastCheckedAt
        ? new Date(parsed.data.lastCheckedAt)
        : null,
      qrPayload: `INV:${crypto.randomUUID()}`,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
