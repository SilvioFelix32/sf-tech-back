import { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

export const userSeed: Prisma.UserCreateInput[] = Array.from(
  { length: 50 },
  (): Prisma.UserCreateInput => ({
    email: faker.internet.email(),
    lastName: faker.name.lastName(),
    name: faker.name.firstName(),
    password: faker.internet.password(),
    role: 'USER',
  }),
);

userSeed.push(
  {
    email: 'materUser@mailinator.com',
    lastName: 'Master',
    name: 'User',
    password: 'Master123',
    role: 'MASTER',
  },
  {
    email: 'adminUser@mailinator.com',
    lastName: 'Admin',
    name: 'User',
    password: 'Admin123',
    role: 'ADMIN',
  },
);

export default {
  userSeed,
};
