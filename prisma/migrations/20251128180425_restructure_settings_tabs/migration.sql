-- CreateEnum
CREATE TYPE "MenuType" AS ENUM ('CUSTOM', 'CATEGORY', 'PRODUCT', 'PAGE');

-- CreateEnum
CREATE TYPE "ProductSectionType" AS ENUM ('FEATURED', 'NEW_ARRIVAL', 'HOT_DEALS', 'BEST_SELLING');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BasicSettings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'SuperMart',
    "siteNameBn" TEXT NOT NULL DEFAULT 'সুপারমার্ট',
    "siteDescription" TEXT,
    "siteDescriptionBn" TEXT,
    "logo" TEXT,
    "favicon" TEXT,
    "promoText" TEXT,
    "promoTextBn" TEXT,
    "promoActive" BOOLEAN NOT NULL DEFAULT false,
    "promoLink" TEXT,
    "metaTitle" TEXT,
    "metaTitleBn" TEXT,
    "metaDescription" TEXT,
    "metaDescriptionBn" TEXT,
    "metaKeywords" TEXT,
    "ogImage" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "currencySymbol" TEXT NOT NULL DEFAULT '৳',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Dhaka',
    "enableWishlist" BOOLEAN NOT NULL DEFAULT true,
    "enableReviews" BOOLEAN NOT NULL DEFAULT true,
    "enableCoupons" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BasicSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelBn" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "parentId" TEXT,
    "type" "MenuType" NOT NULL DEFAULT 'CUSTOM',
    "targetId" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "megaMenu" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterSettings" (
    "id" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "descriptionBn" TEXT,
    "copyrightText" TEXT,
    "copyrightTextBn" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "addressBn" TEXT,
    "workingHours" TEXT,
    "workingHoursBn" TEXT,
    "trustpilotUrl" TEXT,
    "showTrustpilot" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethods" TEXT[],
    "showPaymentMethods" BOOLEAN NOT NULL DEFAULT true,
    "enableNewsletter" BOOLEAN NOT NULL DEFAULT true,
    "newsletterTitle" TEXT,
    "newsletterTitleBn" TEXT,
    "newsletterText" TEXT,
    "newsletterTextBn" TEXT,
    "backgroundColor" TEXT DEFAULT '#1a1a1a',
    "textColor" TEXT DEFAULT '#ffffff',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "titleBn" TEXT,
    "subtitle" TEXT,
    "subtitleBn" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "type" "ProductSectionType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "limit" INTEGER NOT NULL DEFAULT 10,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MidBanner" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "titleBn" TEXT,
    "subtitle" TEXT,
    "subtitleBn" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "position" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MidBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureCard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "description" TEXT,
    "descriptionBn" TEXT,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleBn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLink" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelBn" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "addressBn" TEXT,
    "workingHours" TEXT,
    "workingHoursBn" TEXT,
    "description" TEXT,
    "descriptionBn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenuItem_parentId_idx" ON "MenuItem"("parentId");

-- CreateIndex
CREATE INDEX "MenuItem_order_idx" ON "MenuItem"("order");

-- CreateIndex
CREATE INDEX "Banner_order_idx" ON "Banner"("order");

-- CreateIndex
CREATE INDEX "ProductSection_order_idx" ON "ProductSection"("order");

-- CreateIndex
CREATE INDEX "MidBanner_position_idx" ON "MidBanner"("position");

-- CreateIndex
CREATE INDEX "FeatureCard_order_idx" ON "FeatureCard"("order");

-- CreateIndex
CREATE INDEX "FooterSection_order_idx" ON "FooterSection"("order");

-- CreateIndex
CREATE INDEX "FooterLink_sectionId_idx" ON "FooterLink"("sectionId");

-- CreateIndex
CREATE INDEX "FooterLink_order_idx" ON "FooterLink"("order");

-- CreateIndex
CREATE INDEX "SocialLink_order_idx" ON "SocialLink"("order");

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterLink" ADD CONSTRAINT "FooterLink_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FooterSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
