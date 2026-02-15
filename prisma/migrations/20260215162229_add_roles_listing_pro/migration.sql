/*
  Warnings:

  - The values [ACCOMMODATION] on the enum `ListingType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `price` on the `Listing` table. All the data in the column will be lost.
  - Added the required column `basePrice` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('HOST', 'GUEST', 'ADMIN');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterEnum
BEGIN;
CREATE TYPE "ListingType_new" AS ENUM ('HOME', 'ROOM', 'EXPERIENCE', 'ITEM');
ALTER TABLE "Listing" ALTER COLUMN "type" TYPE "ListingType_new" USING ("type"::text::"ListingType_new");
ALTER TYPE "ListingType" RENAME TO "ListingType_old";
ALTER TYPE "ListingType_new" RENAME TO "ListingType";
DROP TYPE "public"."ListingType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "price",
ADD COLUMN     "basePrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();


-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'GUEST';
