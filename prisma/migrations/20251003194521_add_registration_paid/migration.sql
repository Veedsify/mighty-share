/*
  Warnings:

  - You are about to drop the column `apiKey` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "referralEarnings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referrals" JSONB,
ADD COLUMN     "rewards" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalContributions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalDebt" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transactions" JSONB;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "apiKey",
ADD COLUMN     "lastActivity" TEXT,
ADD COLUMN     "notifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "planStartDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "registrationPaid" BOOLEAN NOT NULL DEFAULT false;
