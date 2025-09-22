import { PrismaClient, Condition } from "@prisma/client";
import { randomUUID } from "node:crypto";
import * as argon2 from "argon2";

const db = new PrismaClient();

async function main() {
  // buat password hash untuk akun demo
  const passwordHash = await argon2.hash("demo12345");

  const user = await db.user.upsert({
    where: { username: "demo" },
    update: {},
    create: { username: "demo", passwordHash }, // ← HAPUS 'name'
  });

  await db.item.createMany({
    data: [
      {
        // pastikan kolom relasinya sesuai skema kamu: ownerId ATAU userId
        ownerId: user.id, // ganti ke "userId: user.id" jika di schema namanya userId
        name: "Laptop Lenovo ThinkPad",
        brandModel: "T14 Gen 3",
        category: "Elektronik",
        quantity: 5,
        condition: Condition.GOOD,
        qrPayload: `INV:${randomUUID()}`,
      },
      {
        ownerId: user.id, // atau userId
        name: "Proyektor Epson",
        brandModel: "EB-X41",
        category: "Elektronik",
        quantity: 1,
        condition: Condition.NEW,
        qrPayload: `INV:${randomUUID()}`,
      },
    ],
  });

  console.log("Seed done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
