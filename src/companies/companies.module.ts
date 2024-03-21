import { Module } from '@nestjs/common';
import { PrismaService } from '../infraestructure/prisma/prisma.service';
import { CompaniesController } from './infra/companies.controller';
import { CompaniesService } from './services/companies.service';

@Module({
  controllers: [CompaniesController],
  exports: [CompaniesService],
  imports: [],
  providers: [PrismaService, CompaniesService],
})
export class CompaniesModule {}
