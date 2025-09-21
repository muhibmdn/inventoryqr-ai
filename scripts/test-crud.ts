import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.findFirst();
  if (!owner) {
    throw new Error("No user found to associate with the test item.");
  }

  const timestamp = Date.now();
  const code = `TEST-${timestamp}`;

  console.log("Creating test item...");
  const created = await prisma.item.create({
    data: {
      ownerId: owner.id,
      name: `Test Item ${timestamp}`,
      description: "Initial description",
      category: "Testing",
      condition: "GOOD",
      qrPayload: code,
      qrImage: "data:image/png;base64,placeholder",
      barcodePayload: code,
      barcodeImage: "data:image/png;base64,placeholder",
      images: {
        create: [
          { url: `https://example.com/test-image-${timestamp}-1.png` },
          { url: `https://example.com/test-image-${timestamp}-2.png` },
        ],
      },
    },
    include: { images: true },
  });
  console.log("Created item", created.id, "with", created.images.length, "images");

  console.log("Updating test item...");
  const updated = await prisma.item.update({
    where: { id: created.id },
    data: {
      description: "Updated description",
      qrPayload: `${code}-UPDATED`,
      barcodePayload: `${code}-UPDATED`,
      images: {
        deleteMany: {},
        create: [
          { url: `https://example.com/test-image-${timestamp}-updated-1.png` },
          { url: `https://example.com/test-image-${timestamp}-updated-2.png` },
        ],
      },
    },
    include: { images: true },
  });
  console.log("Updated item", updated.id, "now has", updated.images.length, "images");

  console.log("Deleting test item...");
  await prisma.item.delete({ where: { id: created.id } });
  console.log("Deleted test item successfully.");
}

main()
  .catch((error) => {
    console.error("CRUD test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
