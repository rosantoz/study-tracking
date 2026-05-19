import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  for (let i = 1; i <= 10; i++) {
    const email = `student${i}@example.com`;
    await prisma.student.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `Student ${i}`,
        passwordHash,
      },
    });
  }

  const count = await prisma.student.count();
  console.log(`Seeded ${count} students. Login with student1@example.com .. student10@example.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
