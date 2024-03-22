import { productSeed } from './products';

export const productCategoriesSeed = [
  {
    description: 'COMPUTER',
    products: { createMany: { data: productSeed } },
    title: 'COMPUTER',
  },
  {
    description: 'NOTEBOOK',
    products: { createMany: { data: productSeed } },
    title: 'NOTEBOOK',
  },
  {
    description: 'MONITOR',
    products: { createMany: { data: productSeed } },
    title: 'MONITOR',
  },
];
