/*
  Warnings:

  - Added the required column `userId` to the `BulkWithdrawalRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `NextSettlementAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `NextSettlementAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `PaidSettlementAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PaidSettlementAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `SettlementClearance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `SettlementClearance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BulkWithdrawalRequest" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "NextSettlementAccount" ADD COLUMN     "accountId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PaidSettlementAccount" ADD COLUMN     "accountId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SettlementClearance" ADD COLUMN     "accountId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "BulkWithdrawalRequest_userId_idx" ON "BulkWithdrawalRequest"("userId");

-- CreateIndex
CREATE INDEX "NextSettlementAccount_userId_idx" ON "NextSettlementAccount"("userId");

-- CreateIndex
CREATE INDEX "NextSettlementAccount_accountId_idx" ON "NextSettlementAccount"("accountId");

-- CreateIndex
CREATE INDEX "PaidSettlementAccount_userId_idx" ON "PaidSettlementAccount"("userId");

-- CreateIndex
CREATE INDEX "PaidSettlementAccount_accountId_idx" ON "PaidSettlementAccount"("accountId");

-- CreateIndex
CREATE INDEX "SettlementClearance_userId_idx" ON "SettlementClearance"("userId");

-- CreateIndex
CREATE INDEX "SettlementClearance_accountId_idx" ON "SettlementClearance"("accountId");

-- AddForeignKey
ALTER TABLE "SettlementClearance" ADD CONSTRAINT "SettlementClearance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementClearance" ADD CONSTRAINT "SettlementClearance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaidSettlementAccount" ADD CONSTRAINT "PaidSettlementAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaidSettlementAccount" ADD CONSTRAINT "PaidSettlementAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkWithdrawalRequest" ADD CONSTRAINT "BulkWithdrawalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NextSettlementAccount" ADD CONSTRAINT "NextSettlementAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NextSettlementAccount" ADD CONSTRAINT "NextSettlementAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
