-- Ensure extension exists (safe if already installed)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Drop old constraint (CONFIRMED only)
ALTER TABLE "Booking"
DROP CONSTRAINT IF EXISTS "booking_no_overlap_confirmed";

-- Add new constraint (CONFIRMED + PENDING)
ALTER TABLE "Booking"
ADD CONSTRAINT "booking_no_overlap_confirmed_or_pending"
EXCLUDE USING gist (
  "listingId" WITH =,
  tsrange("startDate", "endDate", '[)') WITH &&
)
WHERE ("status" IN ('CONFIRMED', 'PENDING'));