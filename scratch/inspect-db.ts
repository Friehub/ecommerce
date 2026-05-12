import { prisma } from '@ecom/db';

async function main() {
  const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
  console.log(JSON.stringify(tables, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
