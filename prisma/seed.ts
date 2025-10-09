import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create demo user with multiple accounts
  const user = await prisma.user.create({
    data: {
      fullname: "Demo User",
      phone: "08000000000",
      password: hashedPassword,
      plan: "A",
      referralId: "REF-123456",
      accounts: {
        create: [
          {
            accountNumber: "MS123456",
            balance: 50000,
            totalContributions: 40000,
            rewards: 5000,
          },
          {
            accountNumber: "MS789012",
            balance: 75000,
            totalContributions: 60000,
            rewards: 8000,
          },
          {
            accountNumber: "MS345678",
            balance: 120000,
            totalContributions: 100000,
            rewards: 15000,
          },
        ],
      },
    },
  });

  console.log("✅ Seed user and accounts created");

  // Get the created accounts
  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
  });

  // Seed Transactions for each account
  if (accounts.length > 0) {
    const transactionsData = [];

    // Transactions for first account (MS123456)
    transactionsData.push(
      {
        accountId: accounts[0].id,
        reference: "TXN-20251001-001",
        amount: 20000,
        type: "topup",
        status: "successful",
        paymentMethod: "wema",
        description: "Account top-up via Wema Bank",
        platformTransactionReference: "WEMA-20251001-12345",
      },
      {
        accountId: accounts[0].id,
        reference: "TXN-20251003-002",
        amount: 15000,
        type: "contribution",
        status: "successful",
        description: "Monthly contribution",
      },
      {
        accountId: accounts[0].id,
        reference: "TXN-20251005-003",
        amount: 5000,
        type: "reward",
        status: "successful",
        description: "Referral reward",
      },
      {
        accountId: accounts[0].id,
        reference: "TXN-20251008-004",
        amount: 10000,
        type: "topup",
        status: "pending",
        paymentMethod: "alatpay",
        description: "Account top-up via AlatPay",
      }
    );

    // Transactions for second account (MS789012)
    if (accounts.length > 1) {
      transactionsData.push(
        {
          accountId: accounts[1].id,
          reference: "TXN-20250928-005",
          amount: 30000,
          type: "topup",
          status: "successful",
          paymentMethod: "bank_transfer",
          description: "Bank transfer top-up",
        },
        {
          accountId: accounts[1].id,
          reference: "TXN-20251002-006",
          amount: 25000,
          type: "contribution",
          status: "successful",
          description: "Bi-weekly contribution",
        },
        {
          accountId: accounts[1].id,
          reference: "TXN-20251006-007",
          amount: 5000,
          type: "withdrawal",
          status: "failed",
          description: "Withdrawal request - insufficient balance",
        }
      );
    }

    // Transactions for third account (MS345678)
    if (accounts.length > 2) {
      transactionsData.push(
        {
          accountId: accounts[2].id,
          reference: "TXN-20250925-008",
          amount: 50000,
          type: "topup",
          status: "successful",
          paymentMethod: "wema",
          description: "Large account top-up",
          platformTransactionReference: "WEMA-20250925-67890",
        },
        {
          accountId: accounts[2].id,
          reference: "TXN-20250930-009",
          amount: 40000,
          type: "contribution",
          status: "successful",
          description: "Monthly contribution",
        },
        {
          accountId: accounts[2].id,
          reference: "TXN-20251004-010",
          amount: 10000,
          type: "reward",
          status: "successful",
          description: "Bonus reward",
        },
        {
          accountId: accounts[2].id,
          reference: "TXN-20251007-011",
          amount: 20000,
          type: "topup",
          status: "successful",
          paymentMethod: "alatpay",
          description: "Account top-up via AlatPay",
          platformTransactionReference: "ALAT-20251007-11111",
        }
      );
    }

    await prisma.transaction.createMany({
      data: transactionsData,
    });

    console.log("✅ Seed transactions created");
  }

  // Seed Settlement Clearance accounts
  await prisma.settlementClearance.createMany({
    data: [
      {
        accountNumber: "MS123456",
        accountName: "Settlement Account 1",
        amount: 50000,
        bankName: "MightyShare Account",
        dueDate: new Date("2025-10-15"),
        status: "pending",
        priority: "high",
        notes: "High priority clearance needed",
      },
      {
        accountNumber: "MS789012",
        accountName: "Settlement Account 2",
        amount: 75000,
        bankName: "MightyShare Account",
        dueDate: new Date("2025-10-12"),
        status: "processing",
        priority: "normal",
      },
      {
        accountNumber: "MS345678",
        accountName: "Settlement Account 3",
        amount: 120000,
        bankName: "MightyShare Account",
        dueDate: new Date("2025-10-20"),
        status: "pending",
        priority: "normal",
      },
    ],
  });

  console.log("✅ Seed settlement clearance accounts created");

  // Seed Paid Settlement Accounts
  await prisma.paidSettlementAccount.createMany({
    data: [
      {
        accountNumber: "MS123456",
        accountName: "Settlement Account 1",
        bankName: "MightyShare Account",
        amount: 50000,
        settlementDate: new Date("2025-10-05"),
        reference: "REF-20251005-001",
        paymentMethod: "Bank Transfer",
      },
      {
        accountNumber: "MS789012",
        accountName: "Settlement Account 2",
        bankName: "MightyShare Account",
        amount: 75000,
        settlementDate: new Date("2025-10-03"),
        reference: "REF-20251003-002",
        paymentMethod: "Bank Transfer",
      },
      {
        accountNumber: "MS345678",
        accountName: "Settlement Account 3",
        bankName: "MightyShare Account",
        amount: 120000,
        settlementDate: new Date("2025-09-28"),
        reference: "REF-20250928-003",
        paymentMethod: "Bank Transfer",
      },
    ],
  });

  console.log("✅ Seed paid settlement accounts created");

  // Seed Next Settlement Accounts
  await prisma.nextSettlementAccount.createMany({
    data: [
      {
        accountNumber: "MS123456",
        accountName: "Settlement Account 1",
        bankName: "MightyShare Account",
        amount: 50000,
        scheduledDate: new Date("2025-10-16"),
        settlementCycle: "weekly",
        priority: "normal",
        status: "scheduled",
      },
      {
        accountNumber: "MS789012",
        accountName: "Settlement Account 2",
        bankName: "MightyShare Account",
        amount: 75000,
        scheduledDate: new Date("2025-10-31"),
        settlementCycle: "monthly",
        priority: "high",
        status: "scheduled",
      },
      {
        accountNumber: "MS345678",
        accountName: "Settlement Account 3",
        bankName: "MightyShare Account",
        amount: 120000,
        scheduledDate: new Date("2025-10-23"),
        settlementCycle: "weekly",
        priority: "normal",
        status: "scheduled",
      },
    ],
  });

  console.log("✅ Seed next settlement accounts created");

  // Seed Thrift Packages
  const thriftPackages = [
    {
      name: "Elite",
      price: 1300,
      duration: 50,
      profitPercentage: 100,
      description:
        "100% profit after 50 weeks. Double your investment with our premium elite package.",
      terms:
        "Terms & Conditions Apply. Weekly contributions required. Minimum commitment period applies.",
      isActive: true,
      features: [
        "Double your investment",
        "Weekly contributions",
        "Flexible withdrawal options",
        "Priority customer support",
        "Exclusive investment insights",
      ],
    },
    {
      name: "Premium",
      price: 1000,
      duration: 40,
      profitPercentage: 80,
      description:
        "80% profit after 40 weeks. High returns for serious investors.",
      terms: "Terms & Conditions Apply. Monthly contributions available.",
      isActive: true,
      features: [
        "High returns (80% profit)",
        "Monthly contributions",
        "Standard withdrawal",
        "Email support",
        "Regular performance reports",
      ],
    },
    {
      name: "Standard",
      price: 500,
      duration: 26,
      profitPercentage: 50,
      description:
        "50% profit after 26 weeks. Perfect balance of time and returns.",
      terms: "Terms & Conditions Apply. Bi-weekly contributions supported.",
      isActive: true,
      features: [
        "Steady growth (50% profit)",
        "Bi-weekly contributions",
        "Basic withdrawal",
        "Standard support",
        "Quarterly updates",
      ],
    },
    {
      name: "Starter",
      price: 200,
      duration: 13,
      profitPercentage: 25,
      description:
        "25% profit after 13 weeks. Great for beginners starting their savings journey.",
      terms: "Terms & Conditions Apply. Quick turnaround time.",
      isActive: true,
      features: [
        "Perfect for beginners",
        "Weekly contributions",
        "Quick turnaround (13 weeks)",
        "Community support",
        "Learning resources",
      ],
    },
  ];

  for (const pkg of thriftPackages) {
    await prisma.thriftPackage.create({
      data: pkg,
    });
  }

  console.log("✅ Seed thrift packages created");

  // Seed Thrift Subscriptions
  const packages = await prisma.thriftPackage.findMany();

  if (packages.length > 0) {
    // Subscribe user to Elite package
    const elitePackage = packages.find((p) => p.name === "Elite");
    if (elitePackage) {
      const startDate = new Date("2025-01-15");
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + elitePackage.duration * 7);

      await prisma.thriftSubscription.create({
        data: {
          userId: user.id,
          packageId: elitePackage.id,
          amountInvested: 1300,
          startDate,
          endDate,
          expectedReturn: 2600,
          status: "active",
        },
      });
    }

    // Subscribe to Premium package
    const premiumPackage = packages.find((p) => p.name === "Premium");
    if (premiumPackage) {
      const startDate = new Date("2024-12-01");
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + premiumPackage.duration * 7);

      await prisma.thriftSubscription.create({
        data: {
          userId: user.id,
          packageId: premiumPackage.id,
          amountInvested: 1000,
          startDate,
          endDate,
          expectedReturn: 1800,
          status: "active",
        },
      });
    }

    // Subscribe to Standard package (completed)
    const standardPackage = packages.find((p) => p.name === "Standard");
    if (standardPackage) {
      const startDate = new Date("2024-09-01");
      const endDate = new Date("2025-03-01");

      await prisma.thriftSubscription.create({
        data: {
          userId: user.id,
          packageId: standardPackage.id,
          amountInvested: 500,
          startDate,
          endDate,
          expectedReturn: 750,
          actualReturn: 750,
          status: "completed",
          completedAt: endDate,
        },
      });
    }

    console.log("✅ Seed thrift subscriptions created");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => prisma.$disconnect());
