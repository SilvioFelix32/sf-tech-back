import { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

export const peripheralsSeed: Prisma.ProductCreateManyInput[] = [
  {
    sku: faker.string.uuid(),
    title: 'Teclado',
    subtitle: 'Teclado Mecanico Gamer',
    description:
      '19 Modos de Iluminação RGB incluindo modo de personalização individual de Teclas; 12 Teclas para controle Multimídia',
    urlBanner: 'https://imgur.com/xpYSoVN.jpeg',
    price: Number(Math.floor(Math.random() * 10000)),
    discount: Number(Math.floor(Math.random() * 100)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Mouse',
    subtitle: 'Mouse Gamer',
    description: '500bpi',
    urlBanner: 'https://i.imgur.com/2ifI0uy.jpeg',
    price: Number(Math.floor(Math.random() * 10000)),
    discount: Number(Math.floor(Math.random() * 100)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Cadeira',
    subtitle: 'Cadeira Gamer',
    description: 'Super Ergonomica',
    urlBanner: 'https://i.imgur.com/9npHInE.jpeg',
    price: Number(Math.floor(Math.random() * 10000)),
    discount: Number(Math.floor(Math.random() * 100)),
  },
];

export const monitorsSeed: Prisma.ProductCreateManyInput[] = [
  {
    sku: faker.string.uuid(),
    title: 'Monitor Standard',
    subtitle: 'Standard',
    description: 'Tela HD 60hz',
    urlBanner: 'https://imgur.com/LXwXtOR.jpeg',
    price: Number(Math.floor(Math.random() * 10000)),
    discount: Number(Math.floor(Math.random() * 100))
  },
  {
    sku: faker.string.uuid(),
    title: 'Monitor Evolution',
    subtitle: 'Evolution',
    description: 'Tela Full HD Antireflexo 75hz',
    urlBanner: 'https://imgur.com/LXwXtOR.jpeg',
    price: Number(Math.floor(Math.random() * 10000)),
    discount: Number(Math.floor(Math.random() * 100)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Monitor Gamer',
    subtitle: 'Gamer',
    description: 'Tela Full HD 4k Antireflexo 120hz',
    urlBanner: 'https://imgur.com/LXwXtOR.jpeg',
    price: Number(Math.floor(Math.random() * 10000)),
    discount: Number(Math.floor(Math.random() * 100)),
  },
];

export const notebooksSeed: Prisma.ProductCreateManyInput[] = [
  {
    description:
      'Intel Core i3-10300H, Memória8gb, 120Gb SSD PCIe, NVIDEA GeForce GTX 650 2gb',
    discount: Number(Math.floor(Math.random() * 100)),
    price: Number(Math.floor(Math.random() * 10000)),
    sku: faker.string.uuid(),
    subtitle: 'Ideapad Gaming3I',
    title: 'Notebook Starter',
    urlBanner: 'https://imgur.com/aDk3w0x.jpeg',
  },
  {
    description:
      'Intel Core i5-10300H, Memória16gb, 240Gb SSD PCIe, NVIDEA GeForce GTX 950 4gb',
    discount: Number(Math.floor(Math.random() * 100)),
    price: Number(Math.floor(Math.random() * 10000)),
    sku: faker.string.uuid(),
    subtitle: 'Ideapad Gaming3I',
    title: 'Notebook Evolution',
    urlBanner: 'https://imgur.com/aDk3w0x.jpeg',
  },
  {
    description:
      'Intel Core i7-10300H, Memória32gb, 480Gb SSD PCIe, NVIDEA GeForce GTX 1650 8gb',
    discount: Number(Math.floor(Math.random() * 100)),
    price: Number(Math.floor(Math.random() * 10000)),
    sku: faker.string.uuid(),
    subtitle: 'Ideapad Gaming3I',
    title: 'Notebook Master',
    urlBanner: 'https://imgur.com/aDk3w0x.jpeg',
  },
];

export const computersSeed: Prisma.ProductCreateManyInput[] = [
  {
    description:
      'Intel Core i3-10300H, Memória8gb, 120Gb SSD PCIe, NVIDEA GeForce GTX 650 2gb',
    discount: Number(Math.floor(Math.random() * 100)),
    price: Number(Math.floor(Math.random() * 10000)),
    sku: faker.string.uuid(),
    subtitle: 'Gamer Starter',
    title: 'Computador',
    urlBanner: 'https://i.imgur.com/7xrToah.jpeg',
  },
  {
    description:
      'Intel Core i5-10300H, Memória16gb, 240Gb SSD PCIe, NVIDEA GeForce GTX 950 4gb',
    discount: Number(Math.floor(Math.random() * 100)),
    price: Number(Math.floor(Math.random() * 10000)),
    sku: faker.string.uuid(),
    subtitle: 'Gamer Evolution',
    title: 'Computador',
    urlBanner: 'https://i.imgur.com/7xrToah.jpeg',
  },
  {
    description:
      'Intel Core i7-10300H, Memória32gb, 480Gb SSD PCIe, NVIDEA GeForce GTX 1650 8gb',
    discount: Number(Math.floor(Math.random() * 100)),
    price: Number(Math.floor(Math.random() * 10000)),
    sku: faker.string.uuid(),
    subtitle: 'Gamer Master',
    title: 'Computador',
    urlBanner: 'https://i.imgur.com/7xrToah.jpeg',
  },
];
