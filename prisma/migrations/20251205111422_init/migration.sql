/*
  Warnings:

  - You are about to drop the column `showTrustpilot` on the `FooterSettings` table. All the data in the column will be lost.
  - You are about to drop the column `trustpilotUrl` on the `FooterSettings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "FooterSettings" DROP COLUMN "showTrustpilot",
DROP COLUMN "trustpilotUrl";

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "shopNameBn" TEXT,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "logo" TEXT,
    "favicon" TEXT,
    "brandColor" TEXT NOT NULL DEFAULT '#000000',
    "secondaryColor" TEXT,
    "status" "ShopStatus" NOT NULL DEFAULT 'ACTIVE',
    "ownerName" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_slug_key" ON "Shop"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_domain_key" ON "Shop"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_ownerEmail_key" ON "Shop"("ownerEmail");

-- CreateIndex
CREATE INDEX "Shop_slug_idx" ON "Shop"("slug");

-- CreateIndex
CREATE INDEX "Shop_status_idx" ON "Shop"("status");
