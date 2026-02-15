-- CreateTable
CREATE TABLE "UnavailableRange" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "listingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnavailableRange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UnavailableRange" ADD CONSTRAINT "UnavailableRange_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
