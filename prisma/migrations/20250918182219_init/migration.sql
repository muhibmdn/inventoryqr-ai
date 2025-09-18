-- CreateEnum
CREATE TYPE "public"."Condition" AS ENUM ('NEW', 'GOOD', 'DEFECT', 'BROKEN');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Item" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brandModel" TEXT,
    "category" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2),
    "purchasedAt" TIMESTAMP(3),
    "fundingSource" TEXT,
    "location" TEXT,
    "floor" TEXT,
    "room" TEXT,
    "rack" TEXT,
    "condition" "public"."Condition" NOT NULL DEFAULT 'GOOD',
    "damagedAt" TIMESTAMP(3),
    "pic" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "code" TEXT,
    "qrPayload" TEXT NOT NULL,
    "barcodePayload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ItemImage" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Item_code_key" ON "public"."Item"("code");

-- CreateIndex
CREATE INDEX "Item_ownerId_category_idx" ON "public"."Item"("ownerId", "category");

-- CreateIndex
CREATE INDEX "Item_name_idx" ON "public"."Item"("name");
