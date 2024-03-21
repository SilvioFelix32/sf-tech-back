import { Prisma } from '@prisma/client';
import { productSeed } from './products';
import { userSeed } from './users';

export const companiesSeed: Prisma.CompanyCreateInput[] = [
  {
    company_id: 'b4cce349-7c0b-41c7-9b3e-c21c9f0c2e4c',
    email: 'sftech@mailinator.com',
    fantasyName: 'sftech',
    name: 'sftech',
    products: { createMany: { data: productSeed } },
    users: { createMany: { data: userSeed } },
  },
];
