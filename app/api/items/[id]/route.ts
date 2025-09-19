import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { itemCreateSchema } from "@/lib/validators";

export async function GET(
	_: NextRequest,
	{ params }: { params: { id: string } }
) {
	const item = await db.item.findUnique({ where: { id: params.id } });
	if (!item)
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json(item);
}

export async function PATCH(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const body = await req.json();
	const parsed = itemCreateSchema.partial().safeParse(body);
	if (!parsed.success)
		return NextResponse.json(
			{ error: parsed.error.flatten() },
			{ status: 400 }
		);

	const data = parsed.data as any;
	if (data.purchasedAt) data.purchasedAt = new Date(data.purchasedAt);
	if (data.lastCheckedAt) data.lastCheckedAt = new Date(data.lastCheckedAt);

	const updated = await db.item.update({ where: { id: params.id }, data });
	return NextResponse.json(updated);
}

export async function DELETE(
	_: NextRequest,
	{ params }: { params: { id: string } }
) {
	await db.item.delete({ where: { id: params.id } });
	return NextResponse.json({ ok: true });
}
