/*
  Warnings:

  - You are about to drop the column `planType` on the `Plan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[referralId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referralId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "planType",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "startDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" TEXT,
ADD COLUMN     "referralId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_referralId_key" ON "User"("referralId");
