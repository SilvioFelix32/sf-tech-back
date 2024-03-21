import { Prisma } from '@prisma/client';
import { userSeed } from './users';
import { productCategoriesSeed } from './category';
import { productSeed } from './products';

export const companiesSeed: Prisma.CompanyCreateInput[] = [
  {
    company_id: 'b4cce349-7c0b-41c7-9b3e-c21c9f0c2e4c',
    email: 'sftech@mailinator.com',
    fantasyName: 'sftech',
    name: 'sftech',
    productCategories: { createMany: { data: productCategoriesSeed } },
    products: { createMany: { data: productSeed } },
    users: { createMany: { data: userSeed } },
  },
];
