import {
  computersSeed,
  monitorsSeed,
  notebooksSeed,
  peripheralsSeed,
} from './products';

export const productCategoriesSeed = [
  {
    description: 'COMPUTER',
    products: { createMany: { data: computersSeed } },
    title: 'COMPUTER',
  },
  {
    description: 'NOTEBOOK',
    products: { createMany: { data: notebooksSeed } },
    title: 'NOTEBOOK',
  },
  {
    description: 'MONITOR',
    products: { createMany: { data: monitorsSeed } },
    title: 'MONITOR',
  },
  {
    description: 'PERIFÉRICOS',
    products: { createMany: { data: peripheralsSeed } },
    title: 'PERIFÉRICOS',
  },
];
