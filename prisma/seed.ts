import { PrismaClient } from '@prisma/client';
import { companiesSeed } from './seeds.ts/companies';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.company.deleteMany({});

  await Promise.all(
    companiesSeed.map(async (company) => {
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
