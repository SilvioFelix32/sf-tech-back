/*
  Warnings:

  - You are about to drop the column `company_id` on the `product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_company_id_fkey";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "company_id";
