import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CompaniesController } from './infra/companies.controller';
import { CompaniesService } from './services/companies.service';

@Module({
  imports: [],
  controllers: [CompaniesController],
  providers: [PrismaService, CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
