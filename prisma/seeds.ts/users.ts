import { Prisma, prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

export const userSeed: Prisma.UserCreateInput[] = Array.from(
  { length: 50 },
  (): Prisma.UserCreateInput => ({
    document: String(Math.floor(Math.random() * 10000000000)),
    name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    password: faker.internet.password(),
    email: faker.internet.email(),
    celphone: faker.phone.number('+55 ## #####-####'),
    city: faker.address.city(),
    state: faker.address.state(),
    address: faker.address.street(),
    address_complement: faker.address.direction(),
    address_number: faker.address.buildingNumber(),
    cep: faker.address.zipCode('29285-000'),
    birth_date: faker.date.birthdate(),
  }),
);

export const masterUserSeed: Prisma.UserCreateInput = {
  document: String(Math.floor(Math.random() * 10000000000)),
  name: 'Master',
  last_name: 'User',
  password: 'masterPassword',
  email: faker.internet.email('user@prisma.com'),
  celphone: faker.phone.number('+55 ## #####-####'),
  city: faker.address.city(),
  state: faker.address.state(),
  address: faker.address.street(),
  address_complement: faker.address.direction(),
  address_number: faker.address.buildingNumber(),
  cep: faker.address.zipCode('29285-000'),
  birth_date: faker.date.birthdate(),
};

export default {
  userSeed,
  masterUserSeed,
};
