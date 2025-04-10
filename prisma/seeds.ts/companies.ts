import { Prisma } from '@prisma/client';
import { productCategoriesSeed } from './category';

export const companiesSeed: Prisma.CompanyCreateInput[] = [
  {
    company_id: 'b4cce349-7c0b-41c7-9b3e-c21c9f0c2e4c',
    email: 'sftech@mailinator.com',
    fantasyName: 'sftech',
    name: 'sftech',
    productCategories: { create: productCategoriesSeed },
    //users: { createMany: { data: userSeed } },
  },
];
