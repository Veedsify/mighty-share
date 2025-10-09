-- CreateTable
CREATE TABLE "SettlementClearance" (
    "id" SERIAL NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "bankName" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "notes" TEXT,
    "clearedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SettlementClearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaidSettlementAccount" (
    "id" SERIAL NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "settlementDate" TIMESTAMP(3) NOT NULL,
    "reference" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaidSettlementAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkWithdrawalRequest" (
    "id" SERIAL NOT NULL,
    "requestId" TEXT NOT NULL,
    "accountNumbers" TEXT[],
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkWithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NextSettlementAccount" (
    "id" SERIAL NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "settlementCycle" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NextSettlementAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThriftPackage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "profitPercentage" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "terms" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minContribution" INTEGER,
    "maxContribution" INTEGER,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThriftPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThriftSubscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "packageId" INTEGER NOT NULL,
    "amountInvested" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expectedReturn" INTEGER NOT NULL,
    "actualReturn" INTEGER,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThriftSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SettlementClearance_status_idx" ON "SettlementClearance"("status");

-- CreateIndex
CREATE INDEX "SettlementClearance_dueDate_idx" ON "SettlementClearance"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "PaidSettlementAccount_reference_key" ON "PaidSettlementAccount"("reference");

-- CreateIndex
CREATE INDEX "PaidSettlementAccount_settlementDate_idx" ON "PaidSettlementAccount"("settlementDate");

-- CreateIndex
CREATE INDEX "PaidSettlementAccount_reference_idx" ON "PaidSettlementAccount"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "BulkWithdrawalRequest_requestId_key" ON "BulkWithdrawalRequest"("requestId");

-- CreateIndex
CREATE INDEX "BulkWithdrawalRequest_status_idx" ON "BulkWithdrawalRequest"("status");

-- CreateIndex
CREATE INDEX "BulkWithdrawalRequest_createdAt_idx" ON "BulkWithdrawalRequest"("createdAt");

-- CreateIndex
CREATE INDEX "NextSettlementAccount_scheduledDate_idx" ON "NextSettlementAccount"("scheduledDate");

-- CreateIndex
CREATE INDEX "NextSettlementAccount_status_idx" ON "NextSettlementAccount"("status");

-- CreateIndex
CREATE INDEX "ThriftPackage_isActive_idx" ON "ThriftPackage"("isActive");

-- CreateIndex
CREATE INDEX "ThriftSubscription_userId_idx" ON "ThriftSubscription"("userId");

-- CreateIndex
CREATE INDEX "ThriftSubscription_packageId_idx" ON "ThriftSubscription"("packageId");

-- CreateIndex
CREATE INDEX "ThriftSubscription_status_idx" ON "ThriftSubscription"("status");

-- AddForeignKey
ALTER TABLE "ThriftSubscription" ADD CONSTRAINT "ThriftSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThriftSubscription" ADD CONSTRAINT "ThriftSubscription_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "ThriftPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
