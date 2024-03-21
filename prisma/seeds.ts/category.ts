import { Prisma } from '@prisma/client';

export const productCategoriesSeed: Prisma.ProductCategoryCreateInput[] =
  Array.from(
    { length: 1 },
    (): Prisma.ProductCategoryCreateInput => ({
      description: 'PERIFERICOS',
      title: 'PERIFERICOS',
    }),
  );

productCategoriesSeed.push(
  {
    description: 'COMPUTER',
    title: 'COMPUTER',
  },
  {
    description: 'NOTEBOOK',
    title: 'NOTEBOOK',
  },
  {
    description: 'MONITOR',
    title: 'MONITOR',
  },
);
