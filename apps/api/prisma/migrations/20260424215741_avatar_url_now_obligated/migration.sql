/*
  Warnings:

  - Made the column `avatarUrl` on table `Driver` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE', 'PRO', 'BUSINESS');

-- AlterTable
ALTER TABLE "Driver" ALTER COLUMN "avatarUrl" SET NOT NULL;
