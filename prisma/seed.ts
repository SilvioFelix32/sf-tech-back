import { PrismaClient } from '@prisma/client';
import { companySeed } from './seeds.ts/companies';

const prisma = new PrismaClient();

async function main() {
  await prisma.company.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  await Promise.all(
    companySeed.map(async (company) => {
      await prisma.company.create({
        data: company,
      });
    }),
  );
}

main()
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
