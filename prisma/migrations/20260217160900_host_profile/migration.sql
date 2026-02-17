/*
  Warnings:

  - You are about to drop the column `createdAt` on the `UnavailableRange` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UnavailableRange" DROP COLUMN "createdAt";

-- CreateTable
CREATE TABLE "HostProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "phone" TEXT,
    "addressLine1" TEXT,
    "city" TEXT,
    "country" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HostProfile_userId_key" ON "HostProfile"("userId");

-- AddForeignKey
ALTER TABLE "HostProfile" ADD CONSTRAINT "HostProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
