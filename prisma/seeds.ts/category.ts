import {
  chairsSeed,
  computersSeed,
  monitorsSeed,
  notebooksSeed,
  peripheralsSeed,
} from './products';

export const productCategoriesSeed = [
  {
    description: 'COMPUTADORES',
    products: { createMany: { data: computersSeed } },
    title: 'COMPUTADORES',
  },
  {
    description: 'NOTEBOOK',
    products: { createMany: { data: notebooksSeed } },
    title: 'NOTEBOOK',
  },
  {
    description: 'MONITORES',
    products: { createMany: { data: monitorsSeed } },
    title: 'MONITORES',
  },
  {
    description: 'PERIFÉRICOS',
    products: { createMany: { data: peripheralsSeed } },
    title: 'PERIFÉRICOS',
  },
  {
    description: 'CADEIRAS',
    products: { createMany: { data: chairsSeed } },
    title: 'CADEIRAS',
  },
];
