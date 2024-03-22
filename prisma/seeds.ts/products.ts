/* eslint-disable sort-keys */
import { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

export const productSeed: Prisma.ProductCreateManyInput[] = [
  {
    company_id: 'b4cce349-7c0b-41c7-9b3e-c21c9f0c2e4c',
    description:
      'Intel Core i5-10300H, Memória8gb, 256Gb SSD PCIe, NVIDEA GeForce GTX 1650 4gb',
    discount: Number(Math.floor(Math.random() * 100)),
    price: Number(Math.floor(Math.random() * 10000)),
    sku: faker.datatype.uuid(),
    subtitle: 'Ideapad Gaming3I',
    title: 'Notebook',
    urlBanner: 'https://imgur.com/aDk3w0x.jpeg',
  },
  {
    company_id: 'b4cce349-7c0b-41c7-9b3e-c21c9f0c2e4c',
    description:
      'Intel Core i7-10300H, Memória16gb, 480Gb SSD PCIe, NVIDEA GeForce GTX 1650 8gb',
    discount: Number(Math.floor(Math.random() * 100)),
    price: Number(Math.floor(Math.random() * 10000)),
    sku: faker.datatype.uuid(),
    subtitle: 'Gamer Master',
    title: 'Computador',
    urlBanner: 'https://i.imgur.com/7xrToah.jpeg',
  },
  {
    sku: faker.datatype.uuid(),
    title: 'Monitor',
    subtitle: 'Gamer',
    description: 'Tela Full HD 4k Antireflexo',
    urlBanner: 'https://imgur.com/LXwXtOR.jpeg',
    price: Number(Math.floor(Math.random() * 10000)),
    discount: Number(Math.floor(Math.random() * 100)),
    company_id: 'b4cce349-7c0b-41c7-9b3e-c21c9f0c2e4c',
  },
  {
    sku: faker.datatype.uuid(),
    title: 'Teclado',
    subtitle: 'Teclado Mecanico Gamer',
    description:
      '19 Modos de Iluminação RGB incluindo modo de personalização individual de Teclas; 12 Teclas para controle Multimídia',
    urlBanner: 'https://imgur.com/xpYSoVN.jpeg',
    price: Number(Math.floor(Math.random() * 10000)),
    discount: Number(Math.floor(Math.random() * 100)),
    company_id: 'b4cce349-7c0b-41c7-9b3e-c21c9f0c2e4c',
  },
  {
    sku: faker.datatype.uuid(),
    title: 'Mouse',
    subtitle: 'Mouse Gamer',
    description: '500bpi',
    urlBanner: 'https://i.imgur.com/2ifI0uy.jpeg',
    price: Number(Math.floor(Math.random() * 10000)),
    discount: Number(Math.floor(Math.random() * 100)),
    company_id: 'b4cce349-7c0b-41c7-9b3e-c21c9f0c2e4c',
  },
  {
    sku: faker.datatype.uuid(),
    title: 'Cadeira',
    subtitle: 'Cadeira Gamer',
    description: 'Super Ergonomica',
    urlBanner: 'https://i.imgur.com/9npHInE.jpeg',
    price: Number(Math.floor(Math.random() * 10000)),
    discount: Number(Math.floor(Math.random() * 100)),
    company_id: 'b4cce349-7c0b-41c7-9b3e-c21c9f0c2e4c',
  },
];
