-- CreateEnum
CREATE TYPE "StockLevel" AS ENUM ('OutOfStock', 'Low', 'Medium', 'High');

-- AlterTable
ALTER TABLE "product" ADD COLUMN "stock" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "product" ADD COLUMN "stock_level" "StockLevel" NOT NULL DEFAULT 'OutOfStock';
