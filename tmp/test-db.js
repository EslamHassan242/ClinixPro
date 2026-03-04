const { PrismaClient } = require('@clinixpro/database');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Prisma connection...');
    const result = await prisma.tenant.findMany({ take: 1 });
    console.log('Connection successful! Found tenants:', result.length);
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
