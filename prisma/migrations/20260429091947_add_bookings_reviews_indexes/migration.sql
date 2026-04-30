-- DropIndex
DROP INDEX "Booking_listingId_checkIn_checkOut_idx";

-- DropIndex
DROP INDEX "Listing_type_location_idx";

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "User_name_idx" ON "User"("name");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
