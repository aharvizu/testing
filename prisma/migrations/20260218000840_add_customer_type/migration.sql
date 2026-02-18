-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('FLOTILLAS', 'MENUDEO');

-- AlterTable: add column with a default so existing rows get a value
ALTER TABLE "Lead" ADD COLUMN "customerType" "CustomerType" NOT NULL DEFAULT 'MENUDEO';

-- Set existing rows to MENUDEO (already handled by default above)

-- Remove the default so new rows must provide a value explicitly
ALTER TABLE "Lead" ALTER COLUMN "customerType" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Lead_customerType_idx" ON "Lead"("customerType");
