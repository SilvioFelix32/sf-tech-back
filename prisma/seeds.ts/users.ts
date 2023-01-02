import { Prisma } from '@prisma/client';

export const userSeed: Prisma.UserCreateInput[] = [
  {
    document: '00000000000',
    name: 'admin',
    last_name: 'last_name',
    password: 'admin',
    email: 'admin@hotmail.com',
  },
  {
    document: '00000000001',
    name: 'user',
    last_name: 'last_name',
    password: 'user',
    email: 'user@hotmail.com',
  },
];
