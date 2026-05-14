-- CreateEnum
CREATE TYPE "HostRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateTable
CREATE TABLE "HostRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "HostRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "HostRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HostRequest_userId_idx" ON "HostRequest"("userId");

-- CreateIndex
CREATE INDEX "HostRequest_status_idx" ON "HostRequest"("status");

-- AddForeignKey
ALTER TABLE "HostRequest" ADD CONSTRAINT "HostRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
