/*
  Warnings:

  - You are about to drop the column `equipments` on the `Driver` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storeId]` on the table `MerchantApiKey` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "equipments";

-- CreateIndex
CREATE UNIQUE INDEX "MerchantApiKey_storeId_key" ON "MerchantApiKey"("storeId");
