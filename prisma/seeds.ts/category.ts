import {
  chairsSeed,
  computersSeed,
  keyboardsSeed,
  memorySeed,
  miceSeed,
  monitorsSeed,
  motherboardsSeed,
  notebooksSeed,
  processorsSeed,
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
    description: 'CADEIRAS',
    products: { createMany: { data: chairsSeed } },
    title: 'CADEIRAS',
  },
  {
    description: 'MOUSES',
    products: { createMany: { data: miceSeed } },
    title: 'MOUSES',
  },
  {
    description: 'TECLADOS',
    products: { createMany: { data: keyboardsSeed } },
    title: 'TECLADOS',
  },
  {
    description: 'PROCESSADORES',
    products: { createMany: { data: processorsSeed } },
    title: 'PROCESSADORES',
  },
  {
    description: 'PLACAS-MÃE',
    products: { createMany: { data: motherboardsSeed } },
    title: 'PLACAS-MÃE',
  },
  {
    description: 'MEMÓRIAS',
    products: { createMany: { data: memorySeed } },
    title: 'MEMÓRIAS',
  },
];
