import { Prisma, ProductType } from '@prisma/client';
import { productSeed } from './products';

export const productCategoriesSeed = [
  {
    product_type: ProductType.COMPUTER,
    title: 'COMPUTER',
    description: 'COMPUTER',
    products: { createMany: { data: productSeed } },
  },
  {
    product_type: ProductType.NOTEBOOK,
    title: 'NOTEBOOK',
    description: 'NOTEBOOK',
    products: { createMany: { data: productSeed } },
  },
  {
    product_type: ProductType.MONITOR,
    title: 'MONITOR',
    description: 'MONITOR',
    products: { createMany: { data: productSeed } },
  },
];
