import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('seller123', 12);
  await userService.update({
    where: { email: 'seller@ecom.dev' },
    data: { passwordHash },
  });
  console.log('Seller password updated to seller123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
