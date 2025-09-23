import { PrismaClient, Condition } from "@prisma/client";
import { randomUUID } from "node:crypto";
import * as argon2 from "argon2";

const db = new PrismaClient();

async function main() {
  console.log("Seeding start…");

  const passwordHash = await argon2.hash("demo12345");
  const user = await db.user.upsert({
    where: { username: "demo" },
    update: {
      passwordHash,
    },
    create: {
      username: "demo",
      passwordHash,
    },
  });

  // 2) Hapus item lama milik user demo (opsional, biar idempotent & bersih)
  await db.item.deleteMany({ where: { ownerId: user.id } });

  // 3) Seed item baru dalam transaksi
  await db.$transaction(async (tx) => {
    await tx.item.createMany({
      data: [
        {
          ownerId: user.id,
          name: "Laptop Lenovo ThinkPad",
          brandModel: "T14 Gen 3",
          category: "Elektronik",
          quantity: 5,
          condition: Condition.GOOD,
          qrPayload: `INV:${randomUUID()}`,
        },
        {
          ownerId: user.id,
          name: "Proyektor Epson",
          brandModel: "EB-X41",
          category: "Elektronik",
          quantity: 1,
          condition: Condition.NEW,
          qrPayload: `INV:${randomUUID()}`,
        },
      ],
      skipDuplicates: true,
    });
  });

  console.log("Seed done.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
