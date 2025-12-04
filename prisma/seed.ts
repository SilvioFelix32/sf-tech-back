import { PrismaClient } from '@prisma/client';
import { companiesSeed } from './seeds.ts/companies';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Limpando dados das tabelas do projeto...');
  
  await prisma.product.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.company.deleteMany({});

  console.log('✅ Dados limpos com sucesso!');
  console.log('🌱 Iniciando seed...');

  await Promise.all(
    companiesSeed.map(async (company) => {
      await prisma.company.create({
        data: company,
      });
    }),
  );

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((err) => {
    console.error('❌ Erro ao executar seed:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
