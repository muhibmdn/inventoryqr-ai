import { PrismaClient, Condition } from "@prisma/client";
const db = new PrismaClient();


async function main() {
const user = await db.user.upsert({
where: { email: "demo@invee.local" },
update: {},
create: { email: "demo@invee.local", name: "Demo User" }
});


await db.item.createMany({
data: [
{
ownerId: user.id,
name: "Laptop Lenovo ThinkPad",
brandModel: "T14 Gen 3",
category: "Elektronik",
quantity: 5,
condition: Condition.GOOD,
qrPayload: `INV:${crypto.randomUUID()}`
},
{
ownerId: user.id,
name: "Proyektor Epson",
brandModel: "EB-X41",
category: "Elektronik",
quantity: 1,
condition: Condition.NEW,
qrPayload: `INV:${crypto.randomUUID()}`
}
]
});


console.log("Seed done");
}


main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await db.$disconnect(); });