import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: {
      fullname: "Demo User",
      phone: "08000000000",
      password: hashedPassword,
      plan: "A",
      referralId: "REF-123456",
      accounts: {
        create: { accountNumber: "MS123456", balance: 0 },
      },
    },
  });

  console.log("✅ Seed user created");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => prisma.$disconnect());
