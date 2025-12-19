/*
  Warnings:

  - You are about to drop the column `subtitleBn` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `titleBn` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `bkashNoteBn` on the `BasicSettings` table. All the data in the column will be lost.
  - You are about to drop the column `bkashNumberBn` on the `BasicSettings` table. All the data in the column will be lost.
  - You are about to drop the column `metaDescriptionBn` on the `BasicSettings` table. All the data in the column will be lost.
  - You are about to drop the column `metaTitleBn` on the `BasicSettings` table. All the data in the column will be lost.
  - You are about to drop the column `promoTextBn` on the `BasicSettings` table. All the data in the column will be lost.
  - You are about to drop the column `siteDescriptionBn` on the `BasicSettings` table. All the data in the column will be lost.
  - You are about to drop the column `siteNameBn` on the `BasicSettings` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionBn` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `nameBn` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `addressBn` on the `ContactInfo` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionBn` on the `ContactInfo` table. All the data in the column will be lost.
  - You are about to drop the column `workingHoursBn` on the `ContactInfo` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionBn` on the `FeatureCard` table. All the data in the column will be lost.
  - You are about to drop the column `titleBn` on the `FeatureCard` table. All the data in the column will be lost.
  - You are about to drop the column `labelBn` on the `FooterLink` table. All the data in the column will be lost.
  - You are about to drop the column `titleBn` on the `FooterSection` table. All the data in the column will be lost.
  - You are about to drop the column `addressBn` on the `FooterSettings` table. All the data in the column will be lost.
  - You are about to drop the column `copyrightTextBn` on the `FooterSettings` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionBn` on the `FooterSettings` table. All the data in the column will be lost.
  - You are about to drop the column `newsletterTextBn` on the `FooterSettings` table. All the data in the column will be lost.
  - You are about to drop the column `newsletterTitleBn` on the `FooterSettings` table. All the data in the column will be lost.
  - You are about to drop the column `workingHoursBn` on the `FooterSettings` table. All the data in the column will be lost.
  - You are about to drop the column `labelBn` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `subtitleBn` on the `MidBanner` table. All the data in the column will be lost.
  - You are about to drop the column `titleBn` on the `MidBanner` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionBn` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `nameBn` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `titleBn` on the `ProductSection` table. All the data in the column will be lost.
  - You are about to drop the column `nameBn` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `valueBn` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `shopNameBn` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionBn` on the `SubCategory` table. All the data in the column will be lost.
  - You are about to drop the column `nameBn` on the `SubCategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "subtitleBn",
DROP COLUMN "titleBn";

-- AlterTable
ALTER TABLE "BasicSettings" DROP COLUMN "bkashNoteBn",
DROP COLUMN "bkashNumberBn",
DROP COLUMN "metaDescriptionBn",
DROP COLUMN "metaTitleBn",
DROP COLUMN "promoTextBn",
DROP COLUMN "siteDescriptionBn",
DROP COLUMN "siteNameBn";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "descriptionBn",
DROP COLUMN "nameBn";

-- AlterTable
ALTER TABLE "ContactInfo" DROP COLUMN "addressBn",
DROP COLUMN "descriptionBn",
DROP COLUMN "workingHoursBn";

-- AlterTable
ALTER TABLE "FeatureCard" DROP COLUMN "descriptionBn",
DROP COLUMN "titleBn";

-- AlterTable
ALTER TABLE "FooterLink" DROP COLUMN "labelBn";

-- AlterTable
ALTER TABLE "FooterSection" DROP COLUMN "titleBn";

-- AlterTable
ALTER TABLE "FooterSettings" DROP COLUMN "addressBn",
DROP COLUMN "copyrightTextBn",
DROP COLUMN "descriptionBn",
DROP COLUMN "newsletterTextBn",
DROP COLUMN "newsletterTitleBn",
DROP COLUMN "workingHoursBn";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "labelBn";

-- AlterTable
ALTER TABLE "MidBanner" DROP COLUMN "subtitleBn",
DROP COLUMN "titleBn";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "descriptionBn",
DROP COLUMN "nameBn";

-- AlterTable
ALTER TABLE "ProductSection" DROP COLUMN "titleBn";

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "nameBn",
DROP COLUMN "valueBn";

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "shopNameBn";

-- AlterTable
ALTER TABLE "SubCategory" DROP COLUMN "descriptionBn",
DROP COLUMN "nameBn";
