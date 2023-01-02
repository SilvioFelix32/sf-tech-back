import { Prisma, ProductType } from '@prisma/client';
import { productSeed } from './products';

export const productCategoriesSeed = {
  product_type: ProductType.COMPUTER,
  title: 'COMPUTER',
  description: 'COMPUTER',
  products: { create: productSeed },
};
