import { Prisma } from '@prisma/client';
import { companyParamsSeed } from './company-params';
import { productCategoriesSeed } from './productsCategories';
import { userSeed } from './users';

export const companySeed: Prisma.CompanyCreateInput[] = [
  {
    name: 'sftech',
    fantasy_name: 'sftech',
    document: '000000000',
    phone: '00 00000000',
    cellphone: '00 00000000',
    email: 'sftech@corp.com.br',
    users: { createMany: { data: userSeed } },
    product_categories: { create: productCategoriesSeed },
    company_params: {
      create: {
        environment: 'HOMOLOGATION',
        url_banner: 'http://',
      },
    },
  },
];
