/*
  Warnings:

  - A unique constraint covering the columns `[webhookSecret]` on the table `MerchantApiKey` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MerchantApiKey" ADD COLUMN     "webhookSecret" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MerchantApiKey_webhookSecret_key" ON "MerchantApiKey"("webhookSecret");
