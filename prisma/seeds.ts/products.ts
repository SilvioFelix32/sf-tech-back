import { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

export const monitorsSeed: Prisma.ProductCreateManyInput[] = [
  {
    sku: faker.string.uuid(),
    title: 'Monitor Standard',
    subtitle: 'Standard',
    description: 'Tela HD 60hz',
    urlBanner: 'https://i.imgur.com/7o8d4Ex.png',
    price: 500,
    discount: Number(Math.floor(Math.random() * 100)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Monitor Evolution',
    subtitle: 'Evolution',
    description: 'Tela Full HD Antireflexo 75hz',
    urlBanner: 'https://i.imgur.com/wxztCLh.jpeg',
    price: 1000,
    discount: Number(Math.floor(Math.random() * 100)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Monitor Gamer',
    subtitle: 'Gamer',
    description: 'Tela Full HD 4k Antireflexo 120hz',
    urlBanner: 'https://i.imgur.com/wxztCLh.jpeg',
    price: 1800,
    discount: Number(Math.floor(Math.random() * 100)),
    highlighted: true,
  },
];

export const notebooksSeed: Prisma.ProductCreateManyInput[] = [
  {
    description:
      'Intel Core i3-10300H, Memória8gb, 120Gb SSD PCIe, NVIDEA GeForce GTX 650 2gb',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 5000,
    sku: faker.string.uuid(),
    subtitle: 'Ideapad Gaming3I',
    title: 'Notebook Starter',
    urlBanner: 'https://i.imgur.com/aDk3w0x.png',
  },
  {
    description:
      'Intel Core i5-10300H, Memória16gb, 240Gb SSD PCIe, NVIDEA GeForce GTX 950 4gb',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 6000,
    sku: faker.string.uuid(),
    subtitle: 'Ideapad Gaming3I',
    title: 'Notebook Evolution',
    urlBanner: 'https://i.imgur.com/aDk3w0x.png',
  },
  {
    description:
      'Intel Core i7-10300H, Memória32gb, 480Gb SSD PCIe, NVIDEA GeForce GTX 1650 8gb',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 7000,
    sku: faker.string.uuid(),
    subtitle: 'Ideapad Gaming3I',
    title: 'Notebook Master',
    urlBanner: 'https://i.imgur.com/aDk3w0x.png',
    highlighted: true,
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
    urlBanner: 'https://i.imgur.com/YvXrCsS.png',
  },
  {
    description:
      'Intel Core i5-10300H, Memória16gb, 240Gb SSD PCIe, NVIDEA GeForce GTX 950 4gb',
    discount: Number(Math.floor(Math.random() * 100)),
    price: Number(Math.floor(Math.random() * 10000)),
    sku: faker.string.uuid(),
    subtitle: 'Gamer Evolution',
    title: 'Computador',
    urlBanner: 'https://i.imgur.com/YvXrCsS.png',
  },
  {
    description:
      'Intel Core i7-10300H, Memória32gb, 480Gb SSD PCIe, NVIDEA GeForce GTX 1650 8gb',
    discount: Number(Math.floor(Math.random() * 100)),
    price: Number(Math.floor(Math.random() * 10000)),
    sku: faker.string.uuid(),
    subtitle: 'Gamer Master',
    title: 'Computador',
    urlBanner: 'https://i.imgur.com/YvXrCsS.png',
  },
];

export const chairsSeed: Prisma.ProductCreateManyInput[] = [
  {
    description:
      'Cadeira Gamer Start de tecido é projetada para oferecer conforto e estilo durante longas sessões de jogos.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 1500,
    sku: faker.string.uuid(),
    subtitle: 'Cadeira Gamer Start',
    title: 'Cadeira Gamer Start',
    urlBanner: 'https://i.imgur.com/F8MysQb.png',
  },
  {
    description:
      'Cadeira Gamer Avançada de couro é projetada para oferecer conforto e estilo durante longas sessões de jogos. Feita com revestimento em couro sintético ou legítimo, ela combina durabilidade e facilidade de limpeza. Possui um design ergonômico com encosto ajustável, apoio de cabeça, almofadas lombares, e braços reguláveis, proporcionando suporte ideal para o corpo e uma experiência de jogo imersiva.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 1800,
    sku: faker.string.uuid(),
    subtitle: 'Cadeira Gamer Avançada',
    title: 'Cadeira Gamer Avançada',
    urlBanner: 'https://i.imgur.com/OtQJb1Q.jpeg',
  },
  {
    description:
      'Uma cadeira presidencial de couro combina elegância e funcionalidade, ideal para ambientes corporativos sofisticados. Revestida em couro premium, oferece encosto alto com design ergonômico, ajuste de altura, inclinação reclinável com trava, apoio para braços acolchoado e base robusta de aço cromado. Conforto e imponência para lideranças que buscam excelência.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 2500,
    sku: faker.string.uuid(),
    subtitle: 'Cadeira Presidencial',
    title: 'Cadeira Presidencial de luxo',
    urlBanner: 'https://i.imgur.com/OtQJb1Q.jpeg',
    highlighted: true,
  },
];

export const processorsSeed: Prisma.ProductCreateManyInput[] = [
  {
    title: 'Processador Intel Core i3-10300H',
    description: 'Processador Intel Core i3-10300H',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 1500,
    urlBanner: 'https://i.imgur.com/Vnvcvi1.png',
  },
  {
    title: 'Processador Intel Core i5-10300H',
    description: 'Processador Intel Core i5-10300H',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 2500,
    urlBanner: 'https://i.imgur.com/Vnvcvi1.png',
  },
  {
    title: 'Processador Intel Core i7-10300H',
    description: 'Processador Intel Core i7-10300H',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 3500,
    urlBanner: 'https://i.imgur.com/Vnvcvi1.png',
  },
];

export const motherboardsSeed: Prisma.ProductCreateManyInput[] = [
  {
    title: 'Placa-mãe Asus Prime A320M-A',
    description: 'Placa-mãe Asus Prime A320M-A',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 1500,
    urlBanner: 'https://i.imgur.com/Vnvcvi1.png',
  },
  {
    title: 'Placa-mãe Asus Prime A320M-A',
    description: 'Placa-mãe Asus Prime A320M-A',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 2500,
    urlBanner: 'https://i.imgur.com/Vnvcvi1.png',
  },
  {
    title: 'Placa-mãe Asus Prime A320M-A',
    description: 'Placa-mãe Asus Prime A320M-A',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 3500,
    urlBanner: 'https://i.imgur.com/Vnvcvi1.png',
  },
];

export const memorySeed: Prisma.ProductCreateManyInput[] = [
  {
    title: 'Memória DDR4 Kingston Fury Beast',
    description: 'Memória DDR4 Kingston Fury Beast',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 300,
    urlBanner: 'https://i.imgur.com/Vnvcvi1.png',
  },
  {
    title: 'Memória DDR4 Kingston Fury Beast',
    description: 'Memória DDR4 Kingston Fury Beast',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 400,
    urlBanner: 'https://i.imgur.com/Vnvcvi1.png',
  },
  {
    title: 'Memória DDR4 Kingston Fury Beast',
    description: 'Memória DDR4 Kingston Fury Beast',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 500,
    urlBanner: 'https://i.imgur.com/Vnvcvi1.png',
  },
];

export const miceSeed: Prisma.ProductCreateManyInput[] = [
  {
    sku: faker.string.uuid(),
    title: 'Mouse Dragon',
    subtitle: 'Mouse Dragon',
    description: '500bpi',
    urlBanner: 'https://i.imgur.com/oREVNQt.png',
    price: 40,
    discount: Number(Math.floor(Math.random() * 10)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Mouse Gamer',
    subtitle: 'Mouse Gamer Dragon',
    description: '500bpi',
    urlBanner: 'https://i.imgur.com/oREVNQt.png',
    price: 80,
    discount: Number(Math.floor(Math.random() * 10)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Mouse Letron',
    subtitle: 'Mouse letron',
    description: '500bpi',
    urlBanner: 'https://i.imgur.com/oREVNQt.png',
    price: 30,
    discount: Number(Math.floor(Math.random() * 10)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Mouse Gamer Letron',
    subtitle: 'Mouse Gamer letron',
    description: '500bpi',
    urlBanner: 'https://i.imgur.com/oREVNQt.png',
    price: 100,
    discount: Number(Math.floor(Math.random() * 10)),
  },
];

export const keyboardsSeed: Prisma.ProductCreateManyInput[] = [
  {
    sku: faker.string.uuid(),
    title: 'Teclado',
    subtitle: 'Teclado Mecanico Gamer',
    description:
      '19 Modos de Iluminação RGB incluindo modo de personalização individual de Teclas; 12 Teclas para controle Multimídia',
    urlBanner: 'https://i.imgur.com/ECUixqO.png',
    price: 300,
    discount: Number(Math.floor(Math.random() * 100)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Teclado',
    subtitle: 'Teclado Mecanico',
    description:
      '19 Modos de Iluminação RGB incluindo modo de personalização individual de Teclas; 12 Teclas para controle Multimídia',
    urlBanner: 'https://i.imgur.com/ECUixqO.png',
    price: 200,
    discount: Number(Math.floor(Math.random() * 100)),
  },
];
