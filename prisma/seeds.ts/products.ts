import { v4 as uuidv4 } from 'uuid';

export const productSeed = {
  sku: uuidv4(),
  title: 'computer',
  subtitle: 'computer',
  description: 'computer',
  url_banner: 'https://i.imgur.com/2HFGvvT.png',
  value: 1000,
  discount: 100,
};
