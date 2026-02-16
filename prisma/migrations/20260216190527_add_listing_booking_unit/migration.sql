-- CreateEnum
CREATE TYPE "BookingUnit" AS ENUM ('HOUR', 'DAY', 'WEEK');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "bookingUnit" "BookingUnit" NOT NULL DEFAULT 'DAY',
ADD COLUMN     "maxDuration" INTEGER,
ADD COLUMN     "minDuration" INTEGER NOT NULL DEFAULT 1;
