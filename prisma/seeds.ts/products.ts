import { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

export const monitorsSeed: Prisma.ProductCreateManyInput[] = [
  {
    sku: faker.string.uuid(),
    title: 'Monitor HD 21.5" - Ideal para Trabalho e Estudos',
    subtitle: 'Resolução HD 60Hz - Conexão VGA e HDMI',
    description:
      'Monitor perfeito para uso diário com tela HD de 21.5 polegadas e taxa de atualização de 60Hz. Ideal para trabalhos, estudos e navegação. Design moderno e slim, conexões VGA e HDMI inclusas. Economia de energia e proteção contra luz azul para maior conforto visual.',
    urlBanner: 'https://i.imgur.com/A2Y7xIV.png',
    price: 500,
    discount: Number(Math.floor(Math.random() * 100)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Monitor Full HD 24" Evolution - Antireflexo Premium',
    subtitle: 'Full HD 75Hz - Tecnologia Antireflexo',
    description:
      'Monitor Full HD de 24 polegadas com taxa de atualização de 75Hz e tecnologia antireflexo para maior conforto visual. Perfeito para quem busca qualidade de imagem superior sem cansar os olhos. Design elegante, ajuste de inclinação e conexões HDMI e VGA. Ideal para trabalho profissional e entretenimento.',
    urlBanner: 'https://i.imgur.com/A2Y7xIV.png',
    price: 1000,
    discount: Number(Math.floor(Math.random() * 100)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Monitor Gamer 4K 27" - Alta Performance para Jogos',
    subtitle: '4K Ultra HD 120Hz - Antireflexo e Low Latency',
    description:
      'Monitor gamer profissional de 27 polegadas com resolução 4K Ultra HD e impressionantes 120Hz de taxa de atualização. Tecnologia antireflexo avançada e modo de baixa latência para jogos competitivos. Suporte a HDR, ajuste de altura e inclinação, e múltiplas conexões incluindo DisplayPort e HDMI. A experiência definitiva para gamers exigentes.',
    urlBanner: 'https://i.imgur.com/KzsBdrz.jpeg',
    price: 1800,
    discount: Number(Math.floor(Math.random() * 100)),
    highlighted: true,
  },
];

export const notebooksSeed: Prisma.ProductCreateManyInput[] = [
  {
    description:
      'Notebook gamer ideal para iniciantes com processador Intel Core i3-10300H, 8GB de memória RAM, armazenamento SSD PCIe de 120GB e placa de vídeo NVIDIA GeForce GTX 650 com 2GB. Perfeito para jogos casuais, trabalho e estudos. Design moderno, teclado retroiluminado e sistema de refrigeração otimizado para longas sessões de uso.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 5000,
    sku: faker.string.uuid(),
    subtitle: 'Ideapad Gaming 3i - Intel i3, 8GB RAM, GTX 650',
    title: 'Notebook Gamer Starter - Ideapad Gaming 3i',
    urlBanner: 'https://i.imgur.com/aDk3w0x.png',
  },
  {
    description:
      'Notebook gamer de alto desempenho com processador Intel Core i5-10300H, 16GB de memória RAM, armazenamento SSD PCIe de 240GB e placa de vídeo NVIDIA GeForce GTX 950 com 4GB. Excelente para jogos modernos em configurações médias e altas, edição de vídeo e multitarefa pesada. Performance superior com design gamer autêntico.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 6000,
    sku: faker.string.uuid(),
    subtitle: 'Ideapad Gaming 3i - Intel i5, 16GB RAM, GTX 950',
    title: 'Notebook Gamer Evolution - Ideapad Gaming 3i',
    urlBanner: 'https://i.imgur.com/aDk3w0x.png',
  },
  {
    description:
      'Notebook gamer top de linha com processador Intel Core i7-10300H, 32GB de memória RAM, armazenamento SSD PCIe de 480GB e placa de vídeo NVIDIA GeForce GTX 1650 com 8GB. Máxima performance para jogos AAA em ultra, streaming profissional, edição 4K e trabalho pesado. A máquina definitiva para gamers e criadores de conteúdo.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 7000,
    sku: faker.string.uuid(),
    subtitle: 'Ideapad Gaming 3i - Intel i7, 32GB RAM, GTX 1650',
    title: 'Notebook Gamer Master - Ideapad Gaming 3i',
    urlBanner: 'https://i.imgur.com/aDk3w0x.png',
    highlighted: true,
  },
];

export const computersSeed: Prisma.ProductCreateManyInput[] = [
  {
    title: 'PC Gamer Starter - Montagem Completa Pronta para Jogar',
    subtitle: 'Intel i3, 8GB RAM, GTX 650 2GB, SSD 120GB',
    description:
      'Computador gamer completo e montado, pronto para uso imediato. Equipado com processador Intel Core i3-10300H, 8GB de memória RAM DDR4, armazenamento SSD PCIe de 120GB e placa de vídeo dedicada NVIDIA GeForce GTX 650 com 2GB. Gabinete gamer com iluminação RGB, fonte certificada e sistema de refrigeração otimizado. Perfeito para iniciantes no mundo gamer.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 3500,
    sku: faker.string.uuid(),
    urlBanner: 'https://i.imgur.com/hGkrDZG.jpeg',
  },
  {
    title: 'PC Gamer Evolution - Alto Desempenho para Jogos Modernos',
    subtitle: 'Intel i5, 16GB RAM, GTX 950 4GB, SSD 240GB',
    description:
      'Computador gamer de alto desempenho montado e testado. Processador Intel Core i5-10300H, 16GB de memória RAM DDR4, armazenamento SSD PCIe de 240GB e placa de vídeo NVIDIA GeForce GTX 950 com 4GB. Gabinete gamer premium com iluminação RGB personalizável, fonte 80 Plus Bronze e refrigeração líquida. Ideal para jogos modernos em alta qualidade.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 5500,
    sku: faker.string.uuid(),
    urlBanner: 'https://i.imgur.com/4uPOJds.jpeg',
  },
  {
    title: 'PC Gamer Master - Máxima Performance e Tecnologia',
    subtitle: 'Intel i7, 32GB RAM, GTX 1650 8GB, SSD 480GB',
    description:
      'Computador gamer top de linha montado profissionalmente. Processador Intel Core i7-10300H, 32GB de memória RAM DDR4 de alta performance, armazenamento SSD PCIe ultra-rápido de 480GB e placa de vídeo NVIDIA GeForce GTX 1650 com 8GB. Gabinete gamer premium com painel lateral em vidro temperado, iluminação RGB endereçável, fonte modular 80 Plus Gold e refrigeração líquida AIO. A máquina definitiva para gamers profissionais e criadores de conteúdo.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 8500,
    sku: faker.string.uuid(),
    urlBanner: 'https://i.imgur.com/4uPOJds.jpeg',
  },
];

export const chairsSeed: Prisma.ProductCreateManyInput[] = [
  {
    description:
      'Cadeira gamer ergonômica revestida em tecido respirável de alta qualidade, projetada para oferecer máximo conforto durante longas sessões de jogos ou trabalho. Design moderno com ajuste de altura, encosto reclinável até 180°, apoio de braços fixos e rodízios de 360° para mobilidade total. Suporte lombar integrado e estrutura robusta que suporta até 120kg. Perfeita para quem busca conforto e estilo acessível.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 1500,
    sku: faker.string.uuid(),
    subtitle: 'Tecido Respirável - Reclinável 180° - Suporta até 120kg',
    title: 'Cadeira Gamer Start - Conforto e Estilo',
    urlBanner: 'https://i.imgur.com/L7aW4qB.jpeg',
  },
  {
    description:
      'Cadeira gamer premium revestida em couro sintético de alta qualidade, combinando durabilidade, facilidade de limpeza e conforto superior. Design ergonômico avançado com encosto ajustável, apoio de cabeça removível, almofadas lombares e de pescoço, braços 4D totalmente reguláveis e sistema de inclinação com trava. Base em aço reforçado com rodízios silenciosos. A escolha ideal para gamers e profissionais que passam horas na frente do computador.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 1800,
    sku: faker.string.uuid(),
    subtitle: 'Couro Sintético - Braços 4D - Sistema de Inclinação',
    title: 'Cadeira Gamer Avançada - Premium Ergonômica',
    urlBanner: 'https://i.imgur.com/L7aW4qB.jpeg',
  },
  {
    description:
      'Cadeira presidencial executiva de luxo revestida em couro premium legítimo, combinando elegância sofisticada e funcionalidade ergonômica avançada. Ideal para ambientes corporativos de alto padrão e home offices executivos. Encosto alto com design ergonômico certificado, ajuste de altura pneumático, inclinação reclinável com trava de segurança, apoio para braços acolchoado e ajustável, base robusta em aço cromado com rodízios premium. Máximo conforto e imponência para líderes que buscam excelência e sofisticação.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 2500,
    sku: faker.string.uuid(),
    subtitle: 'Couro Legítimo Premium - Executiva de Alto Padrão',
    title: 'Cadeira Presidencial Executiva de Luxo',
    urlBanner: 'https://i.imgur.com/givyNTK.jpeg',
    highlighted: true,
  },
];

export const processorsSeed: Prisma.ProductCreateManyInput[] = [
  {
    title: 'Processador Intel Core i3-10300H - 4 Núcleos, 8 Threads',
    subtitle: '2.5GHz Base - 4.5GHz Turbo - Cache 8MB',
    description:
      'Processador Intel Core i3-10300H de 10ª geração com arquitetura Comet Lake. Possui 4 núcleos físicos, 8 threads, frequência base de 2.5GHz que pode chegar até 4.5GHz em modo turbo, e cache L3 de 8MB. Socket LGA 1200, TDP de 45W e suporte a memória DDR4. Ideal para computadores de entrada, uso geral, multitarefa básica e jogos casuais. Performance confiável para trabalho e entretenimento.',
    discount: Number(Math.floor(Math.random() * 100)),
    sku: faker.string.uuid(),
    price: 1500,
    urlBanner: 'https://i.imgur.com/tgC64BJ.jpeg',
  },
  {
    title: 'Processador Intel Core i5-10300H - 6 Núcleos, 12 Threads',
    subtitle: '2.5GHz Base - 4.5GHz Turbo - Cache 12MB',
    description:
      'Processador Intel Core i5-10300H de 10ª geração com arquitetura Comet Lake. Equipado com 6 núcleos físicos, 12 threads, frequência base de 2.5GHz que alcança até 4.5GHz em modo turbo, e cache L3 de 12MB. Socket LGA 1200, TDP de 45W e suporte a memória DDR4 de alta velocidade. Excelente para jogos modernos, edição de vídeo, streaming e multitarefa pesada. O equilíbrio perfeito entre performance e custo-benefício.',
    discount: Number(Math.floor(Math.random() * 100)),
    sku: faker.string.uuid(),
    price: 2500,
    urlBanner: 'https://i.imgur.com/tgC64BJ.jpeg',
  },
  {
    title: 'Processador Intel Core i7-10300H - 8 Núcleos, 16 Threads',
    subtitle: '2.5GHz Base - 5.0GHz Turbo - Cache 16MB',
    description:
      'Processador Intel Core i7-10300H de 10ª geração com arquitetura Comet Lake de alto desempenho. Possui 8 núcleos físicos, 16 threads, frequência base de 2.5GHz que pode atingir até 5.0GHz em modo turbo, e cache L3 generoso de 16MB. Socket LGA 1200, TDP de 45W e suporte a memória DDR4 de alta performance. Máxima performance para jogos AAA, streaming profissional, edição 4K, renderização 3D e trabalho pesado. A escolha dos profissionais e gamers exigentes.',
    discount: Number(Math.floor(Math.random() * 100)),
    sku: faker.string.uuid(),
    price: 3500,
    urlBanner: 'https://i.imgur.com/tgC64BJ.jpeg',
  },
];

export const motherboardsSeed: Prisma.ProductCreateManyInput[] = [
  {
    title: 'Placa-mãe Asus Prime A320M-A - Socket AM4',
    subtitle: 'AMD A320 - Suporta Ryzen 1ª, 2ª e 3ª Geração',
    description:
      'Placa-mãe Asus Prime A320M-A com chipset AMD A320 e socket AM4. Suporta processadores AMD Ryzen de 1ª, 2ª e 3ª geração. Formato micro-ATX compacto, 2 slots de memória DDR4 com suporte até 3200MHz, 4 portas SATA 6Gb/s, 1 slot PCIe 3.0 x16 para placa de vídeo, e conectores M.2 para SSD ultra-rápido. Áudio HD Realtek, rede Gigabit e USB 3.1. Ideal para montagens econômicas e eficientes.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 1500,
    sku: faker.string.uuid(),
    urlBanner: 'https://i.imgur.com/22S6hk4.jpeg',
  },
  {
    title: 'Placa-mãe Asus Prime B450M-A - Socket AM4',
    subtitle: 'AMD B450 - Suporta Ryzen até 5000 Series - Overclock',
    description:
      'Placa-mãe Asus Prime B450M-A com chipset AMD B450 e socket AM4. Suporta processadores AMD Ryzen até a série 5000 com suporte a overclock. Formato micro-ATX, 4 slots de memória DDR4 com suporte até 3600MHz, 6 portas SATA 6Gb/s, 2 slots M.2 (um com PCIe 3.0 x4 e outro com SATA), e slot PCIe 3.0 x16 reforçado. Áudio Realtek ALC887, rede Gigabit Intel e USB 3.1 Gen2. Perfeita para quem busca performance e recursos avançados.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 2500,
    sku: faker.string.uuid(),
    urlBanner: 'https://i.imgur.com/22S6hk4.jpeg',
  },
  {
    title: 'Placa-mãe Asus Prime X570-P - Socket AM4',
    subtitle: 'AMD X570 - PCIe 4.0 - Suporta Ryzen 5000 Series',
    description:
      'Placa-mãe Asus Prime X570-P com chipset AMD X570 de alta performance e socket AM4. Suporta processadores AMD Ryzen 5000 Series e anteriores com suporte completo a overclock. Formato ATX padrão, 4 slots de memória DDR4 com suporte até 4400MHz (OC), PCIe 4.0 para máxima velocidade de transferência, 8 portas SATA 6Gb/s, 2 slots M.2 PCIe 4.0 x4, e múltiplos slots PCIe para expansão. Áudio Realtek S1200A premium, rede Gigabit Intel, USB 3.2 Gen2 e refrigeração ativa do chipset. A escolha definitiva para builds de alto desempenho.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 3500,
    sku: faker.string.uuid(),
    urlBanner: 'https://i.imgur.com/22S6hk4.jpeg',
  },
];

export const memorySeed: Prisma.ProductCreateManyInput[] = [
  {
    title: 'Memória DDR4 Kingston Fury Beast 8GB 3200MHz',
    subtitle: '8GB (1x8GB) - 3200MHz - CL16 - XMP Ready',
    description:
      'Kit de memória DDR4 Kingston Fury Beast com 8GB de capacidade (1 módulo de 8GB), frequência de 3200MHz e latência CL16. Perfil XMP 2.0 para overclock automático, dissipador de calor preto com design agressivo, e compatibilidade garantida com as principais placas-mãe. Aumente o desempenho do seu computador com esta memória de alta performance, ideal para jogos, multitarefa e aplicações intensas. Garantia vitalícia Kingston.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 300,
    sku: faker.string.uuid(),
    urlBanner: 'https://i.imgur.com/wmIk00J.png',
  },
  {
    title: 'Memória DDR4 Kingston Fury Beast 16GB 3200MHz',
    subtitle: '16GB (2x8GB) - 3200MHz - CL16 - Dual Channel',
    description:
      'Kit de memória DDR4 Kingston Fury Beast com 16GB de capacidade (2 módulos de 8GB em dual channel), frequência de 3200MHz e latência CL16. Perfil XMP 2.0 para overclock automático, dissipador de calor preto premium, e otimizada para performance em dual channel. Desempenho excepcional para jogos modernos, streaming, edição de vídeo e aplicações profissionais. A escolha ideal para quem busca o equilíbrio perfeito entre capacidade e velocidade.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 400,
    sku: faker.string.uuid(),
    urlBanner: 'https://i.imgur.com/wmIk00J.png',
  },
  {
    title: 'Memória DDR4 Kingston Fury Beast 32GB 3200MHz',
    subtitle: '32GB (2x16GB) - 3200MHz - CL16 - Dual Channel Premium',
    description:
      'Kit de memória DDR4 Kingston Fury Beast com 32GB de capacidade (2 módulos de 16GB em dual channel), frequência de 3200MHz e latência CL16. Perfil XMP 2.0 para overclock automático, dissipador de calor preto premium com design gamer, e otimizada para máxima performance em dual channel. Capacidade generosa para multitarefa pesada, renderização 3D, edição 4K, virtualização e workstations profissionais. A solução definitiva para usuários que exigem máxima capacidade e performance.',
    discount: Number(Math.floor(Math.random() * 100)),
    price: 500,
    sku: faker.string.uuid(),
    urlBanner: 'https://i.imgur.com/wmIk00J.png',
  },
];

export const miceSeed: Prisma.ProductCreateManyInput[] = [
  {
    sku: faker.string.uuid(),
    title: 'Mouse Dragon - Óptico com Iluminação RGB',
    subtitle: 'Sensor 16000 DPI - 12 Botões Programáveis - RGB',
    description:
      'Mouse óptico Dragon com sensor de alta precisão ajustável até 16000 DPI, velocidade de rastreamento de 400 IPS e aceleração de 50G. Controle de 12 botões programáveis para macros e atalhos personalizados. Iluminação RGB com múltiplos modos de efeito, ajuste de peso personalizável, e design ambidestro para uso com mão esquerda ou direita. Superfície de contato PTFE para deslizamento suave. Ideal para jogos casuais e trabalho diário.',
    urlBanner: 'https://i.imgur.com/oREVNQt.png',
    price: 40,
    discount: Number(Math.floor(Math.random() * 10)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Mouse Gamer Dragon Pro - Performance Profissional',
    subtitle: 'Sensor 16000 DPI - 12 Botões - RGB Customizável - Software',
    description:
      'Mouse gamer profissional Dragon Pro com sensor óptico de última geração ajustável até 16000 DPI em 5 níveis, velocidade de rastreamento de 400 IPS e aceleração de 50G. 12 botões programáveis com software dedicado para macros complexas e perfis personalizados. Iluminação RGB endereçável com 16.8 milhões de cores e efeitos sincronizáveis. Sistema de ajuste de peso granular, switches ópticos com 50 milhões de cliques, design ergonômico para grip palm ou claw, e superfície PTFE premium. A escolha dos gamers competitivos.',
    urlBanner: 'https://i.imgur.com/oREVNQt.png',
    price: 80,
    discount: Number(Math.floor(Math.random() * 10)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Mouse Letron - Básico e Funcional',
    subtitle: 'Sensor 16000 DPI - 12 Botões - RGB - Design Ergonômico',
    description:
      'Mouse Letron com sensor óptico de alta precisão ajustável até 16000 DPI, velocidade de 400 IPS e aceleração de 50G. 12 botões programáveis para maior produtividade, iluminação RGB com efeitos personalizáveis, e design ergonômico confortável para longas sessões. Ajuste de peso opcional, suporte ambidestro, e superfície de deslizamento otimizada. Excelente custo-benefício para uso geral e jogos casuais.',
    urlBanner: 'https://i.imgur.com/oREVNQt.png',
    price: 30,
    discount: Number(Math.floor(Math.random() * 10)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Mouse Gamer Letron Elite - Máxima Precisão',
    subtitle: 'Sensor 16000 DPI - 12 Botões - RGB Premium - Wireless Opcional',
    description:
      'Mouse gamer Letron Elite com sensor óptico de precisão profissional ajustável até 16000 DPI, velocidade de rastreamento de 400 IPS e aceleração de 50G. 12 botões programáveis com software avançado, iluminação RGB premium com sincronização, e design ergonômico premium para máximo conforto. Switches mecânicos de alta durabilidade, ajuste de peso personalizado, cabo trançado flexível, e opção de uso wireless de baixa latência. A ferramenta definitiva para gamers profissionais e entusiastas.',
    urlBanner: 'https://i.imgur.com/oREVNQt.png',
    price: 100,
    discount: Number(Math.floor(Math.random() * 10)),
  },
];

export const keyboardsSeed: Prisma.ProductCreateManyInput[] = [
  {
    sku: faker.string.uuid(),
    title: 'Teclado Mecânico Gamer RGB - Switches Blue',
    subtitle: 'Layout Full Size - 19 Modos RGB - 12 Teclas Multimídia',
    description:
      'Teclado mecânico gamer completo com switches mecânicos Blue (clicky) que oferecem feedback tátil e sonoro satisfatório. Layout full size com teclado numérico, 19 modos de iluminação RGB incluindo modo de personalização individual de teclas com 16.8 milhões de cores, e 12 teclas dedicadas para controle multimídia. Construção robusta em alumínio, teclas com keycaps ABS de alta qualidade, anti-ghosting N-key rollover, e design ergonômico com apoio de pulso removível. Perfeito para gamers e profissionais que buscam precisão e estilo.',
    urlBanner: 'https://i.imgur.com/ECUixqO.png',
    price: 300,
    discount: Number(Math.floor(Math.random() * 100)),
  },
  {
    sku: faker.string.uuid(),
    title: 'Teclado Mecânico RGB - Switches Red',
    subtitle: 'Layout Full Size - 19 Modos RGB - Multimídia',
    description:
      'Teclado mecânico com switches mecânicos Red (lineares) que oferecem resposta rápida e silenciosa, ideal para jogos de ação rápida e digitação profissional. Layout full size completo, 19 modos de iluminação RGB com personalização individual de teclas, e 12 teclas para controle multimídia. Construção sólida, anti-ghosting completo, keycaps duráveis, e design moderno com apoio de pulso integrado. Excelente custo-benefício para quem busca qualidade mecânica acessível.',
    urlBanner: 'https://i.imgur.com/ECUixqO.png',
    price: 200,
    discount: Number(Math.floor(Math.random() * 100)),
  },
];
