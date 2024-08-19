import { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

export const userSeed: Prisma.UserCreateInput[] = Array.from(
  { length: 50 },
  (): Prisma.UserCreateInput => ({
    email: faker.internet.email(),
    lastName: faker.person.lastName(),
    name: faker.person.firstName(),
    password: faker.internet.password(),
    role: 'USER',
  }),
);

export default {
  userSeed,
};
