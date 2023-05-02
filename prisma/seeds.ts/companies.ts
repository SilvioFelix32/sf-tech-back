import { Prisma } from '@prisma/client';
import { productCategoriesSeed } from './productsCategories';
import { userSeed } from './users';
import { faker } from '@faker-js/faker';

export const companiesSeed: Prisma.CompanyCreateInput[] = [
  {
    id: 'b4cce349-7c0b-41c7-9b3e-c21c9f0c2e4c',
    name: 'sftech',
    fantasy_name: 'sftech',
    document: String(Math.floor(Math.random() * 10000000000)),
    phone: '00 00000000',
    cellphone: faker.phone.number('+55 ## #####-####'),
    email: 'sftech@corp.com.br',
    users: { createMany: { data: userSeed } },
    product_categories: { create: productCategoriesSeed },
    company_params: {
      create: {
        environment: 'HOMOLOGATION',
        url_banner: faker.image.avatar()
      },
    },
  },
];
