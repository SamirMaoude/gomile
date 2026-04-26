/*
  Warnings:

  - You are about to drop the column `webhookSecret` on the `MerchantApiKey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[webhookSecret]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MerchantApiKey_webhookSecret_key";

-- AlterTable
ALTER TABLE "MerchantApiKey" DROP COLUMN "webhookSecret";

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "webhookSecret" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Store_webhookSecret_key" ON "Store"("webhookSecret");
