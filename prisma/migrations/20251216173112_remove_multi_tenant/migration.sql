-- AlterEnum
-- Remove SUPER_ADMIN from Role enum
ALTER TYPE "Role" RENAME TO "Role_old";

CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING (
  CASE
    WHEN "role"::text = 'SUPER_ADMIN' THEN 'ADMIN'::text
    ELSE "role"::text
  END
)::"Role";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

DROP TYPE "Role_old";

-- DropTable
DROP TABLE IF EXISTS "Shop";

-- DropEnum
DROP TYPE IF EXISTS "ShopStatus";
